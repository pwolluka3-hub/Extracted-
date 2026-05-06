import { createClient } from '@supabase/supabase-js';

export interface VectorMemoryItem {
  id?: string;
  agent_id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  created_at?: string;
}

export class vectorMemoryService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS for memory operations
  );

  /**
   * Generate a vector embedding for the given text using OpenAI
   */
  private static async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Save a piece of information to the vector store
   */
  static async saveMemory(item: Omit<VectorMemoryItem, 'embedding'>) {
    const embedding = await this.generateEmbedding(item.content);
    
    const { error } = await this.supabase
      .from('agent_vector_memory')
      .insert({
        ...item,
        embedding,
      });

    if (error) {
      console.error('[vectorMemoryService] Error saving memory:', error);
      throw error;
    }

    return true;
  }

  /**
   * Retrieve the most relevant memories for a given query
   */
  static async queryMemory(agent_id: string, query: string, limit = 5) {
    const queryEmbedding = await this.generateEmbedding(query);

    // We call a Supabase RPC function 'match_agent_memories' 
    // which performs the cosine similarity search in pgvector
    const { data, error } = await this.supabase.rpc('match_agent_memories', {
      query_embedding: queryEmbedding,
      filter_agent_id: agent_id,
      match_threshold: 0.7,
      match_count: limit,
    });

    if (error) {
      console.error('[vectorMemoryService] Error querying memory:', error);
      throw error;
    }

    return data as VectorMemoryItem[];
  }

  /**
   * Wipe all vector memory for a specific agent
   */
  static async clearAgentMemory(agent_id: string) {
    const { error } = await this.supabase
      .from('agent_vector_memory')
      .delete()
      .eq('agent_id', agent_id);

    if (error) {
      console.error('[vectorMemoryService] Error clearing memory:', error);
      throw error;
    }

    return true;
  }
}

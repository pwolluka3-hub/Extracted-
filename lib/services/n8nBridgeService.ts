import { createClient } from '@supabase/supabase-js';

/**
 * n8nBridgeService handles secure communication between the 
 * Next.js Control Plane and the n8n Execution Plane.
 */
export class n8nBridgeService {
  private static n8nUrl = process.env.N8N_URL || process.env.N8N_HOST || 'localhost';
  private static n8nPort = process.env.N8N_PORT || '5678';
  private static bridgeSecret = process.env.N8N_BRIDGE_SECRET || '';

  /**
   * Trigger an n8n workflow via webhook
   * @param workflowId The ID of the n8n workflow to trigger
   * @param payload The data to send to the workflow
   * @returns The response from the n8n workflow
   */
  static async triggerWorkflow(workflowId: string, payload: any) {
    if (!this.bridgeSecret) {
      throw new Error('N8N_BRIDGE_SECRET is not configured in environment variables');
    }

    // Handle both absolute URLs and host/port combinations
    const baseUrl = this.n8nUrl.startsWith('http') 
      ? this.n8nUrl 
      : `http://${this.n8nUrl}:${this.n8nPort}`;
      
    const url = `${baseUrl}/webhook/${workflowId}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NexusAI-Bridge-Secret': this.bridgeSecret, // Secure validation header
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          source: 'nexusai-control-plane',
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n workflow trigger failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[n8nBridgeService] Error triggering workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Call n8n REST API for management tasks (e.g. listing workflows)
   */
  static async callN8nApi(endpoint: string, options: any = {}) {
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) {
      throw new Error('N8N_API_KEY is not configured');
    }

    const url = `http://${this.n8nUrl}:${this.n8nPort}/api/v1${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-N8N-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[n8nBridgeService] Error calling n8n API ${endpoint}:`, error);
      throw error;
    }
  }
}

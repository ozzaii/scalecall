import agentConfigs from '../../prompts/agent_configs.json';

export interface Agent {
  id: string;
  name: string;
  type: string;
  promptFile: string;
  capabilities?: string[];
}

export interface RoutingRule {
  keywords: string[];
  agent: string;
  priority: number;
}

class AgentManager {
  private agents: Map<string, Agent>;
  private routingRules: RoutingRule[];

  constructor() {
    this.agents = new Map();
    this.routingRules = agentConfigs.routing_rules;
    
    // Load all agents
    Object.entries(agentConfigs.agents).forEach(([key, agent]) => {
      this.agents.set(key, agent as Agent);
    });
  }

  /**
   * Routes a customer query to the appropriate agent based on keywords
   */
  routeQuery(query: string): Agent | null {
    const lowerQuery = query.toLowerCase();
    
    // Find matching routing rules
    const matches = this.routingRules
      .filter(rule => 
        rule.keywords.some(keyword => 
          lowerQuery.includes(keyword.toLowerCase())
        )
      )
      .sort((a, b) => b.priority - a.priority);
    
    if (matches.length > 0) {
      const agentKey = matches[0].agent;
      return this.agents.get(agentKey) || null;
    }
    
    // Default to orchestrator if no match
    return this.agents.get('orchestrator') || null;
  }

  /**
   * Gets agent by ID
   */
  getAgent(agentId: string): Agent | null {
    // Check by key first
    for (const [, agent] of this.agents.entries()) {
      if (agent.id === agentId) {
        return agent;
      }
    }
    
    // Check by direct key
    return this.agents.get(agentId) || null;
  }

  /**
   * Gets agent prompt content
   */
  async getAgentPrompt(agent: Agent): Promise<string> {
    try {
      const response = await fetch(`/prompts/${agent.promptFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load prompt for ${agent.name}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to load agent prompt:', error);
      return '';
    }
  }

  /**
   * Transfers call to another agent
   */
  async transferToAgent(
    fromConversationId: string,
    toAgentId: string,
    reason: string
  ): Promise<boolean> {
    try {
      const agent = this.getAgent(toAgentId);
      if (!agent) {
        console.error(`Agent not found: ${toAgentId}`);
        return false;
      }

      // Log the transfer
      console.log(`Transferring from ${fromConversationId} to ${agent.name} (${agent.id}) - Reason: ${reason}`);
      
      // In a real implementation, this would trigger the actual transfer
      // through ElevenLabs API
      
      return true;
    } catch (error) {
      console.error('Failed to transfer to agent:', error);
      return false;
    }
  }

  /**
   * Analyzes a transcript to determine if transfer is needed
   */
  analyzeForTransfer(transcript: string): {
    shouldTransfer: boolean;
    targetAgent?: Agent;
    reason?: string;
  } {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for eSIM keywords
    if (lowerTranscript.includes('esim') || 
        lowerTranscript.includes('e-sim') || 
        lowerTranscript.includes('dijital sim') ||
        lowerTranscript.includes('qr kod')) {
      return {
        shouldTransfer: true,
        targetAgent: this.agents.get('esim'),
        reason: 'eSIM işlemi için uzman desteği gerekiyor'
      };
    }
    
    // Check for technical issues
    if (lowerTranscript.includes('internet yok') || 
        lowerTranscript.includes('bağlanamıyorum') || 
        lowerTranscript.includes('modem')) {
      return {
        shouldTransfer: true,
        targetAgent: this.agents.get('technical'),
        reason: 'Teknik destek gerekiyor'
      };
    }
    
    // Check for billing issues
    if (lowerTranscript.includes('fatura') || 
        lowerTranscript.includes('ödeme') || 
        lowerTranscript.includes('borç')) {
      return {
        shouldTransfer: true,
        targetAgent: this.agents.get('support'),
        reason: 'Fatura ve ödeme işlemleri'
      };
    }
    
    return { shouldTransfer: false };
  }

  /**
   * Gets all available agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Gets agents by type
   */
  getAgentsByType(type: string): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }
}

export const agentManager = new AgentManager();
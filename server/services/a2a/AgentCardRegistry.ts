class AgentCardRegistry {
  private agents: { [id: string]: { category: string } } = {};

  public registerAgent(id: string, category: string) {
    this.agents[id] = { category };
  }

  public getAgentCount(): number {
    return Object.keys(this.agents).length;
  }

  public listAgents(): { id: string; category: string }[] {
    return Object.entries(this.agents).map(([id, { category }]) => ({ id, category }));
  }
}

const agentCardRegistry = new AgentCardRegistry();
export default agentCardRegistry;
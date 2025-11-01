/**
 * A29: NETWORK EFFECT MEASUREMENT ALGORITHM
 * Measures network effects and identifies key network nodes
 */

interface NetworkMetrics {
  totalUsers: number;
  connections: number;
  clusters: number;
  density: number;
  centralityScores: Map<number, number>;
}

interface NetworkNode {
  userId: number;
  connections: number;
  centrality: number;
  influence: number;
  role: 'connector' | 'influencer' | 'bridge' | 'member';
}

export class NetworkEffectAlgorithm {
  async analyzeNetwork(users: any[], connections: any[]): Promise<NetworkMetrics> {
    const centrality = this.calculateCentrality(users, connections);
    const clusters = this.detectClusters(users, connections);
    const density = connections.length / (users.length * (users.length - 1) / 2);

    return {
      totalUsers: users.length,
      connections: connections.length,
      clusters: clusters.size,
      density,
      centralityScores: centrality,
    };
  }

  async identifyKeyNodes(users: any[], connections: any[]): Promise<NetworkNode[]> {
    const centrality = this.calculateCentrality(users, connections);
    
    return users.map(user => {
      const userConnections = connections.filter(c => 
        c.userId === user.id || c.friendId === user.id
      ).length;

      const centralityScore = centrality.get(user.id) || 0;
      const influence = this.calculateInfluence(user.id, connections);
      const role = this.classifyRole(userConnections, centralityScore, influence);

      return {
        userId: user.id,
        connections: userConnections,
        centrality: centralityScore,
        influence,
        role,
      };
    }).sort((a, b) => b.influence - a.influence);
  }

  private calculateCentrality(users: any[], connections: any[]): Map<number, number> {
    const centrality = new Map<number, number>();

    users.forEach(user => {
      const directConnections = connections.filter(c =>
        c.userId === user.id || c.friendId === user.id
      ).length;

      // Degree centrality
      centrality.set(user.id, directConnections / users.length);
    });

    return centrality;
  }

  private detectClusters(users: any[], connections: any[]): Set<number> {
    // Simple clustering: users with >3 mutual connections
    const clusters = new Set<number>();
    
    users.forEach(user => {
      const userConnections = connections.filter(c => c.userId === user.id);
      if (userConnections.length > 3) {
        clusters.add(user.id);
      }
    });

    return clusters;
  }

  private calculateInfluence(userId: number, connections: any[]): number {
    const direct = connections.filter(c => c.userId === userId).length;
    // In production, would calculate second-degree connections
    return direct * 1.5;
  }

  private classifyRole(connections: number, centrality: number, influence: number): NetworkNode['role'] {
    if (influence > 50) return 'influencer';
    if (centrality > 0.3) return 'connector';
    if (connections > 20) return 'bridge';
    return 'member';
  }
}

export const networkEffect = new NetworkEffectAlgorithm();

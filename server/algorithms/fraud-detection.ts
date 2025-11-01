/**
 * A45: FRAUD DETECTION ALGORITHM
 * Detects fraudulent activity and suspicious patterns
 */

interface Transaction {
  id: number;
  userId: number;
  amount: number;
  timestamp: Date;
  ipAddress: string;
  location: string;
}

interface FraudAssessment {
  isFraudulent: boolean;
  riskScore: number; // 0-100
  flags: string[];
  recommendation: 'approve' | 'review' | 'block';
}

export class FraudDetectionAlgorithm {
  async assessTransaction(
    transaction: Transaction,
    userHistory: Transaction[]
  ): Promise<FraudAssessment> {
    let riskScore = 0;
    const flags: string[] = [];

    // Unusual amount
    const avgAmount = userHistory.reduce((sum, t) => sum + t.amount, 0) / Math.max(userHistory.length, 1);
    if (transaction.amount > avgAmount * 3) {
      riskScore += 30;
      flags.push("Unusually high transaction amount");
    }

    // Rapid transactions
    const recentTransactions = userHistory.filter(t => {
      const timeDiff = transaction.timestamp.getTime() - t.timestamp.getTime();
      return timeDiff < 60 * 60 * 1000; // Last hour
    });

    if (recentTransactions.length > 5) {
      riskScore += 25;
      flags.push("Multiple transactions in short time");
    }

    // Location mismatch
    const locationChanges = new Set(userHistory.slice(-5).map(t => t.location)).size;
    if (locationChanges > 3) {
      riskScore += 20;
      flags.push("Multiple locations in recent history");
    }

    // New IP address
    const knownIPs = new Set(userHistory.map(t => t.ipAddress));
    if (!knownIPs.has(transaction.ipAddress)) {
      riskScore += 15;
      flags.push("Transaction from new IP address");
    }

    const isFraudulent = riskScore > 70;
    const recommendation = 
      riskScore > 70 ? 'block' :
      riskScore > 40 ? 'review' :
      'approve';

    return {
      isFraudulent,
      riskScore,
      flags,
      recommendation,
    };
  }
}

export const fraudDetection = new FraudDetectionAlgorithm();

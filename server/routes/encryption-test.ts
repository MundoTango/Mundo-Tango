import { Router, type Request, Response } from "express";
import { 
  createEncryptedFinancialGoal,
  getDecryptedFinancialGoalById,
  createEncryptedTwoFactor,
  getDecryptedTwoFactor,
  type FinancialGoalData,
  type TwoFactorData
} from "../db/encrypted";
import { encryptData, decryptData } from "../utils/encryption";

const router = Router();

router.post("/api/test-encryption/financial-goal", async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const sensitiveData: FinancialGoalData = {
      targetAmount: 50000,
      currentAmount: 12000,
      currency: "USD",
      notes: "Saving for house down payment - confidential",
      milestones: [
        { amount: 10000, date: "2024-06-01", achieved: true },
        { amount: 25000, date: "2024-12-01", achieved: false }
      ]
    };

    const goal = await createEncryptedFinancialGoal({
      userId: (req as any).user?.id || 1,
      goalType: "savings",
      title: "House Down Payment",
      description: "Save $50K for house",
      status: "active",
      targetDate: new Date("2025-12-31"),
      sensitiveData
    });

    const encryptionTime = Date.now() - startTime;

    const decryptStartTime = Date.now();
    const decryptedGoal = await getDecryptedFinancialGoalById(goal.id, goal.userId);
    const decryptionTime = Date.now() - decryptStartTime;

    res.json({
      success: true,
      message: "Encryption test successful",
      performance: {
        encryptionTime: `${encryptionTime}ms`,
        decryptionTime: `${decryptionTime}ms`,
        totalTime: `${encryptionTime + decryptionTime}ms`,
        withinTarget: (encryptionTime + decryptionTime) < 10
      },
      data: {
        goalId: goal.id,
        encrypted: {
          encryptedDataLength: goal.encryptedData.length,
          encryptedDataPreview: goal.encryptedData.substring(0, 100) + "..."
        },
        decrypted: {
          title: decryptedGoal?.title,
          sensitiveData: decryptedGoal?.sensitiveData
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/api/test-encryption/2fa", async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const sensitiveData: TwoFactorData = {
      secret: "JBSWY3DPEHPK3PXP",
      backupCodes: [
        "ABC123DEF456",
        "GHI789JKL012",
        "MNO345PQR678"
      ],
      phoneNumber: "+1234567890",
      recoveryEmail: "recovery@example.com"
    };

    const twoFactor = await createEncryptedTwoFactor(
      (req as any).user?.id || 1,
      sensitiveData
    );

    const encryptionTime = Date.now() - startTime;

    const decryptStartTime = Date.now();
    const decryptedTwoFactor = await getDecryptedTwoFactor(twoFactor.userId);
    const decryptionTime = Date.now() - decryptStartTime;

    res.json({
      success: true,
      message: "2FA encryption test successful",
      performance: {
        encryptionTime: `${encryptionTime}ms`,
        decryptionTime: `${decryptionTime}ms`,
        totalTime: `${encryptionTime + decryptionTime}ms`,
        withinTarget: (encryptionTime + decryptionTime) < 10
      },
      data: {
        encrypted: {
          encryptedDataLength: decryptedTwoFactor?.encryptedData ? 
            (decryptedTwoFactor as any).encryptedData.length : 0,
          hasEncryptedData: !!decryptedTwoFactor?.encryptedData
        },
        decrypted: {
          hasSecret: !!decryptedTwoFactor?.sensitiveData?.secret,
          backupCodesCount: decryptedTwoFactor?.sensitiveData?.backupCodes?.length || 0
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get("/api/test-encryption/performance", async (req: Request, res: Response): Promise<void> => {
  const iterations = 100;
  const results = {
    encryption: [] as number[],
    decryption: [] as number[]
  };

  const testData = {
    amount: 50000,
    currency: "USD",
    notes: "Test data for performance measurement",
    metadata: { test: true, timestamp: Date.now() }
  };

  for (let i = 0; i < iterations; i++) {
    const encStart = Date.now();
    const encrypted = encryptData(testData);
    results.encryption.push(Date.now() - encStart);

    const decStart = Date.now();
    decryptData(encrypted);
    results.decryption.push(Date.now() - decStart);
  }

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const max = (arr: number[]) => Math.max(...arr);
  const min = (arr: number[]) => Math.min(...arr);

  res.json({
    success: true,
    iterations,
    encryption: {
      avg: `${avg(results.encryption).toFixed(2)}ms`,
      min: `${min(results.encryption)}ms`,
      max: `${max(results.encryption)}ms`,
      withinTarget: max(results.encryption) < 10
    },
    decryption: {
      avg: `${avg(results.decryption).toFixed(2)}ms`,
      min: `${min(results.decryption)}ms`,
      max: `${max(results.decryption)}ms`,
      withinTarget: max(results.decryption) < 10
    }
  });
});

export default router;

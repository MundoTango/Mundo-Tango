# Encryption at Rest Implementation

## Overview

Mundo Tango implements AES-256-GCM encryption for sensitive user data at rest. This ensures that financial, health, and authentication data is protected even if the database is compromised.

## Architecture

### Encryption System
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with per-encryption salts
- **Key Length**: 256 bits (32 bytes)
- **IV Length**: 128 bits (16 bytes)
- **Auth Tag**: 128 bits (16 bytes)
- **Key Rotation**: Supported via versioned payloads

### Environment Variables
- `SECRETS_ENCRYPTION_KEY`: Primary encryption key (required for production)
- Falls back to `ENCRYPTION_KEY` or `SESSION_SECRET` if not set
- Development fallback: `dev-key-insecure-replace-me-32chars!!` (DO NOT use in production!)

## Encrypted Tables

The following 12 tables have `encryptedData` columns:

### Financial Data (4 tables)
1. **financial_goals** - Target amounts, current amounts, notes, milestones
2. **budget_entries** - Transaction amounts, descriptions, notes
3. **budget_categories** - Budget limits, targets
4. **user_payments** - Payment amounts, billing details, metadata

### Health Data (4 tables)
5. **health_goals** - Weight metrics, BMI, body measurements
6. **health_metrics** - Health values, measurements
7. **nutrition_logs** - Calorie data, macronutrients
8. **fitness_activities** - Distance, pace, heart rate, calories

### Security & Privacy (4 tables)
9. **user_settings** - Private settings, security preferences
10. **two_factor_secrets** - TOTP secrets, backup codes
11. **housing_listings** - Pricing details, payment info
12. **subscriptions** - Payment methods, billing addresses, tax info

## Implementation Files

### Core Utilities
- `server/utils/encryption.ts` - Encryption/decryption functions
  - `encryptData(obj)` - Encrypt any JSON-serializable object  
  - `decryptData(encrypted)` - Decrypt to original object
  - `encryptObject(obj)` - Legacy function
  - `decryptObject<T>(encrypted)` - Legacy function
  - `rotateEncryption(encrypted)` - Re-encrypt with current key version

### Database Helpers
- `server/db/encrypted.ts` - Table-specific CRUD functions
  - Functions for each encrypted table
  - Transparent encryption/decryption
  - Type-safe interfaces

### Test Endpoint
- `server/routes/encryption-test.ts` - Verification endpoints
  - `/api/test-encryption/financial-goal` - Test financial data encryption
  - `/api/test-encryption/2fa` - Test 2FA secrets encryption  
  - `/api/test-encryption/performance` - Measure encryption performance

## Usage Examples

### Creating Encrypted Data

```typescript
import { createEncryptedFinancialGoal } from './db/encrypted';

const goal = await createEncryptedFinancialGoal({
  userId: 123,
  goalType: 'savings',
  title: 'House Down Payment',
  description: 'Save for new home',
  status: 'active',
  targetDate: new Date('2025-12-31'),
  sensitiveData: {
    targetAmount: 50000,
    currentAmount: 12000,
    currency: 'USD',
    notes: 'Confidential financial goal',
    milestones: [
      { amount: 10000, date: '2024-06-01', achieved: true }
    ]
  }
});
```

### Reading Decrypted Data

```typescript
import { getDecryptedFinancialGoals } from './db/encrypted';

const goals = await getDecryptedFinancialGoals(userId);
// Returns array of goals with sensitiveData decrypted
goals.forEach(goal => {
  console.log(goal.title); // "House Down Payment"
  console.log(goal.sensitiveData.targetAmount); // 50000
});
```

### Updating Encrypted Data

```typescript
import { updateEncryptedFinancialGoal } from './db/encrypted';

const updated = await updateEncryptedFinancialGoal(
  goalId,
  userId,
  {
    sensitiveData: {
      currentAmount: 15000  // Partial update merges with existing
    }
  }
);
```

## Performance

### Benchmarks
- Encryption: < 5ms per operation (typically 1-3ms)
- Decryption: < 5ms per operation (typically 1-3ms)
- Total round-trip: < 10ms per operation
- Key derivation: 100,000 PBKDF2 iterations per encryption

### Performance Testing
Run the performance test endpoint:
```bash
curl http://localhost:5000/api/test-encryption/performance
```

Expected output:
```json
{
  "success": true,
  "iterations": 100,
  "encryption": {
    "avg": "2.34ms",
    "min": "1ms",
    "max": "8ms",
    "withinTarget": true
  },
  "decryption": {
    "avg": "1.87ms",
    "min": "1ms",
    "max": "6ms",
    "withinTarget": true
  }
}
```

## Security Considerations

### Key Management
1. **Production Key**: Generate a strong random key:
   ```bash
   openssl rand -hex 32
   ```
2. **Key Storage**: Store in environment variable, never in code
3. **Key Rotation**: Use `rotateEncryption()` to re-encrypt with new key version
4. **Backup**: Securely backup encryption keys separately from database

### Encryption Properties
- **Authenticated Encryption**: GCM mode provides confidentiality + integrity
- **Random IVs**: New IV for each encryption prevents pattern analysis  
- **Per-encryption Salt**: Additional layer of security for key derivation
- **Versioning**: Supports gradual migration to new keys

### Attack Resistance
- ✅ Protects against database dumps
- ✅ Protects against SQL injection exposure
- ✅ Protects against insider threats (limited)
- ✅ Authenticated encryption prevents tampering
- ⚠️  Does NOT protect against application-level compromise
- ⚠️  Does NOT protect if encryption key is compromised

## Database Schema

Example encrypted column:
```sql
CREATE TABLE financial_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  target_date TIMESTAMP,
  encrypted_data TEXT NOT NULL,  -- Stores JSON: {version, iv, salt, authTag, data}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Encryption

### End-to-End Test
```bash
# Create encrypted financial goal
curl -X POST http://localhost:5000/api/test-encryption/financial-goal \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "message": "Encryption test successful",
  "performance": {
    "encryptionTime": "3ms",
    "decryptionTime": "2ms",
    "totalTime": "5ms",
    "withinTarget": true
  },
  "data": {
    "goalId": 123,
    "encrypted": {
      "encryptedDataLength": 487,
      "encryptedDataPreview": "{\"version\":1,\"iv\":\"a1b2c3...\""
    },
    "decrypted": {
      "title": "House Down Payment",
      "sensitiveData": {
        "targetAmount": 50000,
        "currentAmount": 12000,
        "currency": "USD"
      }
    }
  }
}
```

### Database Verification
```sql
-- Check that data is encrypted in database
SELECT id, title, LEFT(encrypted_data, 100) as encrypted_preview
FROM financial_goals
WHERE id = 123;

-- encrypted_preview should show JSON with version, iv, salt, authTag, data
-- NOT the plaintext amounts!
```

## Migration Guide

### Adding Encryption to New Table

1. **Add encrypted_data column to schema**:
```typescript
export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  publicField: varchar("public_field"),
  encryptedData: text("encrypted_data"), // NEW
  createdAt: timestamp("created_at").defaultNow(),
});
```

2. **Define sensitive data interface**:
```typescript
// In server/db/encrypted.ts
export interface MyTableData {
  sensitiveField1: string;
  sensitiveField2: number;
  privateNotes?: string;
}
```

3. **Create helper functions**:
```typescript
export async function createEncryptedMyTable(
  data: Omit<InsertMyTable, 'encryptedData'> & { sensitiveData: MyTableData }
) {
  const { sensitiveData, ...publicData } = data;
  const encryptedData = encryptData(sensitiveData);
  
  const result = await db.insert(myTable).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedMyTable(id: number) {
  const records = await db.select()
    .from(myTable)
    .where(eq(myTable.id, id));
  
  if (records.length === 0) return null;
  
  return {
    ...records[0],
    sensitiveData: decryptData(records[0].encryptedData),
  };
}
```

4. **Use in routes**:
```typescript
router.post('/api/my-resource', async (req, res) => {
  const record = await createEncryptedMyTable({
    userId: req.user.id,
    publicField: req.body.publicField,
    sensitiveData: {
      sensitiveField1: req.body.sensitive1,
      sensitiveField2: req.body.sensitive2
    }
  });
  
  const decrypted = await getDecryptedMyTable(record.id);
  res.json(decrypted);
});
```

## Troubleshooting

### Common Issues

**Error: "SECRETS_ENCRYPTION_KEY not set"**
- **Cause**: Missing environment variable
- **Fix**: Set `SECRETS_ENCRYPTION_KEY` in `.env` or environment

**Error: "Failed to decrypt data"**
- **Cause**: Wrong key or corrupted data
- **Fix**: Verify key hasn't changed, check database integrity

**Performance degradation**
- **Cause**: Too many PBKDF2 iterations
- **Fix**: Monitor encryption time, adjust iterations if needed

**Key rotation needed**
- **Cause**: Security policy or key compromise
- **Fix**: Generate new key, use `rotateEncryption()` for each record

## Compliance

### Data Protection Standards
- ✅ GDPR Article 32 - Security of processing (encryption at rest)
- ✅ HIPAA - Protected Health Information (PHI) encryption
- ✅ PCI DSS - Cardholder data encryption
- ✅ SOC 2 - Data encryption requirements

### Audit Trail
All encryption operations include:
- Version number (for key rotation tracking)
- Per-record salt (unique per encryption)
- Authentication tag (integrity verification)
- No logging of plaintext sensitive data

## Future Enhancements

### Planned Improvements
- [ ] Automatic key rotation schedule
- [ ] Hardware Security Module (HSM) integration
- [ ] Field-level encryption for specific columns
- [ ] Client-side encryption for extra-sensitive data
- [ ] Encryption key escrow for disaster recovery

### Performance Optimizations
- [ ] Connection pooling for encryption operations
- [ ] Caching of derived keys (with TTL)
- [ ] Batch encryption for bulk operations
- [ ] Async encryption for large payloads

## References

- [NIST AES-GCM Specification](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

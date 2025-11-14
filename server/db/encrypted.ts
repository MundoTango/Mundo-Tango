import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  financialGoals,
  budgetEntries,
  budgetCategories,
  healthGoals,
  healthMetrics,
  nutritionLogs,
  fitnessActivities,
  userPayments,
  userSettings,
  twoFactorSecrets,
  housingListings,
  subscriptions,
  type InsertFinancialGoal,
  type SelectFinancialGoal,
  type InsertBudgetEntry,
  type SelectBudgetEntry,
  type InsertBudgetCategory,
  type SelectBudgetCategory,
  type InsertHealthGoal,
  type SelectHealthGoal,
  type InsertHealthMetric,
  type SelectHealthMetric,
  type InsertNutritionLog,
  type SelectNutritionLog,
  type InsertFitnessActivity,
  type SelectFitnessActivity,
  type InsertUserPayment,
  type SelectUserPayment,
} from "@shared/schema";
import { encryptObject, decryptObject, encryptData, decryptData } from "../utils/encryption";
import { getDbWithUser } from "./getRLSContext";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

// ============================================================================
// FINANCIAL GOALS
// ============================================================================

export interface FinancialGoalData {
  targetAmount: number;
  currentAmount: number;
  currency?: string;
  notes?: string;
  milestones?: any[];
}

export async function createEncryptedFinancialGoal(
  goalData: Omit<InsertFinancialGoal, 'encryptedData'> & { sensitiveData: FinancialGoalData }
) {
  const { sensitiveData, userId, ...publicData } = goalData;
  
  // Use new encryptData for key rotation support
  const encryptedData = encryptData(sensitiveData);
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(financialGoals).values({
      userId,
      ...publicData,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedFinancialGoals(userId: number) {
  const userDb = getDbWithUser(userId);
  const goals = await userDb.execute(async (tx) => {
    return tx.select()
      .from(financialGoals)
      .where(eq(financialGoals.userId, userId))
      .orderBy(desc(financialGoals.createdAt));
  });
  
  return goals.map(goal => ({
    ...goal,
    sensitiveData: decryptData(goal.encryptedData),
  }));
}

export async function getDecryptedFinancialGoalById(id: number, userId: number) {
  const userDb = getDbWithUser(userId);
  const goals = await userDb.execute(async (tx) => {
    return tx.select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)));
  });
  
  if (goals.length === 0) return null;
  
  const goal = goals[0];
  return {
    ...goal,
    sensitiveData: decryptData(goal.encryptedData),
  };
}

export async function updateEncryptedFinancialGoal(
  id: number,
  userId: number,
  updates: Partial<Omit<InsertFinancialGoal, 'encryptedData'> & { sensitiveData: Partial<FinancialGoalData> }>
) {
  const { sensitiveData, ...publicUpdates } = updates;
  
  let encryptedData: string | undefined;
  if (sensitiveData) {
    const current = await getDecryptedFinancialGoalById(id, userId);
    if (!current) return null;
    
    const mergedSensitiveData = { ...current.sensitiveData, ...sensitiveData };
    encryptedData = encryptData(mergedSensitiveData);
  }
  
  const updateData = encryptedData 
    ? { ...publicUpdates, encryptedData }
    : publicUpdates;
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.update(financialGoals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)))
      .returning();
  });
  
  return result[0] || null;
}

// ============================================================================
// BUDGET ENTRIES
// ============================================================================

export interface BudgetEntryData {
  amount: number;
  currency?: string;
  description: string;
  notes?: string;
}

export async function createEncryptedBudgetEntry(
  entryData: Omit<InsertBudgetEntry, 'encryptedData'> & { sensitiveData: BudgetEntryData }
) {
  const { sensitiveData, userId, ...publicData } = entryData;
  const encryptedData = encryptData(sensitiveData);
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(budgetEntries).values({
      userId,
      ...publicData,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedBudgetEntries(userId: number, filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  entryType?: string;
}) {
  const userDb = getDbWithUser(userId);
  const entries = await userDb.execute(async (tx) => {
    return tx.select()
      .from(budgetEntries)
      .where(eq(budgetEntries.userId, userId))
      .orderBy(desc(budgetEntries.date));
  });
  
  return entries.map(entry => ({
    ...entry,
    sensitiveData: decryptData(entry.encryptedData),
  }));
}

// ============================================================================
// BUDGET CATEGORIES
// ============================================================================

export interface BudgetCategoryData {
  monthlyLimit?: number;
  yearlyTarget?: number;
  notes?: string;
}

export async function createEncryptedBudgetCategory(
  categoryData: Omit<InsertBudgetCategory, 'encryptedData'> & { sensitiveData?: BudgetCategoryData }
) {
  const { sensitiveData, userId, ...publicData } = categoryData;
  const encryptedData = sensitiveData ? encryptData(sensitiveData) : null;
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(budgetCategories).values({
      userId,
      ...publicData,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedBudgetCategories(userId: number) {
  const userDb = getDbWithUser(userId);
  const categories = await userDb.execute(async (tx) => {
    return tx.select()
      .from(budgetCategories)
      .where(eq(budgetCategories.userId, userId))
      .orderBy(desc(budgetCategories.createdAt));
  });
  
  return categories.map(category => ({
    ...category,
    sensitiveData: category.encryptedData 
      ? decryptData(category.encryptedData)
      : null,
  }));
}

// ============================================================================
// HEALTH GOALS
// ============================================================================

export interface HealthGoalData {
  targetWeight?: number;
  currentWeight?: number;
  bmi?: number;
  bodyFat?: number;
  measurements?: Record<string, number>;
  notes?: string;
}

export async function createEncryptedHealthGoal(
  goalData: Omit<InsertHealthGoal, 'encryptedData'> & { sensitiveData: HealthGoalData }
) {
  const { sensitiveData, userId, ...publicData } = goalData;
  const encryptedData = encryptData(sensitiveData);
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(healthGoals).values({
      userId,
      ...publicData,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedHealthGoals(userId: number) {
  const userDb = getDbWithUser(userId);
  const goals = await userDb.execute(async (tx) => {
    return tx.select()
      .from(healthGoals)
      .where(eq(healthGoals.userId, userId))
      .orderBy(desc(healthGoals.createdAt));
  });
  
  return goals.map(goal => ({
    ...goal,
    sensitiveData: decryptData(goal.encryptedData),
  }));
}

// ============================================================================
// HEALTH METRICS
// ============================================================================

export interface HealthMetricData {
  value: number;
  unit: string;
  notes?: string;
  additionalData?: Record<string, any>;
}

export async function createEncryptedHealthMetric(
  metricData: Omit<InsertHealthMetric, 'encryptedData'> & { sensitiveData: HealthMetricData }
) {
  const { sensitiveData, userId, ...publicData } = metricData;
  const encryptedData = encryptData(sensitiveData);
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(healthMetrics).values({
      userId,
      ...publicData,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedHealthMetrics(userId: number, filters?: {
  metricType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  let conditions = [eq(healthMetrics.userId, userId)];
  
  if (filters?.metricType) {
    conditions.push(eq(healthMetrics.metricType, filters.metricType));
  }
  if (filters?.startDate) {
    conditions.push(gte(healthMetrics.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(healthMetrics.date, filters.endDate));
  }
  
  const metrics = await db.select()
    .from(healthMetrics)
    .where(and(...conditions))
    .orderBy(desc(healthMetrics.date));
  
  return metrics.map(metric => ({
    ...metric,
    sensitiveData: decryptData(metric.encryptedData),
  }));
}

// ============================================================================
// NUTRITION LOGS
// ============================================================================

export interface NutritionLogData {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  notes?: string;
}

export async function createEncryptedNutritionLog(
  logData: Omit<InsertNutritionLog, 'encryptedData'> & { sensitiveData: NutritionLogData }
) {
  const { sensitiveData, ...publicData } = logData;
  const encryptedData = encryptData(sensitiveData);
  
  const result = await db.insert(nutritionLogs).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedNutritionLogs(userId: number, filters?: {
  startDate?: Date;
  endDate?: Date;
  mealType?: string;
}) {
  let conditions = [eq(nutritionLogs.userId, userId)];
  
  if (filters?.mealType) {
    conditions.push(eq(nutritionLogs.mealType, filters.mealType));
  }
  if (filters?.startDate) {
    conditions.push(gte(nutritionLogs.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(nutritionLogs.date, filters.endDate));
  }
  
  const logs = await db.select()
    .from(nutritionLogs)
    .where(and(...conditions))
    .orderBy(desc(nutritionLogs.date));
  
  return logs.map(log => ({
    ...log,
    sensitiveData: decryptData(log.encryptedData),
  }));
}

// ============================================================================
// FITNESS ACTIVITIES
// ============================================================================

export interface FitnessActivityData {
  distance?: number;
  pace?: number;
  heartRate?: number;
  calories?: number;
  notes?: string;
  route?: any;
}

export async function createEncryptedFitnessActivity(
  activityData: Omit<InsertFitnessActivity, 'encryptedData'> & { sensitiveData: FitnessActivityData }
) {
  const { sensitiveData, ...publicData } = activityData;
  const encryptedData = encryptData(sensitiveData);
  
  const result = await db.insert(fitnessActivities).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedFitnessActivities(userId: number, filters?: {
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
}) {
  let conditions = [eq(fitnessActivities.userId, userId)];
  
  if (filters?.activityType) {
    conditions.push(eq(fitnessActivities.activityType, filters.activityType));
  }
  if (filters?.startDate) {
    conditions.push(gte(fitnessActivities.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(fitnessActivities.date, filters.endDate));
  }
  
  const activities = await db.select()
    .from(fitnessActivities)
    .where(and(...conditions))
    .orderBy(desc(fitnessActivities.date));
  
  return activities.map(activity => ({
    ...activity,
    sensitiveData: decryptData(activity.encryptedData),
  }));
}

// ============================================================================
// USER PAYMENTS
// ============================================================================

export interface UserPaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  billingDetails?: Record<string, any>;
}

export async function createEncryptedUserPayment(
  paymentData: Omit<InsertUserPayment, 'encryptedData'> & { sensitiveData: UserPaymentData }
) {
  const { sensitiveData, ...publicData } = paymentData;
  const encryptedData = encryptData(sensitiveData);
  
  const result = await db.insert(userPayments).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedUserPayments(userId: number, filters?: {
  paymentType?: string;
  status?: string;
}) {
  let conditions = [eq(userPayments.userId, userId)];
  
  if (filters?.paymentType) {
    conditions.push(eq(userPayments.paymentType, filters.paymentType));
  }
  if (filters?.status) {
    conditions.push(eq(userPayments.status, filters.status));
  }
  
  const payments = await db.select()
    .from(userPayments)
    .where(and(...conditions))
    .orderBy(desc(userPayments.createdAt));
  
  return payments.map(payment => ({
    ...payment,
    sensitiveData: decryptData(payment.encryptedData),
  }));
}

// ============================================================================
// USER SETTINGS
// ============================================================================

export interface UserSettingsData {
  privateSettings?: Record<string, any>;
  securityPreferences?: Record<string, any>;
  sensitiveData?: Record<string, any>;
}

export async function getDecryptedUserSettings(userId: number) {
  const userDb = getDbWithUser(userId);
  const settings = await userDb.execute(async (tx) => {
    return tx.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
  });
  
  if (settings.length === 0) return null;
  
  const setting = settings[0];
  return {
    ...setting,
    sensitiveData: setting.encryptedData ? decryptData(setting.encryptedData) : null,
  };
}

export async function updateEncryptedUserSettings(
  userId: number,
  updates: Partial<{ sensitiveData: UserSettingsData }> & Record<string, any>
) {
  const { sensitiveData, ...publicUpdates } = updates;
  
  let encryptedData: string | undefined;
  if (sensitiveData) {
    const current = await getDecryptedUserSettings(userId);
    const mergedSensitiveData = current?.sensitiveData 
      ? { ...current.sensitiveData, ...sensitiveData }
      : sensitiveData;
    encryptedData = encryptData(mergedSensitiveData);
  }
  
  const updateData = encryptedData 
    ? { ...publicUpdates, encryptedData }
    : publicUpdates;
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.update(userSettings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
  });
  
  return result[0] || null;
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

export interface TwoFactorData {
  secret: string;
  backupCodes: string[];
  phoneNumber?: string;
  recoveryEmail?: string;
}

export async function createEncryptedTwoFactor(
  userId: number,
  sensitiveData: TwoFactorData
) {
  const encryptedData = encryptData(sensitiveData);
  
  const userDb = getDbWithUser(userId);
  const result = await userDb.execute(async (tx) => {
    return tx.insert(twoFactorSecrets).values({
      userId,
      secret: sensitiveData.secret,
      backupCodes: sensitiveData.backupCodes,
      encryptedData,
    }).returning();
  });
  
  return result[0];
}

export async function getDecryptedTwoFactor(userId: number) {
  const userDb = getDbWithUser(userId);
  const secrets = await userDb.execute(async (tx) => {
    return tx.select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId));
  });
  
  if (secrets.length === 0) return null;
  
  const secret = secrets[0];
  return {
    ...secret,
    sensitiveData: secret.encryptedData ? decryptData(secret.encryptedData) : null,
  };
}

// ============================================================================
// HOUSING LISTINGS
// ============================================================================

export interface HousingListingData {
  pricingDetails?: Record<string, any>;
  cleaningFee?: number;
  securityDeposit?: number;
  hostPaymentInfo?: Record<string, any>;
  discounts?: Record<string, any>;
}

export async function updateEncryptedHousingListing(
  listingId: number,
  hostId: number,
  updates: Partial<{ sensitiveData: HousingListingData }> & Record<string, any>
) {
  const { sensitiveData, ...publicUpdates } = updates;
  
  let encryptedData: string | undefined;
  if (sensitiveData) {
    encryptedData = encryptData(sensitiveData);
  }
  
  const updateData = encryptedData 
    ? { ...publicUpdates, encryptedData }
    : publicUpdates;
  
  const result = await db.update(housingListings)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(housingListings.id, listingId), eq(housingListings.hostId, hostId)))
    .returning();
  
  return result[0] || null;
}

export async function getDecryptedHousingListing(listingId: number) {
  const listings = await db.select()
    .from(housingListings)
    .where(eq(housingListings.id, listingId));
  
  if (listings.length === 0) return null;
  
  const listing = listings[0];
  return {
    ...listing,
    sensitiveData: listing.encryptedData ? decryptData(listing.encryptedData) : null,
  };
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export interface SubscriptionData {
  paymentMethodDetails?: Record<string, any>;
  billingAddress?: Record<string, any>;
  taxInfo?: Record<string, any>;
  invoiceHistory?: any[];
}

export async function updateEncryptedSubscription(
  subscriptionId: number,
  userId: number,
  updates: Partial<{ sensitiveData: SubscriptionData }> & Record<string, any>
) {
  const { sensitiveData, ...publicUpdates } = updates;
  
  let encryptedData: string | undefined;
  if (sensitiveData) {
    encryptedData = encryptData(sensitiveData);
  }
  
  const updateData = encryptedData 
    ? { ...publicUpdates, encryptedData }
    : publicUpdates;
  
  const result = await db.update(subscriptions)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)))
    .returning();
  
  return result[0] || null;
}

export async function getDecryptedSubscription(userId: number) {
  const subs = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
  
  return subs.map(sub => ({
    ...sub,
    sensitiveData: sub.encryptedData ? decryptData(sub.encryptedData) : null,
  }));
}

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
import { encryptObject, decryptObject } from "../utils/encryption";

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
  const { sensitiveData, ...publicData } = goalData;
  
  const encryptedData = encryptObject(sensitiveData);
  
  const result = await db.insert(financialGoals).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedFinancialGoals(userId: number) {
  const goals = await db.select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId))
    .orderBy(desc(financialGoals.createdAt));
  
  return goals.map(goal => ({
    ...goal,
    sensitiveData: decryptObject<FinancialGoalData>(goal.encryptedData),
  }));
}

export async function getDecryptedFinancialGoalById(id: number, userId: number) {
  const goals = await db.select()
    .from(financialGoals)
    .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)));
  
  if (goals.length === 0) return null;
  
  const goal = goals[0];
  return {
    ...goal,
    sensitiveData: decryptObject<FinancialGoalData>(goal.encryptedData),
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
    // Fetch current goal to merge sensitive data
    const current = await getDecryptedFinancialGoalById(id, userId);
    if (!current) return null;
    
    const mergedSensitiveData = { ...current.sensitiveData, ...sensitiveData };
    encryptedData = encryptObject(mergedSensitiveData);
  }
  
  const updateData = encryptedData 
    ? { ...publicUpdates, encryptedData }
    : publicUpdates;
  
  const result = await db.update(financialGoals)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)))
    .returning();
  
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
  const { sensitiveData, ...publicData } = entryData;
  const encryptedData = encryptObject(sensitiveData);
  
  const result = await db.insert(budgetEntries).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedBudgetEntries(userId: number, filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  entryType?: string;
}) {
  let query = db.select()
    .from(budgetEntries)
    .where(eq(budgetEntries.userId, userId));
  
  const entries = await query.orderBy(desc(budgetEntries.date));
  
  return entries.map(entry => ({
    ...entry,
    sensitiveData: decryptObject<BudgetEntryData>(entry.encryptedData),
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
  const { sensitiveData, ...publicData } = categoryData;
  const encryptedData = sensitiveData ? encryptObject(sensitiveData) : null;
  
  const result = await db.insert(budgetCategories).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedBudgetCategories(userId: number) {
  const categories = await db.select()
    .from(budgetCategories)
    .where(eq(budgetCategories.userId, userId))
    .orderBy(desc(budgetCategories.createdAt));
  
  return categories.map(category => ({
    ...category,
    sensitiveData: category.encryptedData 
      ? decryptObject<BudgetCategoryData>(category.encryptedData)
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
  const { sensitiveData, ...publicData } = goalData;
  const encryptedData = encryptObject(sensitiveData);
  
  const result = await db.insert(healthGoals).values({
    ...publicData,
    encryptedData,
  }).returning();
  
  return result[0];
}

export async function getDecryptedHealthGoals(userId: number) {
  const goals = await db.select()
    .from(healthGoals)
    .where(eq(healthGoals.userId, userId))
    .orderBy(desc(healthGoals.createdAt));
  
  return goals.map(goal => ({
    ...goal,
    sensitiveData: decryptObject<HealthGoalData>(goal.encryptedData),
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
  const { sensitiveData, ...publicData } = metricData;
  const encryptedData = encryptObject(sensitiveData);
  
  const result = await db.insert(healthMetrics).values({
    ...publicData,
    encryptedData,
  }).returning();
  
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
    sensitiveData: decryptObject<HealthMetricData>(metric.encryptedData),
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
  const encryptedData = encryptObject(sensitiveData);
  
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
    sensitiveData: decryptObject<NutritionLogData>(log.encryptedData),
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
  const encryptedData = encryptObject(sensitiveData);
  
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
    sensitiveData: decryptObject<FitnessActivityData>(activity.encryptedData),
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
  const encryptedData = encryptObject(sensitiveData);
  
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
    sensitiveData: decryptObject<UserPaymentData>(payment.encryptedData),
  }));
}

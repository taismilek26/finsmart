import { mysqlTable, serial, varchar, int, timestamp, decimal, boolean, json, mysqlEnum } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums for MySQL
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;

export const RecommendationType = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning'
} as const;

export const ModelType = {
  FORECAST: 'forecast',
  CLASSIFIER: 'classifier',
  RECOMMENDER: 'recommender',
  FRAUD: 'fraud',
  MARKET: 'market'
} as const;

export const UpdateType = {
  PARAMETERS: 'parameters',
  VERSION: 'version',
  STATUS: 'status'
} as const;

export const PeriodType = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

// Bảng người dùng
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  fullName: varchar('fullName', { length: 100 }).notNull(),
  role: mysqlEnum('role', [UserRole.USER, UserRole.ADMIN]).notNull().default(UserRole.USER),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng danh mục
export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  type: mysqlEnum('type', [TransactionType.INCOME, TransactionType.EXPENSE]).notNull(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng giao dịch
export const transactions = mysqlTable('transactions', {
  id: serial('id').primaryKey(),
  userId: int('userId').notNull(),
  categoryId: int('categoryId').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: varchar('description', { length: 255 }),
  transactionDate: timestamp('transactionDate').notNull(),
  type: mysqlEnum('type', [TransactionType.INCOME, TransactionType.EXPENSE]).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng mục tiêu tài chính
export const financialGoals = mysqlTable('financial_goals', {
  id: serial('id').primaryKey(),
  userId: int('userId').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  targetAmount: decimal('targetAmount', { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal('currentAmount', { precision: 15, scale: 2 }).default('0'),
  startDate: timestamp('startDate').notNull(),
  targetDate: timestamp('targetDate').notNull(),
  isCompleted: boolean('isCompleted').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng gợi ý từ AI
export const aiRecommendations = mysqlTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  userId: int('userId').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 1000 }).notNull(),
  type: mysqlEnum('type', [RecommendationType.PRIMARY, RecommendationType.SUCCESS, RecommendationType.WARNING]).default(RecommendationType.PRIMARY),
  isRead: boolean('isRead').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

// Bảng mô hình AI
export const aiModels = mysqlTable('ai_models', {
  id: serial('id').primaryKey(),
  modelName: varchar('modelName', { length: 100 }).notNull(),
  modelVersion: varchar('modelVersion', { length: 20 }).notNull(),
  modelType: mysqlEnum('modelType', [ModelType.FORECAST, ModelType.CLASSIFIER, ModelType.RECOMMENDER, ModelType.FRAUD, ModelType.MARKET]).notNull(),
  parameters: json('parameters'),
  accuracy: varchar('accuracy', { length: 10 }),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng cập nhật mô hình AI
export const aiModelUpdates = mysqlTable('ai_model_updates', {
  id: serial('id').primaryKey(),
  modelId: int('modelId').notNull(),
  updateType: mysqlEnum('updateType', [UpdateType.PARAMETERS, UpdateType.VERSION, UpdateType.STATUS]).notNull(),
  previousValue: json('previousValue'),
  newValue: json('newValue'),
  updatedBy: int('updatedBy').notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Bảng ngân sách
export const budgets = mysqlTable('budgets', {
  id: serial('id').primaryKey(),
  userId: int('userId').notNull(),
  categoryId: int('categoryId').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  period: mysqlEnum('period', [PeriodType.DAILY, PeriodType.WEEKLY, PeriodType.MONTHLY, PeriodType.YEARLY]).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  financialGoals: many(financialGoals),
  aiRecommendations: many(aiRecommendations),
  budgets: many(budgets)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] })
}));

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, { fields: [financialGoals.userId], references: [users.id] })
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, { fields: [aiRecommendations.userId], references: [users.id] })
}));

export const aiModelsRelations = relations(aiModels, ({ many }) => ({
  updates: many(aiModelUpdates)
}));

export const aiModelUpdatesRelations = relations(aiModelUpdates, ({ one }) => ({
  model: one(aiModels, { fields: [aiModelUpdates.modelId], references: [aiModels.id] }),
  updatedByUser: one(users, { fields: [aiModelUpdates.updatedBy], references: [users.id] })
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] })
}));

// Schemas for validation
export const usersInsertSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof usersInsertSchema>;
export const usersSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof usersSelectSchema>;

export const categoriesInsertSchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof categoriesInsertSchema>;
export const categoriesSelectSchema = createSelectSchema(categories);
export type Category = z.infer<typeof categoriesSelectSchema>;

export const transactionsInsertSchema = createInsertSchema(transactions);
export type InsertTransaction = z.infer<typeof transactionsInsertSchema>;
export const transactionsSelectSchema = createSelectSchema(transactions);
export type Transaction = z.infer<typeof transactionsSelectSchema>;

export const financialGoalsInsertSchema = createInsertSchema(financialGoals);
export type InsertFinancialGoal = z.infer<typeof financialGoalsInsertSchema>;
export const financialGoalsSelectSchema = createSelectSchema(financialGoals);
export type FinancialGoal = z.infer<typeof financialGoalsSelectSchema>;

export const aiRecommendationsInsertSchema = createInsertSchema(aiRecommendations);
export type InsertAIRecommendation = z.infer<typeof aiRecommendationsInsertSchema>;
export const aiRecommendationsSelectSchema = createSelectSchema(aiRecommendations);
export type AIRecommendation = z.infer<typeof aiRecommendationsSelectSchema>;

export const aiModelsInsertSchema = createInsertSchema(aiModels);
export type InsertAIModel = z.infer<typeof aiModelsInsertSchema>;
export const aiModelsSelectSchema = createSelectSchema(aiModels);
export type AIModel = z.infer<typeof aiModelsSelectSchema>;

export const aiModelUpdatesInsertSchema = createInsertSchema(aiModelUpdates);
export type InsertAIModelUpdate = z.infer<typeof aiModelUpdatesInsertSchema>;
export const aiModelUpdatesSelectSchema = createSelectSchema(aiModelUpdates);
export type AIModelUpdate = z.infer<typeof aiModelUpdatesSelectSchema>;

export const budgetsInsertSchema = createInsertSchema(budgets);
export type InsertBudget = z.infer<typeof budgetsInsertSchema>;
export const budgetsSelectSchema = createSelectSchema(budgets);
export type Budget = z.infer<typeof budgetsSelectSchema>;
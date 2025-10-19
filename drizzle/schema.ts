import {
  boolean,
  datetime,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "curator", "admin"]).default("user").notNull(),
  organization: varchar("organization", { length: 255 }),
  position: varchar("position", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Технологические паспорта
 */
export const passports = mysqlTable("passports", {
  id: int("id").primaryKey().autoincrement(),
  serviceName: varchar("serviceName", { length: 500 }).notNull(),
  serviceCode: varchar("serviceCode", { length: 50 }),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "in_review", "published", "archived"])
    .default("draft")
    .notNull(),
  version: int("version").default(1).notNull(),
  createdBy: varchar("createdBy", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  publishedAt: timestamp("publishedAt"),
});

export type Passport = typeof passports.$inferSelect;
export type InsertPassport = typeof passports.$inferInsert;

/**
 * Версии паспортов
 */
export const passportVersions = mysqlTable(
  "passportVersions",
  {
    id: int("id").primaryKey().autoincrement(),
    passportId: int("passportId")
      .notNull()
      .references(() => passports.id, { onDelete: "cascade" }),
    version: int("version").notNull(),
    data: json("data").notNull(),
    createdBy: varchar("createdBy", { length: 64 }).references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow(),
    comment: text("comment"),
  },
  (table) => ({
    uniquePassportVersion: unique().on(table.passportId, table.version),
  })
);

export type PassportVersion = typeof passportVersions.$inferSelect;
export type InsertPassportVersion = typeof passportVersions.$inferInsert;

/**
 * Разделы паспорта
 */
export const sections = mysqlTable("sections", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  sectionNumber: int("sectionNumber").notNull(),
  sectionName: varchar("sectionName", { length: 255 }).notNull(),
  curatorId: varchar("curatorId", { length: 64 }).references(() => users.id),
  data: json("data"),
  isCompleted: boolean("isCompleted").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

/**
 * Нормативные акты
 */
export const normativeActs = mysqlTable("normativeActs", {
  id: int("id").primaryKey().autoincrement(),
  type: varchar("type", { length: 100 }).notNull(),
  number: varchar("number", { length: 100 }).notNull(),
  date: datetime("date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  filePath: text("filePath"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type NormativeAct = typeof normativeActs.$inferSelect;
export type InsertNormativeAct = typeof normativeActs.$inferInsert;

/**
 * Связь паспортов с нормативными актами
 */
export const passportNormativeActs = mysqlTable("passportNormativeActs", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  normativeActId: int("normativeActId")
    .notNull()
    .references(() => normativeActs.id),
  sectionNumber: int("sectionNumber"),
  relevance: text("relevance"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PassportNormativeAct = typeof passportNormativeActs.$inferSelect;
export type InsertPassportNormativeAct = typeof passportNormativeActs.$inferInsert;

/**
 * BPMN диаграммы
 */
export const bpmnDiagrams = mysqlTable("bpmnDiagrams", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["as-is", "to-be"]).notNull(),
  xmlContent: text("xmlContent").notNull(),
  svgPreview: text("svgPreview"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type BpmnDiagram = typeof bpmnDiagrams.$inferSelect;
export type InsertBpmnDiagram = typeof bpmnDiagrams.$inferInsert;

/**
 * Матрица критериев
 */
export const criteriaMatrix = mysqlTable("criteriaMatrix", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  criterionName: varchar("criterionName", { length: 255 }).notNull(),
  criterionType: varchar("criterionType", { length: 50 }).notNull(),
  description: text("description"),
  dataSource: varchar("dataSource", { length: 255 }),
  validationRule: text("validationRule"),
  priority: int("priority"),
  normativeBasis: text("normativeBasis"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CriteriaMatrix = typeof criteriaMatrix.$inferSelect;
export type InsertCriteriaMatrix = typeof criteriaMatrix.$inferInsert;

/**
 * Формулы расчета выплат
 */
export const paymentFormulas = mysqlTable("paymentFormulas", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  formulaName: varchar("formulaName", { length: 255 }).notNull(),
  formulaExpression: text("formulaExpression").notNull(),
  variables: json("variables"),
  roundingRule: varchar("roundingRule", { length: 100 }),
  examples: json("examples"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PaymentFormula = typeof paymentFormulas.$inferSelect;
export type InsertPaymentFormula = typeof paymentFormulas.$inferInsert;

/**
 * Статусные модели
 */
export const statusModels = mysqlTable("statusModels", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  statusCode: varchar("statusCode", { length: 50 }).notNull(),
  statusName: varchar("statusName", { length: 255 }).notNull(),
  description: text("description"),
  isInitial: boolean("isInitial").default(false),
  isFinal: boolean("isFinal").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type StatusModel = typeof statusModels.$inferSelect;
export type InsertStatusModel = typeof statusModels.$inferInsert;

/**
 * Переходы между статусами
 */
export const statusTransitions = mysqlTable("statusTransitions", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  fromStatusId: int("fromStatusId").references(() => statusModels.id),
  toStatusId: int("toStatusId")
    .notNull()
    .references(() => statusModels.id),
  condition: text("condition"),
  isAutomatic: boolean("isAutomatic").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type StatusTransition = typeof statusTransitions.$inferSelect;
export type InsertStatusTransition = typeof statusTransitions.$inferInsert;

/**
 * Шаблоны уведомлений
 */
export const notificationTemplates = mysqlTable("notificationTemplates", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  templateName: varchar("templateName", { length: 255 }).notNull(),
  channel: mysqlEnum("channel", ["sms", "email", "push", "portal"]).notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  variables: json("variables"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;

/**
 * СМЭВ интеграции
 */
export const smevIntegrations = mysqlTable("smevIntegrations", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  serviceCode: varchar("serviceCode", { length: 100 }).notNull(),
  purpose: text("purpose"),
  requestExample: text("requestExample"),
  responseExample: text("responseExample"),
  fieldMapping: json("fieldMapping"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SmevIntegration = typeof smevIntegrations.$inferSelect;
export type InsertSmevIntegration = typeof smevIntegrations.$inferInsert;

/**
 * Комментарии
 */
export const comments = mysqlTable("comments", {
  id: int("id").primaryKey().autoincrement(),
  passportId: int("passportId")
    .notNull()
    .references(() => passports.id, { onDelete: "cascade" }),
  sectionNumber: int("sectionNumber"),
  userId: varchar("userId", { length: 64 })
    .notNull()
    .references(() => users.id),
  commentText: text("commentText").notNull(),
  parentCommentId: int("parentCommentId").references((): any => comments.id),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Журнал аудита
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  oldValue: json("oldValue"),
  newValue: json("newValue"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;


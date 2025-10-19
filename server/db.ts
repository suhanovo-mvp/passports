import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLog,
  bpmnDiagrams,
  comments,
  criteriaMatrix,
  InsertAuditLog,
  InsertBpmnDiagram,
  InsertComment,
  InsertCriteriaMatrix,
  InsertNormativeAct,
  InsertNotificationTemplate,
  InsertPassport,
  InsertPassportNormativeAct,
  InsertPassportVersion,
  InsertPaymentFormula,
  InsertSection,
  InsertSmevIntegration,
  InsertStatusModel,
  InsertStatusTransition,
  InsertUser,
  normativeActs,
  notificationTemplates,
  passportNormativeActs,
  passports,
  passportVersions,
  paymentFormulas,
  sections,
  smevIntegrations,
  statusModels,
  statusTransitions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER OPERATIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "organization", "position", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

// ===== PASSPORT OPERATIONS =====

export async function createPassport(data: InsertPassport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(passports).values(data);
  return result[0].insertId;
}

export async function getPassport(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(passports).where(eq(passports.id, id)).limit(1);
  return result[0];
}

export async function getAllPassports() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(passports).orderBy(desc(passports.updatedAt));
}

export async function updatePassport(id: number, data: Partial<InsertPassport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(passports).set(data).where(eq(passports.id, id));
}

export async function deletePassport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(passports).where(eq(passports.id, id));
}

// ===== PASSPORT VERSION OPERATIONS =====

export async function createPassportVersion(data: InsertPassportVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(passportVersions).values(data);
  return result[0].insertId;
}

export async function getPassportVersions(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(passportVersions)
    .where(eq(passportVersions.passportId, passportId))
    .orderBy(desc(passportVersions.version));
}

// ===== SECTION OPERATIONS =====

export async function createSection(data: InsertSection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sections).values(data);
  return result[0].insertId;
}

export async function getPassportSections(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sections).where(eq(sections.passportId, passportId));
}

export async function getSection(passportId: number, sectionNumber: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(sections)
    .where(and(eq(sections.passportId, passportId), eq(sections.sectionNumber, sectionNumber)))
    .limit(1);
  
  return result[0];
}

export async function updateSection(id: number, data: Partial<InsertSection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sections).set(data).where(eq(sections.id, id));
}

// ===== NORMATIVE ACT OPERATIONS =====

export async function createNormativeAct(data: InsertNormativeAct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(normativeActs).values(data);
  return result[0].insertId;
}

export async function getAllNormativeActs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(normativeActs).orderBy(desc(normativeActs.date));
}

export async function linkNormativeActToPassport(data: InsertPassportNormativeAct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(passportNormativeActs).values(data);
  return result[0].insertId;
}

export async function getPassportNormativeActs(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: passportNormativeActs.id,
      sectionNumber: passportNormativeActs.sectionNumber,
      relevance: passportNormativeActs.relevance,
      act: normativeActs,
    })
    .from(passportNormativeActs)
    .leftJoin(normativeActs, eq(passportNormativeActs.normativeActId, normativeActs.id))
    .where(eq(passportNormativeActs.passportId, passportId));
}

// ===== BPMN DIAGRAM OPERATIONS =====

export async function createBpmnDiagram(data: InsertBpmnDiagram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bpmnDiagrams).values(data);
  return result[0].insertId;
}

export async function getBpmnDiagrams(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bpmnDiagrams).where(eq(bpmnDiagrams.passportId, passportId));
}

export async function updateBpmnDiagram(id: number, data: Partial<InsertBpmnDiagram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bpmnDiagrams).set(data).where(eq(bpmnDiagrams.id, id));
}

export async function deleteBpmnDiagram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(bpmnDiagrams).where(eq(bpmnDiagrams.id, id));
}

// ===== CRITERIA MATRIX OPERATIONS =====

export async function createCriterion(data: InsertCriteriaMatrix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(criteriaMatrix).values(data);
  return result[0].insertId;
}

export async function getCriteria(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(criteriaMatrix).where(eq(criteriaMatrix.passportId, passportId));
}

export async function updateCriterion(id: number, data: Partial<InsertCriteriaMatrix>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(criteriaMatrix).set(data).where(eq(criteriaMatrix.id, id));
}

export async function deleteCriterion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(criteriaMatrix).where(eq(criteriaMatrix.id, id));
}

// ===== PAYMENT FORMULA OPERATIONS =====

export async function createPaymentFormula(data: InsertPaymentFormula) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(paymentFormulas).values(data);
  return result[0].insertId;
}

export async function getPaymentFormulas(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(paymentFormulas).where(eq(paymentFormulas.passportId, passportId));
}

export async function updatePaymentFormula(id: number, data: Partial<InsertPaymentFormula>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(paymentFormulas).set(data).where(eq(paymentFormulas.id, id));
}

export async function deletePaymentFormula(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(paymentFormulas).where(eq(paymentFormulas.id, id));
}

// ===== STATUS MODEL OPERATIONS =====

export async function createStatusModel(data: InsertStatusModel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(statusModels).values(data);
  return result[0].insertId;
}

export async function getStatusModels(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(statusModels).where(eq(statusModels.passportId, passportId));
}

export async function updateStatusModel(id: number, data: Partial<InsertStatusModel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(statusModels).set(data).where(eq(statusModels.id, id));
}

export async function deleteStatusModel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(statusModels).where(eq(statusModels.id, id));
}

// ===== STATUS TRANSITION OPERATIONS =====

export async function createStatusTransition(data: InsertStatusTransition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(statusTransitions).values(data);
  return result[0].insertId;
}

export async function getStatusTransitions(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(statusTransitions).where(eq(statusTransitions.passportId, passportId));
}

export async function deleteStatusTransition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(statusTransitions).where(eq(statusTransitions.id, id));
}

// ===== NOTIFICATION TEMPLATE OPERATIONS =====

export async function createNotificationTemplate(data: InsertNotificationTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notificationTemplates).values(data);
  return result[0].insertId;
}

export async function getNotificationTemplates(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notificationTemplates).where(eq(notificationTemplates.passportId, passportId));
}

export async function updateNotificationTemplate(id: number, data: Partial<InsertNotificationTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notificationTemplates).set(data).where(eq(notificationTemplates.id, id));
}

export async function deleteNotificationTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
}

// ===== SMEV INTEGRATION OPERATIONS =====

export async function createSmevIntegration(data: InsertSmevIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(smevIntegrations).values(data);
  return result[0].insertId;
}

export async function getSmevIntegrations(passportId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(smevIntegrations).where(eq(smevIntegrations.passportId, passportId));
}

export async function updateSmevIntegration(id: number, data: Partial<InsertSmevIntegration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(smevIntegrations).set(data).where(eq(smevIntegrations.id, id));
}

export async function deleteSmevIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(smevIntegrations).where(eq(smevIntegrations.id, id));
}

// ===== COMMENT OPERATIONS =====

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(comments).values(data);
  return result[0].insertId;
}

export async function getPassportComments(passportId: number, sectionNumber?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = sectionNumber !== undefined
    ? and(eq(comments.passportId, passportId), eq(comments.sectionNumber, sectionNumber))
    : eq(comments.passportId, passportId);
  
  return await db.select().from(comments).where(conditions).orderBy(desc(comments.createdAt));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(comments).where(eq(comments.id, id));
}

// ===== AUDIT LOG OPERATIONS =====

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(auditLog).values(data);
  } catch (error) {
    console.error("[Database] Failed to create audit log:", error);
  }
}

export async function getAuditLogs(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
    .orderBy(desc(auditLog.createdAt));
}


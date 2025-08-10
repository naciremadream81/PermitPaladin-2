import {
  users,
  counties,
  permitPackages,
  packageDocuments,
  checklistItems,
  packageChecklistProgress,
  type User,
  type UpsertUser,
  type County,
  type InsertCounty,
  type PermitPackage,
  type InsertPermitPackage,
  type PackageDocument,
  type InsertPackageDocument,
  type ChecklistItem,
  type InsertChecklistItem,
  type InsertPackageChecklistProgress,
  type PackageChecklistProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // County operations
  getAllCounties(): Promise<County[]>;
  getCounty(id: string): Promise<County | undefined>;
  getCountyBySlug(slug: string): Promise<County | undefined>;
  createCounty(county: InsertCounty): Promise<County>;

  // Permit package operations
  createPermitPackage(packageData: InsertPermitPackage): Promise<PermitPackage>;
  getPermitPackage(id: string): Promise<PermitPackage | undefined>;
  getPermitPackagesByOwner(ownerId: string, filters?: {
    countyId?: string;
    status?: string;
    search?: string;
  }): Promise<PermitPackage[]>;
  updatePermitPackage(id: string, updates: Partial<InsertPermitPackage>): Promise<PermitPackage>;
  deletePermitPackage(id: string): Promise<void>;

  // Document operations
  createPackageDocument(document: InsertPackageDocument): Promise<PackageDocument>;
  getPackageDocuments(packageId: string): Promise<PackageDocument[]>;
  deletePackageDocument(id: string): Promise<void>;

  // Checklist operations
  getChecklistItems(countyId: string, projectType: string): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  getPackageChecklistProgress(packageId: string): Promise<PackageChecklistProgress[]>;
  updateChecklistProgress(packageId: string, checklistItemId: string, isCompleted: boolean, notes?: string): Promise<PackageChecklistProgress>;

  // Statistics
  getPackageStats(ownerId: string): Promise<{
    activePackages: number;
    approvedPackages: number;
    underReviewPackages: number;
    issuePackages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // County operations
  async getAllCounties(): Promise<County[]> {
    return await db.select().from(counties).orderBy(counties.name);
  }

  async getCounty(id: string): Promise<County | undefined> {
    const [county] = await db.select().from(counties).where(eq(counties.id, id));
    return county;
  }

  async getCountyBySlug(slug: string): Promise<County | undefined> {
    const [county] = await db.select().from(counties).where(eq(counties.slug, slug));
    return county;
  }

  async createCounty(county: InsertCounty): Promise<County> {
    const [newCounty] = await db.insert(counties).values(county).returning();
    return newCounty;
  }

  // Permit package operations
  async createPermitPackage(packageData: InsertPermitPackage): Promise<PermitPackage> {
    const [newPackage] = await db.insert(permitPackages).values(packageData).returning();
    return newPackage;
  }

  async getPermitPackage(id: string): Promise<PermitPackage | undefined> {
    const [permitPackage] = await db
      .select()
      .from(permitPackages)
      .where(eq(permitPackages.id, id));
    return permitPackage;
  }

  async getPermitPackagesByOwner(ownerId: string, filters: {
    countyId?: string;
    status?: string;
    search?: string;
  } = {}): Promise<PermitPackage[]> {
    let query = db
      .select()
      .from(permitPackages)
      .where(eq(permitPackages.ownerId, ownerId));

    const conditions = [eq(permitPackages.ownerId, ownerId)];

    if (filters.countyId) {
      conditions.push(eq(permitPackages.countyId, filters.countyId));
    }

    if (filters.status) {
      conditions.push(eq(permitPackages.status, filters.status as any));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(permitPackages.name, `%${filters.search}%`),
          like(permitPackages.projectAddress, `%${filters.search}%`)
        )!
      );
    }

    return await db
      .select()
      .from(permitPackages)
      .where(and(...conditions))
      .orderBy(desc(permitPackages.updatedAt));
  }

  async updatePermitPackage(id: string, updates: Partial<InsertPermitPackage>): Promise<PermitPackage> {
    const [updatedPackage] = await db
      .update(permitPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(permitPackages.id, id))
      .returning();
    return updatedPackage;
  }

  async deletePermitPackage(id: string): Promise<void> {
    await db.delete(permitPackages).where(eq(permitPackages.id, id));
  }

  // Document operations
  async createPackageDocument(document: InsertPackageDocument): Promise<PackageDocument> {
    const [newDocument] = await db.insert(packageDocuments).values(document).returning();
    return newDocument;
  }

  async getPackageDocuments(packageId: string): Promise<PackageDocument[]> {
    return await db
      .select()
      .from(packageDocuments)
      .where(eq(packageDocuments.packageId, packageId))
      .orderBy(packageDocuments.createdAt);
  }

  async deletePackageDocument(id: string): Promise<void> {
    await db.delete(packageDocuments).where(eq(packageDocuments.id, id));
  }

  // Checklist operations
  async getChecklistItems(countyId: string, projectType: string): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(checklistItems)
      .where(
        and(
          eq(checklistItems.countyId, countyId),
          eq(checklistItems.projectType, projectType as any)
        )
      )
      .orderBy(checklistItems.order);
  }

  async createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem> {
    const [newItem] = await db.insert(checklistItems).values(item).returning();
    return newItem;
  }

  async getPackageChecklistProgress(packageId: string): Promise<PackageChecklistProgress[]> {
    return await db
      .select()
      .from(packageChecklistProgress)
      .where(eq(packageChecklistProgress.packageId, packageId));
  }

  async updateChecklistProgress(
    packageId: string,
    checklistItemId: string,
    isCompleted: boolean,
    notes?: string
  ): Promise<PackageChecklistProgress> {
    const [progress] = await db
      .insert(packageChecklistProgress)
      .values({
        packageId,
        checklistItemId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        notes,
      })
      .onConflictDoUpdate({
        target: [packageChecklistProgress.packageId, packageChecklistProgress.checklistItemId],
        set: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          notes,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  // Statistics
  async getPackageStats(ownerId: string): Promise<{
    activePackages: number;
    approvedPackages: number;
    underReviewPackages: number;
    issuePackages: number;
  }> {
    const stats = await db
      .select({
        status: permitPackages.status,
        count: count(),
      })
      .from(permitPackages)
      .where(eq(permitPackages.ownerId, ownerId))
      .groupBy(permitPackages.status);

    const result = {
      activePackages: 0,
      approvedPackages: 0,
      underReviewPackages: 0,
      issuePackages: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case "draft":
        case "pending":
          result.activePackages += stat.count;
          break;
        case "approved":
        case "issued":
          result.approvedPackages += stat.count;
          break;
        case "under_review":
          result.underReviewPackages += stat.count;
          break;
        case "rejected":
        case "expired":
          result.issuePackages += stat.count;
          break;
      }
    });

    return result;
  }
}

export const storage = new DatabaseStorage();

import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florida counties
export const counties = pgTable("counties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  state: varchar("state").notNull().default("FL"),
  buildingDeptPhone: varchar("building_dept_phone"),
  buildingDeptEmail: varchar("building_dept_email"),
  buildingDeptWebsite: varchar("building_dept_website"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Building permit package statuses
export const packageStatusEnum = pgEnum("package_status", [
  "draft",
  "pending", 
  "under_review",
  "approved",
  "rejected",
  "issued",
  "expired"
]);

// Building permit project types
export const projectTypeEnum = pgEnum("project_type", [
  "residential_new",
  "residential_renovation", 
  "commercial_new",
  "commercial_renovation",
  "industrial",
  "multi_family",
  "accessory_structure"
]);

// Permit packages
export const permitPackages = pgTable("permit_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  projectAddress: text("project_address").notNull(),
  projectType: projectTypeEnum("project_type").notNull(),
  constructionValue: integer("construction_value"), // in cents
  status: packageStatusEnum("status").notNull().default("draft"),
  countyId: varchar("county_id").notNull().references(() => counties.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  permitNumber: varchar("permit_number"),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document types for building permits
export const documentTypeEnum = pgEnum("document_type", [
  "application_form",
  "site_plan",
  "floor_plan", 
  "structural_details",
  "electrical_schematics",
  "mechanical_plans",
  "plumbing_plans",
  "special_inspections",
  "flood_certificate",
  "environmental_permit",
  "impact_fee_calculation",
  "property_survey",
  "easement_agreement",
  "product_approval",
  "energy_compliance",
  "fire_dept_approval",
  "other"
]);

// Package documents
export const packageDocuments = pgTable("package_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull().references(() => permitPackages.id),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  objectPath: varchar("object_path").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// County-specific checklist items
export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countyId: varchar("county_id").notNull().references(() => counties.id),
  projectType: projectTypeEnum("project_type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").notNull().default(true),
  documentType: documentTypeEnum("document_type"),
  category: varchar("category").notNull().default("General"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Package checklist progress
export const packageChecklistProgress = pgTable("package_checklist_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull().references(() => permitPackages.id),
  checklistItemId: varchar("checklist_item_id").notNull().references(() => checklistItems.id),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  permitPackages: many(permitPackages),
  documents: many(packageDocuments),
}));

export const countiesRelations = relations(counties, ({ many }) => ({
  permitPackages: many(permitPackages),
  checklistItems: many(checklistItems),
}));

export const permitPackagesRelations = relations(permitPackages, ({ one, many }) => ({
  county: one(counties, {
    fields: [permitPackages.countyId],
    references: [counties.id],
  }),
  owner: one(users, {
    fields: [permitPackages.ownerId],
    references: [users.id],
  }),
  documents: many(packageDocuments),
  checklistProgress: many(packageChecklistProgress),
}));

export const packageDocumentsRelations = relations(packageDocuments, ({ one }) => ({
  package: one(permitPackages, {
    fields: [packageDocuments.packageId],
    references: [permitPackages.id],
  }),
  uploadedByUser: one(users, {
    fields: [packageDocuments.uploadedBy],
    references: [users.id],
  }),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one, many }) => ({
  county: one(counties, {
    fields: [checklistItems.countyId],
    references: [counties.id],
  }),
  progress: many(packageChecklistProgress),
}));

export const packageChecklistProgressRelations = relations(packageChecklistProgress, ({ one }) => ({
  package: one(permitPackages, {
    fields: [packageChecklistProgress.packageId],
    references: [permitPackages.id],
  }),
  checklistItem: one(checklistItems, {
    fields: [packageChecklistProgress.checklistItemId],
    references: [checklistItems.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertCounty = typeof counties.$inferInsert;
export type County = typeof counties.$inferSelect;

export const insertPermitPackageSchema = createInsertSchema(permitPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPermitPackage = z.infer<typeof insertPermitPackageSchema>;
export type PermitPackage = typeof permitPackages.$inferSelect;

export const insertPackageDocumentSchema = createInsertSchema(packageDocuments).omit({
  id: true,
  createdAt: true,
});

export type InsertPackageDocument = z.infer<typeof insertPackageDocumentSchema>;
export type PackageDocument = typeof packageDocuments.$inferSelect;

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;

export type InsertPackageChecklistProgress = typeof packageChecklistProgress.$inferInsert;
export type PackageChecklistProgress = typeof packageChecklistProgress.$inferSelect;

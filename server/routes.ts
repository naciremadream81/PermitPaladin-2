import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertPermitPackageSchema, insertPackageDocumentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage routes for document management
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Counties
  app.get("/api/counties", async (req, res) => {
    try {
      const counties = await storage.getAllCounties();
      res.json(counties);
    } catch (error) {
      console.error("Error fetching counties:", error);
      res.status(500).json({ message: "Failed to fetch counties" });
    }
  });

  // Permit packages
  app.get("/api/packages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { county, status, search } = req.query;
      
      const packages = await storage.getPermitPackagesByOwner(userId, {
        countyId: county === "all" ? undefined : county,
        status: status === "all" ? undefined : status,
        search: search,
      });
      
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post("/api/packages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const packageData = insertPermitPackageSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const newPackage = await storage.createPermitPackage(packageData);
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.get("/api/packages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const package_ = await storage.getPermitPackage(req.params.id);
      
      if (!package_) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      if (package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(package_);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });

  app.put("/api/packages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const package_ = await storage.getPermitPackage(req.params.id);
      
      if (!package_) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      if (package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedPackage = await storage.updatePermitPackage(req.params.id, req.body);
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  // Package documents
  app.post("/api/packages/:packageId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const packageId = req.params.packageId;
      
      // Verify package ownership
      const package_ = await storage.getPermitPackage(packageId);
      if (!package_ || package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.body.documentURL) {
        return res.status(400).json({ error: "documentURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.documentURL,
        {
          owner: userId,
          visibility: "private",
        },
      );

      const documentData = insertPackageDocumentSchema.parse({
        packageId,
        fileName: req.body.fileName,
        originalFileName: req.body.originalFileName,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
        documentType: req.body.documentType,
        objectPath,
        uploadedBy: userId,
      });

      const document = await storage.createPackageDocument(documentData);
      res.status(201).json({ document, objectPath });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get("/api/packages/:packageId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const packageId = req.params.packageId;
      
      // Verify package ownership
      const package_ = await storage.getPermitPackage(packageId);
      if (!package_ || package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getPackageDocuments(packageId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Checklist items
  app.get("/api/counties/:countyId/checklist/:projectType", async (req, res) => {
    try {
      const { countyId, projectType } = req.params;
      const items = await storage.getChecklistItems(countyId, projectType);
      res.json(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  });

  app.get("/api/packages/:packageId/checklist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const packageId = req.params.packageId;
      
      // Verify package ownership
      const package_ = await storage.getPermitPackage(packageId);
      if (!package_ || package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.getPackageChecklistProgress(packageId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching checklist progress:", error);
      res.status(500).json({ message: "Failed to fetch checklist progress" });
    }
  });

  app.put("/api/packages/:packageId/checklist/:itemId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { packageId, itemId } = req.params;
      const { isCompleted, notes } = req.body;
      
      // Verify package ownership
      const package_ = await storage.getPermitPackage(packageId);
      if (!package_ || package_.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.updateChecklistProgress(packageId, itemId, isCompleted, notes);
      res.json(progress);
    } catch (error) {
      console.error("Error updating checklist progress:", error);
      res.status(500).json({ message: "Failed to update checklist progress" });
    }
  });

  // Statistics
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getPackageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Seed data for counties and checklist items
  app.post("/api/seed", async (req, res) => {
    try {
      // Insert all 67 Florida counties
      const floridaCounties = [
        "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun",
        "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie",
        "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist",
        "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands",
        "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette",
        "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion",
        "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee",
        "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam",
        "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter",
        "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
      ];

      for (const countyName of floridaCounties) {
        const slug = countyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        await storage.createCounty({
          name: `${countyName} County`,
          slug,
          state: "FL",
        });
      }

      res.json({ message: "Seed data created successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

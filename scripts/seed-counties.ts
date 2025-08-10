import { db } from "../server/db";
import { counties, checklistItems } from "../shared/schema";
import { eq } from "drizzle-orm";

const FLORIDA_COUNTIES = [
  { name: "Alachua County", slug: "alachua" },
  { name: "Baker County", slug: "baker" },
  { name: "Bay County", slug: "bay" },
  { name: "Bradford County", slug: "bradford" },
  { name: "Brevard County", slug: "brevard" },
  { name: "Broward County", slug: "broward" },
  { name: "Calhoun County", slug: "calhoun" },
  { name: "Charlotte County", slug: "charlotte" },
  { name: "Citrus County", slug: "citrus" },
  { name: "Clay County", slug: "clay" },
  { name: "Collier County", slug: "collier" },
  { name: "Columbia County", slug: "columbia" },
  { name: "DeSoto County", slug: "desoto" },
  { name: "Dixie County", slug: "dixie" },
  { name: "Duval County", slug: "duval" },
  { name: "Escambia County", slug: "escambia" },
  { name: "Flagler County", slug: "flagler" },
  { name: "Franklin County", slug: "franklin" },
  { name: "Gadsden County", slug: "gadsden" },
  { name: "Gilchrist County", slug: "gilchrist" },
  { name: "Glades County", slug: "glades" },
  { name: "Gulf County", slug: "gulf" },
  { name: "Hamilton County", slug: "hamilton" },
  { name: "Hardee County", slug: "hardee" },
  { name: "Hendry County", slug: "hendry" },
  { name: "Hernando County", slug: "hernando" },
  { name: "Highlands County", slug: "highlands" },
  { name: "Hillsborough County", slug: "hillsborough" },
  { name: "Holmes County", slug: "holmes" },
  { name: "Indian River County", slug: "indian-river" },
  { name: "Jackson County", slug: "jackson" },
  { name: "Jefferson County", slug: "jefferson" },
  { name: "Lafayette County", slug: "lafayette" },
  { name: "Lake County", slug: "lake" },
  { name: "Lee County", slug: "lee" },
  { name: "Leon County", slug: "leon" },
  { name: "Levy County", slug: "levy" },
  { name: "Liberty County", slug: "liberty" },
  { name: "Madison County", slug: "madison" },
  { name: "Manatee County", slug: "manatee" },
  { name: "Marion County", slug: "marion" },
  { name: "Martin County", slug: "martin" },
  { name: "Miami-Dade County", slug: "miami-dade" },
  { name: "Monroe County", slug: "monroe" },
  { name: "Nassau County", slug: "nassau" },
  { name: "Okaloosa County", slug: "okaloosa" },
  { name: "Okeechobee County", slug: "okeechobee" },
  { name: "Orange County", slug: "orange" },
  { name: "Osceola County", slug: "osceola" },
  { name: "Palm Beach County", slug: "palm-beach" },
  { name: "Pasco County", slug: "pasco" },
  { name: "Pinellas County", slug: "pinellas" },
  { name: "Polk County", slug: "polk" },
  { name: "Putnam County", slug: "putnam" },
  { name: "Santa Rosa County", slug: "santa-rosa" },
  { name: "Sarasota County", slug: "sarasota" },
  { name: "Seminole County", slug: "seminole" },
  { name: "St. Johns County", slug: "st-johns" },
  { name: "St. Lucie County", slug: "st-lucie" },
  { name: "Sumter County", slug: "sumter" },
  { name: "Suwannee County", slug: "suwannee" },
  { name: "Taylor County", slug: "taylor" },
  { name: "Union County", slug: "union" },
  { name: "Volusia County", slug: "volusia" },
  { name: "Wakulla County", slug: "wakulla" },
  { name: "Walton County", slug: "walton" },
  { name: "Washington County", slug: "washington" },
];

const SAMPLE_CHECKLIST_ITEMS = [
  // Residential New Construction
  {
    title: "Building Permit Application",
    description: "Complete and submit the building permit application form",
    category: "Application",
    order: 1,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Site Plan",
    description: "Detailed site plan showing building location, setbacks, and lot dimensions",
    category: "Plans",
    order: 2,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Floor Plans",
    description: "Architectural floor plans with room dimensions and labels",
    category: "Plans",
    order: 3,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Structural Details",
    description: "Structural engineering plans and calculations",
    category: "Engineering",
    order: 4,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Electrical Plans",
    description: "Electrical layout and load calculations",
    category: "Engineering",
    order: 5,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Plumbing Plans",
    description: "Plumbing layout and fixture schedule",
    category: "Engineering",
    order: 6,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "HVAC Plans",
    description: "Mechanical plans and equipment specifications",
    category: "Engineering",
    order: 7,
    projectType: "residential_new",
    isRequired: true,
  },
  {
    title: "Energy Compliance",
    description: "Energy efficiency compliance documentation",
    category: "Compliance",
    order: 8,
    projectType: "residential_new",
    isRequired: true,
  },
  
  // Commercial New Construction
  {
    title: "Commercial Building Permit Application",
    description: "Complete commercial permit application with business information",
    category: "Application",
    order: 1,
    projectType: "commercial_new",
    isRequired: true,
  },
  {
    title: "Architectural Plans",
    description: "Complete architectural drawings including elevations and sections",
    category: "Plans",
    order: 2,
    projectType: "commercial_new",
    isRequired: true,
  },
  {
    title: "Structural Engineering",
    description: "Sealed structural engineering plans and calculations",
    category: "Engineering",
    order: 3,
    projectType: "commercial_new",
    isRequired: true,
  },
  {
    title: "Fire Safety Plan",
    description: "Fire department review and approval documentation",
    category: "Safety",
    order: 4,
    projectType: "commercial_new",
    isRequired: true,
  },
  {
    title: "ADA Compliance",
    description: "Americans with Disabilities Act compliance documentation",
    category: "Compliance",
    order: 5,
    projectType: "commercial_new",
    isRequired: true,
  },
];

async function seedCounties() {
  console.log("Seeding Florida counties...");
  
  for (const county of FLORIDA_COUNTIES) {
    try {
      // Check if county already exists
      const [existing] = await db
        .select()
        .from(counties)
        .where(eq(counties.slug, county.slug));
      
      if (!existing) {
        await db.insert(counties).values({
          name: county.name,
          slug: county.slug,
          state: "FL",
        });
        console.log(`✓ Created ${county.name}`);
      } else {
        console.log(`- ${county.name} already exists`);
      }
    } catch (error) {
      console.error(`✗ Error creating ${county.name}:`, error);
    }
  }
}

async function seedChecklistItems() {
  console.log("Seeding checklist items...");
  
  // Get all counties to create checklist items for each
  const allCounties = await db.select().from(counties);
  
  for (const county of allCounties) {
    for (const item of SAMPLE_CHECKLIST_ITEMS) {
      try {
        // Check if item already exists for this county and project type
        const [existing] = await db
          .select()
          .from(checklistItems)
          .where(
            eq(checklistItems.countyId, county.id) &&
            eq(checklistItems.projectType, item.projectType as any) &&
            eq(checklistItems.title, item.title)
          );
        
        if (!existing) {
          await db.insert(checklistItems).values({
            countyId: county.id,
            title: item.title,
            description: item.description,
            category: item.category,
            order: item.order,
            projectType: item.projectType as any,
            isRequired: item.isRequired,
          });
        }
      } catch (error) {
        console.error(`✗ Error creating checklist item for ${county.name}:`, error);
      }
    }
  }
  
  console.log("✓ Checklist items seeded successfully");
}

async function main() {
  try {
    await seedCounties();
    await seedChecklistItems();
    console.log("✓ Database seeding completed successfully!");
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    process.exit(1);
  }
}

main();

export { seedCounties, seedChecklistItems };
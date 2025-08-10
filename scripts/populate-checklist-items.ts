import { db } from "../server/db";
import { checklistItems } from "../shared/schema";

// Sample checklist items for different project types and counties
const sampleChecklistItems = [
  // Miami-Dade County - Residential New Construction
  {
    countyId: "miami-dade",
    projectType: "residential_new",
    title: "Building Permit Application",
    description: "Complete and submit building permit application with all required signatures",
    category: "application",
    isRequired: true,
    sortOrder: 1,
  },
  {
    countyId: "miami-dade",
    projectType: "residential_new", 
    title: "Site Plan",
    description: "Detailed site plan showing property boundaries, setbacks, and proposed structure location",
    category: "plans",
    isRequired: true,
    sortOrder: 2,
  },
  {
    countyId: "miami-dade",
    projectType: "residential_new",
    title: "Structural Plans",
    description: "Complete structural drawings sealed by a Florida licensed engineer",
    category: "plans",
    isRequired: true,
    sortOrder: 3,
  },
  {
    countyId: "miami-dade",
    projectType: "residential_new",
    title: "Hurricane Impact Windows Certificate",
    description: "NOA (Notice of Acceptance) for hurricane impact windows and doors",
    category: "certifications",
    isRequired: true,
    sortOrder: 4,
  },
  {
    countyId: "miami-dade",
    projectType: "residential_new",
    title: "Flood Zone Certificate",
    description: "Elevation certificate if property is in flood zone",
    category: "certifications",
    isRequired: false,
    sortOrder: 5,
  },

  // Orange County - Commercial New Construction
  {
    countyId: "orange",
    projectType: "commercial_new",
    title: "Commercial Building Permit Application", 
    description: "Complete commercial permit application with contractor information",
    category: "application",
    isRequired: true,
    sortOrder: 1,
  },
  {
    countyId: "orange",
    projectType: "commercial_new",
    title: "Architectural Plans",
    description: "Complete architectural plans sealed by Florida licensed architect",
    category: "plans", 
    isRequired: true,
    sortOrder: 2,
  },
  {
    countyId: "orange",
    projectType: "commercial_new",
    title: "MEP Plans",
    description: "Mechanical, electrical, and plumbing plans sealed by licensed engineers",
    category: "plans",
    isRequired: true,
    sortOrder: 3,
  },
  {
    countyId: "orange",
    projectType: "commercial_new",
    title: "Fire Department Review",
    description: "Fire department plan review and approval for commercial occupancy",
    category: "approvals",
    isRequired: true,
    sortOrder: 4,
  },
  {
    countyId: "orange",
    projectType: "commercial_new",
    title: "Traffic Impact Study",
    description: "Traffic impact analysis for developments generating significant traffic",
    category: "studies",
    isRequired: false,
    sortOrder: 5,
  },

  // Broward County - Residential Renovation
  {
    countyId: "broward",
    projectType: "residential_renovation",
    title: "Renovation Permit Application",
    description: "Building permit application for residential renovation work",
    category: "application", 
    isRequired: true,
    sortOrder: 1,
  },
  {
    countyId: "broward",
    projectType: "residential_renovation",
    title: "Existing Structure Survey",
    description: "Survey of existing conditions and proposed modifications",
    category: "documentation",
    isRequired: true,
    sortOrder: 2,
  },
  {
    countyId: "broward", 
    projectType: "residential_renovation",
    title: "Structural Modifications Plan",
    description: "Plans for any structural changes sealed by licensed engineer",
    category: "plans",
    isRequired: false,
    sortOrder: 3,
  },
  {
    countyId: "broward",
    projectType: "residential_renovation", 
    title: "Electrical Upgrade Plans",
    description: "Electrical plans if upgrading service or adding circuits",
    category: "plans",
    isRequired: false,
    sortOrder: 4,
  },

  // Hillsborough County - Multi-Family
  {
    countyId: "hillsborough",
    projectType: "multi_family",
    title: "Multi-Family Development Application",
    description: "Complete application for multi-family residential development",
    category: "application",
    isRequired: true,
    sortOrder: 1,
  },
  {
    countyId: "hillsborough", 
    projectType: "multi_family",
    title: "Master Site Plan",
    description: "Comprehensive site plan showing all buildings, parking, and amenities",
    category: "plans",
    isRequired: true,
    sortOrder: 2,
  },
  {
    countyId: "hillsborough",
    projectType: "multi_family",
    title: "Building Plans for Each Type",
    description: "Complete building plans for each unit type in development",
    category: "plans", 
    isRequired: true,
    sortOrder: 3,
  },
  {
    countyId: "hillsborough",
    projectType: "multi_family",
    title: "Drainage and Utilities Plan",
    description: "Stormwater management and utility infrastructure plans",
    category: "engineering",
    isRequired: true,
    sortOrder: 4,
  },
  {
    countyId: "hillsborough",
    projectType: "multi_family",
    title: "Affordable Housing Compliance",
    description: "Documentation for affordable housing requirements if applicable",
    category: "compliance",
    isRequired: false,
    sortOrder: 5,
  },

  // Lee County - Industrial
  {
    countyId: "lee",
    projectType: "industrial",
    title: "Industrial Development Application",
    description: "Comprehensive application for industrial facility construction",
    category: "application",
    isRequired: true, 
    sortOrder: 1,
  },
  {
    countyId: "lee",
    projectType: "industrial",
    title: "Environmental Impact Assessment",
    description: "Environmental review and impact mitigation plans",
    category: "environmental",
    isRequired: true,
    sortOrder: 2,
  },
  {
    countyId: "lee",
    projectType: "industrial", 
    title: "Industrial Process Plans",
    description: "Detailed plans of industrial processes and equipment",
    category: "plans",
    isRequired: true,
    sortOrder: 3,
  },
  {
    countyId: "lee",
    projectType: "industrial",
    title: "Hazmat Storage Plans",
    description: "Plans for hazardous material storage and handling if applicable",
    category: "safety",
    isRequired: false,
    sortOrder: 4,
  },
];

async function populateChecklistItems() {
  try {
    console.log("Populating checklist items...");
    
    for (const item of sampleChecklistItems) {
      await db.insert(checklistItems).values(item).onConflictDoNothing();
      console.log(`Added checklist item: ${item.title} for ${item.countyId}`);
    }
    
    console.log("Successfully populated checklist items!");
  } catch (error) {
    console.error("Error populating checklist items:", error);
  }
}

populateChecklistItems();
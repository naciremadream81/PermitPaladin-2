-- Initialize PermitPaladin database with sample data

-- Insert Florida counties
INSERT INTO counties (id, name, slug, state, building_dept_phone, building_dept_email, building_dept_website) VALUES
('miami-dade', 'Miami-Dade County', 'miami-dade', 'FL', '(305) 375-2900', 'building@miamidade.gov', 'https://www.miamidade.gov/permits/'),
('broward', 'Broward County', 'broward', 'FL', '(954) 765-4400', 'permits@broward.org', 'https://www.broward.org/permits/'),
('palm-beach', 'Palm Beach County', 'palm-beach', 'FL', '(561) 233-5000', 'permits@pbcgov.org', 'https://discover.pbcgov.org/permits/'),
('hillsborough', 'Hillsborough County', 'hillsborough', 'FL', '(813) 272-5600', 'permits@hcfl.gov', 'https://www.hillsboroughcounty.org/permits/'),
('orange', 'Orange County', 'orange', 'FL', '(407) 836-5555', 'permits@ocfl.net', 'https://www.ocfl.net/permits/'),
('pinellas', 'Pinellas County', 'pinellas', 'FL', '(727) 464-3888', 'permits@pinellas.gov', 'https://www.pinellas.gov/permits/'),
('duval', 'Duval County', 'duval', 'FL', '(904) 255-8500', 'permits@coj.net', 'https://www.coj.net/permits/'),
('lee', 'Lee County', 'lee', 'FL', '(239) 533-8999', 'permits@leegov.com', 'https://www.leegov.com/permits/'),
('volusia', 'Volusia County', 'volusia', 'FL', '(386) 736-5955', 'permits@volusia.org', 'https://www.volusia.org/permits/'),
('brevard', 'Brevard County', 'brevard', 'FL', '(321) 633-2070', 'permits@brevardfl.gov', 'https://www.brevardfl.gov/permits/');

-- Insert sample checklist items for Miami-Dade County
INSERT INTO checklist_items (id, county_id, project_type, title, description, is_required, document_type, category, "order") VALUES
('md-res-1', 'miami-dade', 'residential_new', 'Building Permit Application', 'Complete building permit application form', true, 'application_form', 'Application', 1),
('md-res-2', 'miami-dade', 'residential_new', 'Site Plan', 'Detailed site plan showing property boundaries, setbacks, and building location', true, 'site_plan', 'Plans', 2),
('md-res-3', 'miami-dade', 'residential_new', 'Floor Plans', 'Complete floor plans for all levels', true, 'floor_plan', 'Plans', 3),
('md-res-4', 'miami-dade', 'residential_new', 'Structural Details', 'Structural calculations and details', true, 'structural_details', 'Engineering', 4),
('md-res-5', 'miami-dade', 'residential_new', 'Electrical Plans', 'Electrical layout and specifications', true, 'electrical_schematics', 'Plans', 5),
('md-res-6', 'miami-dade', 'residential_new', 'Plumbing Plans', 'Plumbing layout and specifications', true, 'plumbing_plans', 'Plans', 6),
('md-res-7', 'miami-dade', 'residential_new', 'Energy Compliance', 'Energy code compliance documentation', true, 'energy_compliance', 'Compliance', 7),
('md-res-8', 'miami-dade', 'residential_new', 'Flood Certificate', 'Flood zone determination certificate', true, 'flood_certificate', 'Compliance', 8),
('md-res-9', 'miami-dade', 'residential_new', 'Property Survey', 'Current property survey', true, 'property_survey', 'Survey', 9),
('md-res-10', 'miami-dade', 'residential_new', 'Impact Fee Calculation', 'Impact fee calculation and payment', true, 'impact_fee_calculation', 'Fees', 10);

-- Insert sample checklist items for Broward County
INSERT INTO checklist_items (id, county_id, project_type, title, description, is_required, document_type, category, "order") VALUES
('br-res-1', 'broward', 'residential_new', 'Building Permit Application', 'Complete building permit application form', true, 'application_form', 'Application', 1),
('br-res-2', 'broward', 'residential_new', 'Site Plan', 'Detailed site plan showing property boundaries, setbacks, and building location', true, 'site_plan', 'Plans', 2),
('br-res-3', 'broward', 'residential_new', 'Floor Plans', 'Complete floor plans for all levels', true, 'floor_plan', 'Plans', 3),
('br-res-4', 'broward', 'residential_new', 'Structural Details', 'Structural calculations and details', true, 'structural_details', 'Engineering', 4),
('br-res-5', 'broward', 'residential_new', 'Electrical Plans', 'Electrical layout and specifications', true, 'electrical_schematics', 'Plans', 5),
('br-res-6', 'broward', 'residential_new', 'Plumbing Plans', 'Plumbing layout and specifications', true, 'plumbing_plans', 'Plans', 6),
('br-res-7', 'broward', 'residential_new', 'Energy Compliance', 'Energy code compliance documentation', true, 'energy_compliance', 'Compliance', 7),
('br-res-8', 'broward', 'residential_new', 'Flood Certificate', 'Flood zone determination certificate', true, 'flood_certificate', 'Compliance', 8),
('br-res-9', 'broward', 'residential_new', 'Property Survey', 'Current property survey', true, 'property_survey', 'Survey', 9),
('br-res-10', 'broward', 'residential_new', 'Impact Fee Calculation', 'Impact fee calculation and payment', true, 'impact_fee_calculation', 'Fees', 10);

-- Insert sample checklist items for commercial projects
INSERT INTO checklist_items (id, county_id, project_type, title, description, is_required, document_type, category, "order") VALUES
('md-com-1', 'miami-dade', 'commercial_new', 'Building Permit Application', 'Complete building permit application form', true, 'application_form', 'Application', 1),
('md-com-2', 'miami-dade', 'commercial_new', 'Site Plan', 'Detailed site plan showing property boundaries, setbacks, and building location', true, 'site_plan', 'Plans', 2),
('md-com-3', 'miami-dade', 'commercial_new', 'Floor Plans', 'Complete floor plans for all levels', true, 'floor_plan', 'Plans', 3),
('md-com-4', 'miami-dade', 'commercial_new', 'Structural Details', 'Structural calculations and details', true, 'structural_details', 'Engineering', 4),
('md-com-5', 'miami-dade', 'commercial_new', 'Electrical Plans', 'Electrical layout and specifications', true, 'electrical_schematics', 'Plans', 5),
('md-com-6', 'miami-dade', 'commercial_new', 'Mechanical Plans', 'HVAC and mechanical system plans', true, 'mechanical_plans', 'Plans', 6),
('md-com-7', 'miami-dade', 'commercial_new', 'Plumbing Plans', 'Plumbing layout and specifications', true, 'plumbing_plans', 'Plans', 7),
('md-com-8', 'miami-dade', 'commercial_new', 'Fire Department Approval', 'Fire safety and sprinkler system approval', true, 'fire_dept_approval', 'Safety', 8),
('md-com-9', 'miami-dade', 'commercial_new', 'Energy Compliance', 'Energy code compliance documentation', true, 'energy_compliance', 'Compliance', 9),
('md-com-10', 'miami-dade', 'commercial_new', 'Accessibility Compliance', 'ADA accessibility compliance documentation', true, 'other', 'Compliance', 10);

/**
 * MTKmicro Lab - Food Safety Intelligence Knowledge Base & Deterministic Hazard Engine
 * Authoritative, rule-based microbiological testing recommendations & reference data
 */

import {
  SuspectedOrganism,
  MediaReference,
  MyLabResource,
  FoodTestPlanItem,
  ReferenceKnowledgeEntry,
  FoodSample,
  FoodRiskFactors,
} from '../types';

export const KNOWLEDGE_BASE_METADATA = {
  title: 'MTKmicro Deterministic Food Safety Knowledge Base',
  version: '1.0.0',
  lastVerifiedDate: '2026-08-01',
  authoritativeSources: ['FDA BAM', 'ISO', 'Codex Alimentarius', 'AOAC International'],
  disclaimer:
    'Food sample characteristics indicate risk-based potential targets. Food type alone cannot confirm contamination. Laboratory screening and confirmatory testing are required.',
};

export const FOOD_CATEGORIES = [
  'Dairy',
  'Meat',
  'Poultry',
  'Eggs',
  'Seafood',
  'Fish',
  'Shellfish',
  'Rice',
  'Cereals',
  'Flour',
  'Bakery',
  'Ready-to-eat foods',
  'Vegetables',
  'Fruits',
  'Juices',
  'Spices',
  'Sauces',
  'Canned foods',
  'Frozen foods',
  'Water',
  'Infant foods',
  'Other',
];

export const SUSPECTED_ORGANISMS_DB: SuspectedOrganism[] = [
  {
    id: 'org_salmonella',
    organism: 'Salmonella spp.',
    commonFoodAssociations: ['Poultry', 'Eggs', 'Meat', 'Raw milk', 'Spices', 'Seafood', 'Produce', 'Chocolate'],
    foodCategories: ['Poultry', 'Eggs', 'Meat', 'Dairy', 'Spices', 'Seafood', 'Vegetables', 'Fruits', 'Infant foods'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Major foodborne enteric pathogen associated with raw animal products, cross-contamination, and low-moisture foods.',
    recommendedDetection: 'Non-selective pre-enrichment (BPW) -> Selective enrichment (RVS/MKTTn broth) -> Selective plating (XLD, Bismuth Sulphite Agar).',
    recommendedConfirmation: 'Biochemical screening (TSI/LIA) and serological polyvalent O & H antisera or PCR/MALDI-TOF confirmation.',
    referenceMethod: 'ISO 6579-1:2017 / FDA BAM Chapter 5',
    notes: 'Zero-tolerance pathogen in Ready-To-Eat (RTE) foods (Absence in 25g).',
    limitations: 'Screening agars yield presumptive colonies; biochemical/serological confirmation is mandatory.',
  },
  {
    id: 'org_listeria',
    organism: 'Listeria monocytogenes',
    commonFoodAssociations: ['Ready-to-eat foods', 'Soft cheeses', 'Unpasteurized milk', 'Deli meats', 'Smoked fish', 'Prepared salads'],
    foodCategories: ['Dairy', 'Meat', 'Seafood', 'Fish', 'Ready-to-eat foods', 'Vegetables'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Psychrotrophic pathogen capable of growth at refrigeration temperatures (4°C); high mortality in vulnerable populations.',
    recommendedDetection: 'Selective primary enrichment (Half-Fraser) -> Secondary enrichment (Fraser broth) -> Plating on Chromogenic Listeria Agar / PALCAM / Oxford.',
    recommendedConfirmation: 'Gram stain, catalase (+), motility, CAMP test, rhamnose/xylose fermentation, or molecular assays.',
    referenceMethod: 'ISO 11290-1:2017 / FDA BAM Chapter 10',
    notes: 'Environmental monitoring in RTE food production plants is strongly advised.',
    limitations: 'Listeria innocua may co-exist and produce similar colonies on non-chromogenic media.',
  },
  {
    id: 'org_ecoli_stec',
    organism: 'Escherichia coli / STEC',
    commonFoodAssociations: ['Raw ground beef', 'Unpasteurized juices', 'Raw milk', 'Leafy greens', 'Sprouts'],
    foodCategories: ['Meat', 'Dairy', 'Vegetables', 'Juices', 'Water', 'Poultry'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Shiga toxin-producing E. coli (STEC / EHEC) cause severe hemorrhagic colitis and Hemolytic Uremic Syndrome (HUS).',
    recommendedDetection: 'Enrichment in mTSB + novobiocin -> Immunomagnetic separation (IMS) -> Plating on C-SMAC or Chromogenic STEC Agar.',
    recommendedConfirmation: 'PCR for stx1, stx2, eae genes, or O157 serogroup latex agglutination.',
    referenceMethod: 'ISO 16654 / FDA BAM Chapter 4A',
    notes: 'Indicator E. coli signifies fecal contamination; STEC detection targets specific virulence factors.',
    limitations: 'Sorbitol-positive non-O157 STEC strains require gene-specific screening.',
  },
  {
    id: 'org_staph_aureus',
    organism: 'Staphylococcus aureus',
    commonFoodAssociations: ['Cooked meats', 'Cream-filled bakery goods', 'Dairy products', 'Hand-handled RTE foods'],
    foodCategories: ['Dairy', 'Meat', 'Bakery', 'Ready-to-eat foods', 'Eggs', 'Poultry'],
    hazardCategory: 'Toxin Producer',
    whyRelevant: 'Produces heat-stable enterotoxins when multiplying above 10°C in food. Toxins resist normal cooking heat.',
    recommendedDetection: 'Direct enumeration on Baird-Parker (BP) Agar with Egg Yolk Tellurite emulsion.',
    recommendedConfirmation: 'Coagulase test (rabbit plasma) or Staphylococcal enterotoxin ELISA/immunoassay.',
    referenceMethod: 'ISO 6888-1 / FDA BAM Chapter 12',
    notes: 'Toxin production typically occurs at counts > 10^5 CFU/g.',
    limitations: 'Detection of organisms does not prove enterotoxin presence; heat processing may destroy cells while leaving toxin intact.',
  },
  {
    id: 'org_bacillus_cereus',
    organism: 'Bacillus cereus',
    commonFoodAssociations: ['Cooked rice', 'Fried rice', 'Pasta', 'Cereals', 'Spices', 'Dried soups', 'Dairy powders'],
    foodCategories: ['Rice', 'Cereals', 'Flour', 'Spices', 'Dairy', 'Bakery', 'Ready-to-eat foods'],
    hazardCategory: 'Toxin Producer',
    whyRelevant: 'Spore-forming bacterium producing emetic (vomiting) toxin in starchy foods and diarrheal enterotoxin in protein foods.',
    recommendedDetection: 'Enumeration on Mannitol Egg Yolk Polymyxin (MYP) Agar or Mossel Agar.',
    recommendedConfirmation: 'Hemolysis test on Sheep Blood Agar, glucose fermentation, and nitrate reduction.',
    referenceMethod: 'ISO 7932 / FDA BAM Chapter 14',
    notes: 'Improper cooling and holding of cooked rice/pasta is the primary outbreak trigger.',
    limitations: 'Other Bacillus species (B. thuringiensis, B. mycoides) show similar colony morphology on MYP agar.',
  },
  {
    id: 'org_clostridium_botulinum',
    organism: 'Clostridium botulinum',
    commonFoodAssociations: ['Canned foods', 'Vacuum-packaged fish', 'Garlic in oil', 'Fermented foods', 'Honey (infants)'],
    foodCategories: ['Canned foods', 'Seafood', 'Fish', 'Sauces', 'Infant foods', 'Vegetables'],
    hazardCategory: 'Toxin Producer',
    whyRelevant: 'Obligate anaerobic spore-former that produces neurotoxins causing lethal botulism in low-acid foods.',
    recommendedDetection: 'Anaerobic enrichment in Cooked Meat Medium (CMM) or TPGY broth at 28°C / 35°C.',
    recommendedConfirmation: 'Mouse bioassay or validated ELISA / PCR detection of botulinum neurotoxin genes (A, B, E, F).',
    referenceMethod: 'FDA BAM Chapter 17',
    notes: 'Strict anaerobic techniques and specialized biosafety procedures required.',
    limitations: 'High-level pathogen handling constraints apply. Requires accredited reference facility.',
  },
  {
    id: 'org_clostridium_perfringens',
    organism: 'Clostridium perfringens',
    commonFoodAssociations: ['Cooked meat dishes', 'Gravies', 'Poultry stews', 'Institutional food service dishes'],
    foodCategories: ['Meat', 'Poultry', 'Sauces', 'Ready-to-eat foods'],
    hazardCategory: 'Toxin Producer',
    whyRelevant: 'Rapidly multiplies in slow-cooled cooked meats under anaerobic conditions; enterotoxin causes severe gastroenteritis.',
    recommendedDetection: 'Anaerobic enumeration on Tryptose Sulfite Cycloserine (TSC) Agar.',
    recommendedConfirmation: 'Acid phosphatase reaction, lactose fermentation, gelatin liquefaction, and motility (-).',
    referenceMethod: 'ISO 7937 / FDA BAM Chapter 16',
    notes: 'Black colonies surrounded by a zone of precipitation on TSC agar.',
    limitations: 'Presumptive sulfite-reducing anaerobes require biochemical validation.',
  },
  {
    id: 'org_campylobacter',
    organism: 'Campylobacter spp.',
    commonFoodAssociations: ['Raw poultry', 'Unpasteurized milk', 'Untreated water', 'Raw meats'],
    foodCategories: ['Poultry', 'Meat', 'Dairy', 'Water'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Microaerophilic pathogen; leading cause of bacterial gastroenteritis worldwide, often linked to raw poultry.',
    recommendedDetection: 'Microaerophilic enrichment in Bolton broth -> Plating on mCCDA or Preston Agar at 41.5°C.',
    recommendedConfirmation: 'Gram stain (curved S-shaped rods), oxidase (+), catalase (+), and hippurate hydrolysis (C. jejuni).',
    referenceMethod: 'ISO 10272-1 / FDA BAM Chapter 7',
    notes: 'Requires microaerophilic incubation atmosphere (5% O2, 10% CO2, 85% N2).',
    limitations: 'Sensitive to ambient oxygen and drying; samples must be tested promptly.',
  },
  {
    id: 'org_vibrio',
    organism: 'Vibrio spp. (V. parahaemolyticus / V. vulnificus / V. cholerae)',
    commonFoodAssociations: ['Raw oysters', 'Shellfish', 'Crab', 'Shrimp', 'Marine seafood', 'Brine products'],
    foodCategories: ['Seafood', 'Fish', 'Shellfish'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Halophilic marine pathogens associated with raw/undercooked seafood; V. vulnificus can cause fatal septicemia.',
    recommendedDetection: 'Enrichment in Alkaline Peptone Water (APW) with 2% NaCl -> Plating on TCBS Agar.',
    recommendedConfirmation: 'Sucrose reaction on TCBS (V. cholerae = yellow, V. parahaemolyticus = green), salt tolerance test (0-10% NaCl), PCR.',
    referenceMethod: 'ISO 21872-1 / FDA BAM Chapter 9',
    notes: 'TCBS Agar is the gold-standard selective medium for Vibrio spp.',
    limitations: 'TCBS sucrose reaction is presumptive; halotolerance and molecular confirmation are required.',
  },
  {
    id: 'org_indicators',
    organism: 'Enterobacterales / Coliforms / APC',
    commonFoodAssociations: ['All food categories', 'Processed foods', 'Water', 'Environmental swabs'],
    foodCategories: ['Dairy', 'Meat', 'Poultry', 'Eggs', 'Seafood', 'Fish', 'Shellfish', 'Rice', 'Cereals', 'Flour', 'Bakery', 'Ready-to-eat foods', 'Vegetables', 'Fruits', 'Juices', 'Spices', 'Sauces', 'Canned foods', 'Frozen foods', 'Water', 'Infant foods', 'Other'],
    hazardCategory: 'Indicator',
    whyRelevant: 'Assesses total microbial load, hygiene standards, sanitation efficacy, and post-processing contamination.',
    recommendedDetection: 'Plate Count Agar (APC/TVC) or VRBG Agar (Enterobacterales) or VRBL Agar / Petrifilm (Coliforms).',
    recommendedConfirmation: 'Gas production in EC broth (fecal coliforms) or indole test for E. coli.',
    referenceMethod: 'ISO 4833-1 (APC) / ISO 21528-2 (Enterobacterales) / FDA BAM Chapter 3',
    notes: 'Key benchmark indicator for process control and hygiene auditing.',
    limitations: 'High indicator counts suggest process breakdown but do not confirm pathogen presence.',
  },
  {
    id: 'org_yeasts_molds',
    organism: 'Yeasts and Molds',
    commonFoodAssociations: ['Fruits', 'Juices', 'Bakery', 'Cheese', 'Spices', 'Flour', 'Dried foods'],
    foodCategories: ['Fruits', 'Juices', 'Bakery', 'Dairy', 'Spices', 'Flour', 'Cereals'],
    hazardCategory: 'Spoilage',
    whyRelevant: 'Primary cause of fungal spoilage in low pH or low water activity (aw) foods; potential mycotoxin producers.',
    recommendedDetection: 'Enumeration on Dichloran Rose Bengal Chloramphenicol (DRBC) or Dichloran 18% Glycerol (DG18) Agar.',
    recommendedConfirmation: 'Microscopic examination for hyphae, conidia, yeast budding cells.',
    referenceMethod: 'ISO 21527-1/2 / FDA BAM Chapter 18',
    notes: 'Incubate plates at 25°C for 5-7 days in dark.',
    limitations: 'Mycotoxin analysis requires specialized HPLC/LC-MS testing.',
  },
  {
    id: 'org_cronobacter',
    organism: 'Cronobacter sakazakii',
    commonFoodAssociations: ['Powdered infant formula', 'Infant cereals', 'Milk powder'],
    foodCategories: ['Infant foods', 'Dairy'],
    hazardCategory: 'Pathogen',
    whyRelevant: 'Opportunistic pathogen causing severe neonatal meningitis and necrotizing enterocolitis in infants.',
    recommendedDetection: 'Pre-enrichment in water -> Enrichment in CSB -> Plating on Chromogenic Cronobacter Agar (CCI).',
    recommendedConfirmation: 'Yellow pigment production at 25°C on TSA, ID32E biochemical strip, or PCR.',
    referenceMethod: 'ISO 22964 / FDA BAM Chapter 29',
    notes: 'Strict regulatory monitoring in powdered infant formula production.',
    limitations: 'Zero tolerance in infant formula products.',
  },
];

export const MEDIA_DATABASE: MediaReference[] = [
  {
    id: 'media_tcbs',
    mediumName: 'Thiosulfate-Citrate-Bile Salts-Sucrose Agar',
    abbreviation: 'TCBS',
    purpose: 'Selective isolation and differentiation of pathogenic Vibrio species.',
    targetGroup: 'Vibrio spp. (V. cholerae, V. parahaemolyticus, V. vulnificus)',
    differentialCharacteristics: 'Sucrose fermenters (V. cholerae) form yellow colonies; non-sucrose fermenters (V. parahaemolyticus) form green colonies.',
    selectiveCharacteristics: 'High pH (8.6), sodium thiosulfate, sodium citrate, and bile salts inhibit Gram-positive bacteria and coliforms.',
    relevantTestCategory: 'Vibrio testing',
    reference: 'FDA BAM Chapter 9 / ISO 21872',
    limitations: 'Some Enterococcus or Pseudomonas strains may grow as pinpoint colonies. Presumptive only.',
  },
  {
    id: 'media_xld',
    mediumName: 'Xylose Lysine Deoxycholate Agar',
    abbreviation: 'XLD',
    purpose: 'Selective isolation and differentiation of Salmonella and Shigella species from food and clinical specimens.',
    targetGroup: 'Salmonella spp., Shigella spp.',
    differentialCharacteristics: 'Salmonella forms red colonies with black H2S centers; Shigella forms pink/red colonies without black centers; Coliforms form yellow colonies.',
    selectiveCharacteristics: 'Sodium deoxycholate inhibits Gram-positive organisms. Xylose, lysine, and ferric ammonium citrate provide differentiation.',
    relevantTestCategory: 'Salmonella detection',
    reference: 'ISO 6579-1 / FDA BAM Chapter 5',
    limitations: 'Proteus vulgaris can mimic Salmonella black centers; lysine decarboxylase confirmation required.',
  },
  {
    id: 'media_bsa',
    mediumName: 'Bismuth Sulphite Agar',
    abbreviation: 'BSA',
    purpose: 'Highly selective medium for isolation of Salmonella Typhi and other Salmonellae from foods.',
    targetGroup: 'Salmonella spp.',
    differentialCharacteristics: 'Salmonella colonies are black or green with a metallic sheen and surrounding black precipitate.',
    selectiveCharacteristics: 'Bismuth sulphite and brilliant green dye inhibit coliforms and Gram-positive organisms.',
    relevantTestCategory: 'Salmonella detection',
    reference: 'FDA BAM Chapter 5',
    limitations: 'Highly inhibitory; incubate up to 48 hours before recording negative results.',
  },
  {
    id: 'media_macconkey',
    mediumName: 'MacConkey Agar',
    abbreviation: 'MAC',
    purpose: 'Selective and differential medium for isolation of Gram-negative enteric bacilli.',
    targetGroup: 'Enterobacteriaceae, Coliforms, E. coli',
    differentialCharacteristics: 'Lactose fermenters (E. coli, Klebsiella) produce pink/red colonies with bile precipitate; non-fermenters (Salmonella, Shigella) are colorless.',
    selectiveCharacteristics: 'Bile salts and crystal violet inhibit Gram-positive bacteria.',
    relevantTestCategory: 'Coliform / E. coli testing',
    reference: 'FDA BAM Chapter 4',
    limitations: 'Gram-negative non-enteric bacilli (e.g. Pseudomonas) may also grow as colorless colonies.',
  },
  {
    id: 'media_emb',
    mediumName: 'Eosin Methylene Blue Agar',
    abbreviation: 'EMB',
    purpose: 'Differential medium for isolation and differentiation of Gram-negative enteric pathogens.',
    targetGroup: 'E. coli, Coliforms',
    differentialCharacteristics: 'E. coli displays a characteristic dark colony with green metallic sheen; Enterobacter forms dark pink mucoid colonies.',
    selectiveCharacteristics: 'Eosin Y and methylene blue dyes inhibit Gram-positive organisms.',
    relevantTestCategory: 'E. coli testing',
    reference: 'FDA BAM Chapter 4',
    limitations: 'Metallic sheen is indicative but requires indole / methyl red / VP / citrate (IMViC) confirmation.',
  },
  {
    id: 'media_rvs',
    mediumName: 'Rappaport-Vassiliadis Soy Broth',
    abbreviation: 'RVS',
    purpose: 'Selective enrichment broth for Salmonella species from food products.',
    targetGroup: 'Salmonella spp.',
    differentialCharacteristics: 'Turbidity and color shift indicates growth after 24h at 41.5°C.',
    selectiveCharacteristics: 'Malachite green, magnesium chloride, and elevated temperature (41.5°C) inhibit non-Salmonella organisms.',
    relevantTestCategory: 'Salmonella detection',
    reference: 'ISO 6579-1',
    limitations: 'Enrichment medium only; subculture to selective agar plates is required.',
  },
  {
    id: 'media_baird_parker',
    mediumName: 'Baird-Parker Agar',
    abbreviation: 'BP',
    purpose: 'Selective enumeration and isolation of coagulase-positive Staphylococci in food.',
    targetGroup: 'Staphylococcus aureus',
    differentialCharacteristics: 'S. aureus forms jet-black, shiny colonies surrounded by a clear zone (egg yolk lecithinase) and opaque halo.',
    selectiveCharacteristics: 'Lithium chloride and potassium tellurite inhibit non-staphylococcal flora.',
    relevantTestCategory: 'Staphylococcal testing',
    reference: 'ISO 6888-1 / FDA BAM Chapter 12',
    limitations: 'Coagulase test must be performed on black colonies with or without clear zones.',
  },
  {
    id: 'media_myp',
    mediumName: 'Mannitol Egg Yolk Polymyxin Agar',
    abbreviation: 'MYP',
    purpose: 'Selective enumeration and detection of Bacillus cereus in food items.',
    targetGroup: 'Bacillus cereus',
    differentialCharacteristics: 'B. cereus forms pink-red mannitol-negative colonies surrounded by a distinct egg-yolk precipitation zone (lecithinase+).',
    selectiveCharacteristics: 'Polymyxin B inhibits Gram-negative background flora.',
    relevantTestCategory: 'Bacillus cereus testing',
    reference: 'ISO 7932 / FDA BAM Chapter 14',
    limitations: 'Bacillus thuringiensis and Bacillus mycoides produce identical colony appearances.',
  },
  {
    id: 'media_palcam',
    mediumName: 'PALCAM Agar',
    abbreviation: 'PALCAM',
    purpose: 'Selective isolation and detection of Listeria monocytogenes from food.',
    targetGroup: 'Listeria monocytogenes',
    differentialCharacteristics: 'Listeria forms small grey-green colonies with black halos due to aesculin hydrolysis.',
    selectiveCharacteristics: 'Polymyxin B, acriflavine, ceftazidime, and lithium chloride inhibit Gram-negative and non-Listeria Gram-positive flora.',
    relevantTestCategory: 'Listeria detection',
    reference: 'ISO 11290-1',
    limitations: 'Listeria innocua forms identical black-haloed colonies; biochemical/molecular confirmation required.',
  },
  {
    id: 'media_tsc',
    mediumName: 'Tryptose Sulfite Cycloserine Agar',
    abbreviation: 'TSC',
    purpose: 'Selective enumeration of Clostridium perfringens in foods.',
    targetGroup: 'Clostridium perfringens',
    differentialCharacteristics: 'Forms distinct black colonies under anaerobic conditions due to sulfite reduction.',
    selectiveCharacteristics: 'D-cycloserine inhibits background aerobic and facultative flora.',
    relevantTestCategory: 'Clostridial testing',
    reference: 'ISO 7937 / FDA BAM Chapter 16',
    limitations: 'Anaerobic jar/incubator is required. Non-perfringens sulfite reducers can grow.',
  },
];

export const REFERENCE_STANDARDS_KB: ReferenceKnowledgeEntry[] = [
  {
    id: 'ref_fda_bam_5',
    referenceName: 'FDA Bacteriological Analytical Manual Chapter 5',
    methodIdentifier: 'FDA BAM Ch. 5',
    versionDate: '2023 Revision',
    source: 'FDA BAM',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'Reference detection method for Salmonella in food matrixes.',
  },
  {
    id: 'ref_fda_bam_10',
    referenceName: 'FDA Bacteriological Analytical Manual Chapter 10',
    methodIdentifier: 'FDA BAM Ch. 10',
    versionDate: '2022 Revision',
    source: 'FDA BAM',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'Detection and enumeration of Listeria monocytogenes in foods.',
  },
  {
    id: 'ref_iso_6579',
    referenceName: 'ISO 6579-1:2017 Microbiology of the food chain',
    methodIdentifier: 'ISO 6579-1:2017',
    versionDate: '2017 / Amd 1:2020',
    source: 'ISO',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'Horizontal method for detection of Salmonella spp.',
  },
  {
    id: 'ref_iso_11290',
    referenceName: 'ISO 11290-1:2017 Detection of Listeria monocytogenes',
    methodIdentifier: 'ISO 11290-1:2017',
    versionDate: '2017 Edition',
    source: 'ISO',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'Standard method for food & environmental samples.',
  },
  {
    id: 'ref_iso_21872',
    referenceName: 'ISO 21872-1:2017 Detection of enteropathogenic Vibrio spp.',
    methodIdentifier: 'ISO 21872-1:2017',
    versionDate: '2017 Edition',
    source: 'ISO',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'Standard detection method for V. parahaemolyticus and V. cholerae in seafood.',
  },
  {
    id: 'ref_codex_21',
    referenceName: 'Codex Alimentarius Principles for Microbiological Criteria',
    methodIdentifier: 'CAC/GL 21-1997',
    versionDate: 'Revalidated 2021',
    source: 'Codex',
    verificationStatus: 'Verified',
    lastVerifiedDate: '2026-08-01',
    notes: 'International safety framework for food trade.',
  },
];

export const INITIAL_LAB_RESOURCES: MyLabResource[] = [
  { id: 'res_1', category: 'MEDIA', name: 'TCBS Agar', isAvailable: true, notes: 'Stocked for Vibrio testing' },
  { id: 'res_2', category: 'MEDIA', name: 'XLD Agar', isAvailable: true, notes: 'Stocked for Salmonella testing' },
  { id: 'res_3', category: 'MEDIA', name: 'MacConkey Agar', isAvailable: true, notes: 'Coliform / E. coli screening' },
  { id: 'res_4', category: 'MEDIA', name: 'Baird-Parker Agar', isAvailable: true, notes: 'Staph aureus isolation' },
  { id: 'res_5', category: 'MEDIA', name: 'PALCAM / Chromogenic Listeria Agar', isAvailable: false, notes: 'Reorder pending' },
  { id: 'res_6', category: 'EQUIPMENT', name: 'Incubator (35°C - 37°C)', isAvailable: true, notes: 'Operational' },
  { id: 'res_7', category: 'EQUIPMENT', name: 'Refrigerated Incubator (25°C)', isAvailable: true, notes: 'Yeast/mold testing' },
  { id: 'res_8', category: 'EQUIPMENT', name: 'Anaerobic Jar System', isAvailable: true, notes: 'Clostridial testing' },
  { id: 'res_9', category: 'MOLECULAR', name: 'Real-Time qPCR Thermocycler', isAvailable: true, notes: 'Pathogen gene assays' },
  { id: 'res_10', category: 'KITS', name: 'Gram Stain Kit & Light Microscope', isAvailable: true, notes: 'Morphology confirmation' },
];

/**
 * Deterministic Hazard Recommendation Engine
 * Evaluates Food Category + Processing + Storage + Risk Profile -> Potential Organisms + Recommended Test Plan
 */
export function evaluateFoodHazards(
  sample: Partial<FoodSample>,
  userResources: MyLabResource[] = INITIAL_LAB_RESOURCES
): {
  potentialOrganisms: SuspectedOrganism[];
  recommendedTestPlan: Omit<FoodTestPlanItem, 'id' | 'createdAt' | 'updatedAt'>[];
  disclaimers: string[];
} {
  const category = (sample.foodCategory || '').toLowerCase();
  const processing = (sample.processingStatus || '').toLowerCase();
  const storage = (sample.storageCondition || '').toLowerCase();
  const isRTE = !!sample.isReadyToEat;
  const isRaw = sample.isRawOrProcessed === 'RAW' || sample.riskFactors?.isRaw;
  const risks = sample.riskFactors || {};

  const matchedOrganismIds = new Set<string>();
  const testPlan: Omit<FoodTestPlanItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Always include indicator testing for process hygiene
  testPlan.push({
    sampleId: sample.id || 'TEMP',
    targetOrganism: 'Aerobic Plate Count & Indicator Microflora',
    testCategory: 'Aerobic Plate Count',
    testType: 'Enumeration',
    purpose: 'Overall microbial quality & sanitation hygiene assessment.',
    priority: 'High',
    status: 'Not Started',
    referenceMethod: 'ISO 4833-1 / FDA BAM Ch. 3',
    confirmationRequired: false,
    resourceAvailable: true,
  });

  // Category & Characteristic Rules Engine
  if (category.includes('dairy') || risks.containsDairy) {
    matchedOrganismIds.add('org_listeria');
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_staph_aureus');
    matchedOrganismIds.add('org_ecoli_stec');

    if (category.includes('infant') || sample.productType?.toLowerCase().includes('powder')) {
      matchedOrganismIds.add('org_cronobacter');
    }
  }

  if (category.includes('seafood') || category.includes('fish') || category.includes('shellfish') || risks.containsSeafood) {
    matchedOrganismIds.add('org_vibrio');
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_listeria');
    matchedOrganismIds.add('org_indicators');

    if (risks.isVacuumPackaged || risks.isCanned || storage.includes('ambient')) {
      matchedOrganismIds.add('org_clostridium_botulinum');
    }
  }

  if (category.includes('meat') || category.includes('poultry') || risks.containsMeat) {
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_campylobacter');
    matchedOrganismIds.add('org_ecoli_stec');
    matchedOrganismIds.add('org_staph_aureus');
    matchedOrganismIds.add('org_clostridium_perfringens');

    if (isRTE) {
      matchedOrganismIds.add('org_listeria');
    }
  }

  if (category.includes('rice') || category.includes('cereal') || category.includes('flour') || category.includes('bakery')) {
    matchedOrganismIds.add('org_bacillus_cereus');
    matchedOrganismIds.add('org_yeasts_molds');
    matchedOrganismIds.add('org_salmonella');
  }

  if (category.includes('vegetable') || category.includes('fruit') || category.includes('juice')) {
    matchedOrganismIds.add('org_ecoli_stec');
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_listeria');
    matchedOrganismIds.add('org_yeasts_molds');
  }

  if (category.includes('canned') || risks.isCanned || risks.isLowAcid) {
    matchedOrganismIds.add('org_clostridium_botulinum');
    matchedOrganismIds.add('org_bacillus_cereus');
  }

  if (category.includes('spice') || category.includes('sauce')) {
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_bacillus_cereus');
    matchedOrganismIds.add('org_clostridium_perfringens');
    matchedOrganismIds.add('org_yeasts_molds');
  }

  if (category.includes('infant')) {
    matchedOrganismIds.add('org_cronobacter');
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_indicators');
  }

  if (category.includes('water')) {
    matchedOrganismIds.add('org_ecoli_stec');
    matchedOrganismIds.add('org_indicators');
  }

  // Catch-all if no category matched
  if (matchedOrganismIds.size === 0) {
    matchedOrganismIds.add('org_salmonella');
    matchedOrganismIds.add('org_listeria');
    matchedOrganismIds.add('org_ecoli_stec');
    matchedOrganismIds.add('org_staph_aureus');
    matchedOrganismIds.add('org_indicators');
  }

  const potentialOrganisms = SUSPECTED_ORGANISMS_DB.filter(org => matchedOrganismIds.has(org.id));

  // Build specific test plan items for matched organisms
  potentialOrganisms.forEach(org => {
    let testCat = 'Pathogen Screening';
    let priority: 'High' | 'Medium' | 'Low' = 'High';

    if (org.hazardCategory === 'Indicator') {
      testCat = 'Coliform / indicator testing';
      priority = 'Medium';
    } else if (org.organism.includes('Salmonella')) {
      testCat = 'Salmonella detection';
    } else if (org.organism.includes('Listeria')) {
      testCat = 'Listeria detection';
    } else if (org.organism.includes('Vibrio')) {
      testCat = 'Vibrio testing';
    } else if (org.organism.includes('Escherichia') || org.organism.includes('STEC')) {
      testCat = 'E. coli testing';
    } else if (org.organism.includes('Staphylococcus')) {
      testCat = 'Staphylococcal testing';
    } else if (org.organism.includes('Bacillus')) {
      testCat = 'Bacillus cereus testing';
    } else if (org.organism.includes('Campylobacter')) {
      testCat = 'Campylobacter testing';
    } else if (org.organism.includes('Clostridium')) {
      testCat = 'Clostridial testing';
    } else if (org.organism.includes('Yeasts')) {
      testCat = 'Yeast and mold enumeration';
      priority = 'Medium';
    }

    // Check resource match
    const resourceAvailable = userResources.some(
      r =>
        r.isAvailable &&
        (r.name.toLowerCase().includes(org.organism.split(' ')[0].toLowerCase()) ||
          r.notes?.toLowerCase().includes(org.organism.split(' ')[0].toLowerCase()) ||
          r.name.toLowerCase().includes(testCat.toLowerCase()))
    );

    testPlan.push({
      sampleId: sample.id || 'TEMP',
      targetOrganism: org.organism,
      testCategory: testCat,
      testType: org.hazardCategory === 'Indicator' || org.hazardCategory === 'Spoilage' ? 'Enumeration' : 'Detection',
      purpose: org.whyRelevant,
      priority,
      status: 'Not Started',
      referenceMethod: org.referenceMethod,
      confirmationRequired: org.hazardCategory === 'Pathogen' || org.hazardCategory === 'Toxin Producer',
      resourceAvailable,
    });
  });

  const disclaimers = [
    'Food type and characteristics alone cannot confirm or diagnose microbiological contamination.',
    'Identified organisms represent potential, risk-based targets derived from standard food safety literature.',
    'Screening tests yield presumptive findings; confirmation according to recognized reference methods is mandatory before declaring organism presence.',
    'Absence of an organism in a sample test portion does not guarantee absolute freedom from contamination across the entire production lot.',
  ];

  return {
    potentialOrganisms,
    recommendedTestPlan: testPlan,
    disclaimers,
  };
}

import { connectDB } from "../src/lib/db.js";
import CheckSheet from "../src/models/CheckSheet.js";
import Department from "../src/models/Department.js";
import Shift from "../src/models/Shift.js";

async function seedChecksheets() {
  await connectDB();
  console.log("Connected to MongoDB for Checksheets Seeding...");

  const depts = await Department.find();
  const shifts = await Shift.find();

  const mainKitchen = depts.find((d) => d.code === "CAN-KIT") || depts[0];
  const shiftIds = shifts.map((s) => s._id);

  // 1. 25 Main Operational CheckSheets
  const mainTitles = [
    { title: "Food Handler Personal Hygiene & Grooming Audit", cat: "Hygiene & Safety", photos: 1 },
    { title: "Raw Material Receiving & Temp Verification", cat: "Store & Receiving", photos: 1 },
    { title: "Deep Cleaning & Sanitization - Cooking Range", cat: "Cleaning & Sanitation", photos: 1 },
    { title: "Walk-in Freezer & Chiller Temp Monitor", cat: "Cold Chain Monitoring", photos: 1 },
    { title: "Cooking Oil TPM & Degradation Quality Log", cat: "Cooking Quality", photos: 1 },
    { title: "Pot & Utensil High-Temp Sanitization Log", cat: "Cleaning & Sanitation", photos: 1 },
    { title: "Drinking Water RO Plant TDS & Chlorine Log", cat: "Water & Utilities", photos: 0 },
    { title: "Dining Hall UV Sanitization & Fly Catchers", cat: "Dining Hall Hygiene", photos: 1 },
    { title: "Fly Catcher Sticky Pad & UV Inspection", cat: "Pest Management", photos: 1 },
    { title: "Vegetable Sanitization & Chlorine Dip Log", cat: "Prep Operations", photos: 1 },
    { title: "Bakery Proofing & Deck Oven Temperature Log", cat: "Bakery Operations", photos: 1 },
    { title: "Food Waste Segregation & Bio-Bin Disposal", cat: "Waste Management", photos: 1 },
    { title: "SS Working Table Chemical Sanitization", cat: "Cleaning & Sanitation", photos: 1 },
    { title: "Dishwashing Machine Rinse Temp & Titration", cat: "Dishwashing Facility", photos: 1 },
    { title: "Hot Bain Marie Food Holding Temp Check", cat: "Food Holding & Service", photos: 1 },
    { title: "Air Curtain & Insect Screen Operational Log", cat: "Facility Infrastructure", photos: 0 },
    { title: "Canteen First Aid Kit & Emergency Supplies", cat: "Safety & First Aid", photos: 0 },
    { title: "Fire Suppression & PNG Gas Interlock Safety", cat: "Safety & Emergency", photos: 1 },
    { title: "Exhaust Hood Grease Filter Degreasing Log", cat: "Kitchen Exhaust System", photos: 1 },
    { title: "Dining Table Surface Swab Test Verification", cat: "Dining Hall Hygiene", photos: 1 },
    { title: "Refrigerated Display Counter Temperature", cat: "Cold Chain Monitoring", photos: 1 },
    { title: "Food Sample Retention & Deep Freeze Log", cat: "Food Safety Retention", photos: 1 },
    { title: "Milk & Dairy Fat Content Lactometer Log", cat: "Raw Materials Testing", photos: 1 },
    { title: "Color-Coded Chopping Board Sanitization", cat: "Cross-Contamination", photos: 1 },
    { title: "End-of-Shift Kitchen Floor Scrubbing Sign-off", cat: "Cleaning & Sanitation", photos: 1 },
  ];

  // 2. 25 JH CheckSheets (from client Excel)
  const jhTitles = [
    { title: "JH CheckSheet - Four Burner Range (LPG)", cat: "PNG/LPG Equipment", code: "CS-JH-01" },
    { title: "JH CheckSheet - Deep Freezer (Electrical)", cat: "Cold Chain Equipment", code: "CS-JH-02" },
    { title: "JH CheckSheet - Veg Cutting Machine (Electrical)", cat: "Food Processing Machinery", code: "CS-JH-03" },
    { title: "JH CheckSheet - Potato Peeler (Electrical)", cat: "Food Processing Machinery", code: "CS-JH-04" },
    { title: "JH CheckSheet - Pulveriser (Electrical)", cat: "Grinding Machinery", code: "CS-JH-05" },
    { title: "JH CheckSheet - Wet Grinder (Electrical)", cat: "Grinding Machinery", code: "CS-JH-06" },
    { title: "JH CheckSheet - Walk-in Chiller 1 (Electrical)", cat: "Cold Chain Equipment", code: "CS-JH-07" },
    { title: "JH CheckSheet - Bhatpan 1 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-08" },
    { title: "JH CheckSheet - Bhatpan 2 (Electrical)", cat: "Electrical Equipment", code: "CS-JH-09" },
    { title: "JH CheckSheet - Boiler 1 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-10" },
    { title: "JH CheckSheet - Boiler 2 (Electrical)", cat: "Electrical Equipment", code: "CS-JH-11" },
    { title: "JH CheckSheet - Frying Kada (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-12" },
    { title: "JH CheckSheet - Frying Kada (Electrical)", cat: "Electrical Equipment", code: "CS-JH-13" },
    { title: "JH CheckSheet - Single Burner Range 1 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-14" },
    { title: "JH CheckSheet - Single Burner Range 2 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-15" },
    { title: "JH CheckSheet - Single Burner Range 3 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-16" },
    { title: "JH CheckSheet - Single Burner Range 4 (PNG)", cat: "PNG/LPG Equipment", code: "CS-JH-17" },
    { title: "JH CheckSheet - Four Door Refrigerator (Electrical)", cat: "Cold Chain Equipment", code: "CS-JH-18" },
    { title: "JH CheckSheet - Two Door Refrigerator (Electrical)", cat: "Cold Chain Equipment", code: "CS-JH-19" },
    { title: "JH CheckSheet - Dough Kneader (Electrical)", cat: "Baking Machinery", code: "CS-JH-20" },
    { title: "JH CheckSheet - Walk-in Chiller 2 (Electrical)", cat: "Cold Chain Equipment", code: "CS-JH-21" },
    { title: "JH CheckSheet - Idly Maker Steam Chamber", cat: "Steam Processing", code: "CS-JH-22" },
    { title: "JH CheckSheet - Combi Oven (Electrical)", cat: "Baking Machinery", code: "CS-JH-23" },
    { title: "JH CheckSheet - Curd Incubator Chamber", cat: "Fermentation Equipment", code: "CS-JH-24" },
    { title: "JH CheckSheet - Conveyor Dish Wash Machine", cat: "Washing Facility", code: "CS-JH-25" },
  ];

  // Helper fields generator
  const createFields = (type) => [
    {
      fieldId: "fld_visual_clean",
      label: "Visual Cleanliness & Surface Hygiene Check",
      fieldType: "boolean",
      isRequired: true,
      requiresPhoto: false,
      order: 1,
    },
    {
      fieldId: "fld_temp_read",
      label: "Operating Temperature / Pressure Reading",
      fieldType: "number",
      minValue: type === "cold" ? -25 : 65,
      maxValue: type === "cold" ? 4 : 280,
      unit: "°C",
      isRequired: true,
      requiresPhoto: false,
      order: 2,
    },
    {
      fieldId: "fld_safety_interlock",
      label: "Safety Guard / Valve / Interlock Functioning",
      fieldType: "boolean",
      isRequired: true,
      requiresPhoto: true,
      order: 3,
    },
    {
      fieldId: "fld_remarks",
      label: "Operator Remarks & Operational Status",
      fieldType: "remarks",
      isRequired: false,
      order: 4,
    },
  ];

  console.log("Upserting 25 Main Checksheets...");
  for (let i = 0; i < mainTitles.length; i++) {
    const item = mainTitles[i];
    const code = `CS-MAIN-${String(i + 1).padStart(2, "0")}`;
    await CheckSheet.findOneAndUpdate(
      { code },
      {
        title: item.title,
        code,
        category: item.cat,
        department: mainKitchen._id,
        allowedShifts: shiftIds,
        frequency: "daily",
        mandatoryPhotoCount: item.photos,
        slaHours: 2,
        isActive: true,
        isDeleted: false,
        fields: createFields("hot"),
      },
      { upsert: true, new: true }
    );
  }

  console.log("Upserting 25 JH Machine Checksheets...");
  for (let i = 0; i < jhTitles.length; i++) {
    const item = jhTitles[i];
    await CheckSheet.findOneAndUpdate(
      { code: item.code },
      {
        title: item.title,
        code: item.code,
        category: item.cat,
        department: mainKitchen._id,
        allowedShifts: shiftIds,
        frequency: "daily",
        mandatoryPhotoCount: 1,
        slaHours: 2,
        isActive: true,
        isDeleted: false,
        fields: createFields(item.title.toLowerCase().includes("chiller") || item.title.toLowerCase().includes("freezer") ? "cold" : "hot"),
      },
      { upsert: true, new: true }
    );
  }

  const finalCount = await CheckSheet.countDocuments({ isDeleted: false });
  console.log(`Successfully seeded! Total active checksheets in DB: ${finalCount}`);
  process.exit(0);
}

seedChecksheets().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});

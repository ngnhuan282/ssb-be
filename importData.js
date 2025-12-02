import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pluralize from "pluralize";

// Kết nối MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/SSB?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

// Đọc file JSON
const rawData = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));

const idMap = {};
const userIdToDriverId = {}; 

// [FIX 1] Khai báo FIXED_IDS
const FIXED_IDS = {};

// ============================================
// B1: Gán ObjectId cho tất cả documents
// ============================================
for (const [key, docs] of Object.entries(rawData)) {
  if (!Array.isArray(docs)) continue;

  docs.forEach((doc, i) => {
    const customId = doc._id || `${pluralize.singular(key)}${i + 1}`;
    const mapKey = `${key}.${customId}`;

    let newId;
    if (FIXED_IDS[mapKey]) {
      newId = new mongoose.Types.ObjectId(FIXED_IDS[mapKey]);
    } else {
      newId = new mongoose.Types.ObjectId();
    }

    doc._id = newId;
    idMap[mapKey] = newId;
    idMap[`${pluralize.singular(key)}.${customId}`] = newId;
  });
}

// ============================================
// B2: Hàm resolve tham chiếu
// ============================================
// [FIX 2] Đổi tên tham số cho khớp logic bên trong
const resolveRef = (ref, collectionGuess) => {
  if (!ref) return null;
  if (mongoose.Types.ObjectId.isValid(ref))
    return new mongoose.Types.ObjectId(ref);
  const keyVariants = [
    `${collectionGuess}.${ref}`,
    `${pluralize.singular(collectionGuess)}.${ref}`,
    `${pluralize.plural(collectionGuess)}.${ref}`,
  ];
  for (const k of keyVariants) {
    if (idMap[k]) return idMap[k];
  }

  return null;
};

// ============================================
// B3: Import tuần tự
// ============================================
const importOrder = [
  "users",
  "buses",
  "drivers",
  "routes",
  "parents",
  "students",
  "schedules",
  "locations",
  "notifications",
  "stopassignments" // Mình thấy file json có bảng này, bạn nên thêm vào list import
];

for (const name of importOrder) {
  const docs = rawData[name];
  if (!Array.isArray(docs)) continue;

  if (name === "users") {
    for (const u of docs) {
      if (u.password && !u.password.startsWith("$2b$")) {
        u.password = await bcrypt.hash(u.password, 10);
      }
    }
  }

  const fixedDocs = docs.map((doc) => {
    const newDoc = { ...doc };

    for (const key in newDoc) {
      const val = newDoc[key];
      const REF_KEYS = new Set([
        "bus", "busId", "assignedBus", "route", "parent", 
        "user", "driver", "scheduleId", "children", 
        "students", "pickupPoint", "dropoffPoint", 
        "locationId", "schedule", "student" // Thêm key schedule/student cho bảng stopassignments
      ]);

      if (!REF_KEYS.has(key)) continue;

      // === Xử lý tham chiếu chuỗi đơn ===
      if (typeof val === "string" && val.length < 50 && !val.includes(" ")) {
        let hint = key;
        if (["bus", "busId", "assignedBus"].includes(key)) hint = "buses";
        if (["route", "routeId"].includes(key)) hint = "routes";
        if (["parent"].includes(key)) hint = "parents";
        if (["user"].includes(key)) hint = "users";
        if (["driver"].includes(key)) hint = "drivers";
        if (["scheduleId", "schedule"].includes(key)) hint = "schedules"; // Fix hint schedule
        if (["student"].includes(key)) hint = "students"; // Fix hint student

        const refId = resolveRef(val, hint);
        if (refId) newDoc[key] = refId;
      }

      // === Xử lý mảng tham chiếu ===
      if (Array.isArray(val)) {
        let hint = key;
        if (["children", "students"].includes(key)) hint = "students";

        newDoc[key] = val.map((item) => {
          if (typeof item === "string") {
            const refId = resolveRef(item, hint);
            return refId || item;
          }
          return item;
        });
      }
    }
    return newDoc;
  });

  const col = mongoose.connection.collection(pluralize.plural(name));

  try {
    await col.deleteMany({});
  } catch (e) {
    console.log(`Collection ${name} chưa tồn tại, bỏ qua delete.`);
  }

  if (fixedDocs.length > 0) {
    await col.insertMany(fixedDocs);
    console.log(`✅ Imported ${fixedDocs.length} → ${name}`);
  }
}

console.log("🎉 All refs resolved!");
await mongoose.disconnect();
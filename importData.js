import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pluralize from "pluralize";

const MONGO_URI = "mongodb://127.0.0.1:27017/SSB?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const rawData = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));

const idMap = {};
const userIdToDriverId = {};

// ============================================
// B1: Gán ObjectId cho tất cả documents
// ============================================
for (const [key, docs] of Object.entries(rawData)) {
  if (!Array.isArray(docs)) continue;

  docs.forEach((doc, i) => {
    const customId = doc._id || `${key}${i + 1}`;
    const newId = new mongoose.Types.ObjectId();
    doc._id = newId;

    idMap[`${key}.${customId}`] = newId;
  });
}

// Tạo ánh xạ user → driver
if (Array.isArray(rawData.drivers)) {
  rawData.drivers.forEach((d) => {
    if (d.user && idMap[`users.${d.user}`]) {
      userIdToDriverId[d.user] = idMap[`drivers.${d._id}`];
    }
  });
}

// ============================================
// B2: Hàm resolve tham chiếu
// ============================================
const resolveRef = (ref, collectionHint) => {
  if (!ref) return null;
  ;
  if (mongoose.Types.ObjectId.isValid(ref)) return new mongoose.Types.ObjectId(ref);

  if (collectionHint === "drivers" && userIdToDriverId[ref]) {
    return userIdToDriverId[ref];
  }

  for (const key of Object.keys(idMap)) {
    if (key.endsWith(`.${ref}`)) return idMap[key];
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
];

for (const name of importOrder) {
  const docs = rawData[name];
  if (!Array.isArray(docs)) continue;

  // Hash password
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

      // CHỈ resolve reference với các key thực sự là reference
      const REF_KEYS = new Set([
        "bus",
        "busId",
        "assignedBus",
        "route",
        "parent",
        "user",
        "driver",
        "scheduleId",
        "children",
        "students",
        "pickupPoint",
        "dropoffPoint",
        "locationId",
      ]);

      if (!REF_KEYS.has(key)) continue;  // ← FIX CHÍNH Ở ĐÂY

      // === Nếu là string ===
      if (typeof val === "string" && /^[a-zA-Z0-9]+$/.test(val)) {
        let hint = key;
        if (["bus", "busId", "assignedBus"].includes(key)) hint = "buses";
        if (["route"].includes(key)) hint = "routes";
        if (["parent", "user"].includes(key)) hint = "parents";
        if (["driver"].includes(key)) hint = "drivers";
        if (["scheduleId"].includes(key)) hint = "schedules";
        if (["children", "students"].includes(key)) hint = "students";

        const refId = resolveRef(val, hint);
        if (refId) newDoc[key] = refId;
      }

      // === Nếu là mảng ===
      if (Array.isArray(val)) {
        newDoc[key] = val.map((item) => {
          const refId = resolveRef(item, key);
          return refId || item;
        });
      }
    }

    return newDoc;
  });

  const col = mongoose.connection.collection(pluralize.plural(name));
  await col.deleteMany({});
  await col.insertMany(fixedDocs);
  console.log(`✅ Imported ${docs.length} → ${name}`);
}

console.log("🎉 Import hoàn tất – username không còn bị ghi đè thành ObjectId nữa!");
await mongoose.disconnect();
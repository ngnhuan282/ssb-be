// importData.js (phiên bản sửa hoàn chỉnh)
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pluralize from "pluralize";

const MONGO_URI = "mongodb://admin:123456@127.0.0.1:27017/SSB?authSource=admin";

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const rawData = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));
const collectionNames = Object.keys(rawData);
const idMap = {}; // Lưu ánh xạ từ custom ID → ObjectId thật

// Chuẩn hóa tên collection
const getCollectionName = (key) => pluralize.plural(key.toLowerCase());

// Gán ObjectId cho mọi _id
for (const key of collectionNames) {
  const docs = rawData[key];
  if (Array.isArray(docs)) {
    docs.forEach((doc, index) => {
      const customId = doc._id || `${key.toLowerCase()}${index + 1}`;
      const newObjectId = new mongoose.Types.ObjectId();
      doc._id = newObjectId; // Gán ObjectId thật
      idMap[`${key.toLowerCase()}.${customId}`] = newObjectId;
    });
  }
}

// Hàm tìm ObjectId từ ref string
const resolveRef = (ref, collectionGuess) => {
  if (!ref) return null;
  if (mongoose.Types.ObjectId.isValid(ref)) return new mongoose.Types.ObjectId(ref);
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

// Bước 1: Insert từng collection với ObjectId thật
for (const rawName of collectionNames) {
  const plural = getCollectionName(rawName);
  const docs = rawData[rawName];
  if (!Array.isArray(docs)) continue;

  // Hash password cho users
  if (plural === "users") {
    for (const u of docs) {
      if (u.password && !u.password.startsWith("$2b$")) {
        u.password = await bcrypt.hash(u.password, 10);
      }
    }
  }

  // Resolve các ref trước khi insert
  const docsToInsert = docs.map((doc) => {
    const newDoc = { ...doc };

    for (const key in newDoc) {
      const value = newDoc[key];

      // Nếu là string và có thể là ref
      if (typeof value === "string" && /^[a-zA-Z0-9]+$/.test(value)) {
        const guess = key.replace(/Id$/, "");
        const refId = resolveRef(value, guess);
        if (refId) newDoc[key] = refId;
      }

      // Nếu là array chứa ref
      if (Array.isArray(value)) {
        newDoc[key] = value.map((v) => {
          if (typeof v === "string" && /^[a-zA-Z0-9]+$/.test(v)) {
            const refId = resolveRef(v, pluralize.singular(key));
            return refId || v;
          }
          return v;
        });
      }
    }

    return newDoc;
  });

  const col = mongoose.connection.collection(plural);
  await col.deleteMany({});
  await col.insertMany(docsToInsert);
  console.log(`✅ Imported ${docs.length} records into '${plural}'`);
}

// Bước 2: Kiểm tra và log
console.log("🎉 All collections imported successfully with ObjectId mapping!");
console.log(`🔗 Total mapped IDs: ${Object.keys(idMap).length}`);

await mongoose.disconnect();
console.log("🚀 MongoDB disconnected");

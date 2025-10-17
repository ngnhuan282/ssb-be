import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pluralize from "pluralize";

const MONGO_URI = "mongodb://admin:123456@127.0.0.1:27017/SSB?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const data = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));
const collectionNames = Object.keys(data);

for (const rawName of collectionNames) {
  const name = pluralize(rawName.toLowerCase());
  const docs = data[rawName];
  if (!Array.isArray(docs)) continue;

  // ✅ Hash password nếu là user và chưa hash
  if (name === "users") {
    for (const u of docs) {
      if (u.password && !u.password.startsWith("$2b$")) {
        u.password = await bcrypt.hash(u.password, 10);
      }
    }
  }

  const col = mongoose.connection.collection(name);
  await col.deleteMany({});
  await col.insertMany(docs);
  console.log(`✅ Imported ${docs.length} records into '${name}'`);
}

await mongoose.disconnect();
console.log("🎉 All data imported successfully!");

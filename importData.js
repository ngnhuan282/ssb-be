import fs from "fs";
import mongoose from "mongoose";

const MONGO_URI = "mongodb://admin:123456@127.0.0.1:27017/ssb?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const data = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));
const collectionNames = Object.keys(data);

for (const name of collectionNames) {
  const docs = data[name];
  if (!Array.isArray(docs)) {
    console.warn(`⚠️ Skipping ${name} (not an array)`);
    continue;
  }

  const col = mongoose.connection.collection(name);
  await col.deleteMany({});
  await col.insertMany(docs);
  console.log(`✅ Imported ${docs.length} records into ${name}`);
}

console.log("🎉 All data imported successfully!");
await mongoose.disconnect();

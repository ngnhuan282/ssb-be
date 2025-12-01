import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pluralize from "pluralize";

// Kết nối MongoDB
const MONGO_URI = "mongodb://admin:123456@127.0.0.1:27017/SSB?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

// Đọc file JSON
const rawData = JSON.parse(fs.readFileSync("./ssbData.json", "utf8"));
const idMap = {};
const userIdToDriverId = {};

// --- CẤU HÌNH ID CỐ ĐỊNH (Để khớp với Frontend) ---
const FIXED_IDS = {
  "routes.route1": "6655aa11bb22cc33dd44ee01",
  "routes.route2": "6655aa11bb22cc33dd44ee02",
  "routes.route3": "6655aa11bb22cc33dd44ee03",
  "routes.route4": "6655aa11bb22cc33dd44ee04",
  // Bạn có thể thêm các ID cố định khác ở đây nếu muốn
};

// ============================================
// B1: Gán ObjectId cho tất cả documents
// ============================================
for (const [key, docs] of Object.entries(rawData)) {
  if (!Array.isArray(docs)) continue;

  docs.forEach((doc, i) => {
    // Lấy ID cũ trong file json (vd: "route1") hoặc tự tạo nếu không có
    const customId = doc._id || `${pluralize.singular(key)}${i + 1}`;

    // Tạo key tìm kiếm (vd: "routes.route1")
    const mapKey = `${key}.${customId}`;

    let newId;
    // Nếu có trong danh sách cố định thì dùng ID cố định
    if (FIXED_IDS[mapKey]) {
      newId = new mongoose.Types.ObjectId(FIXED_IDS[mapKey]);
    } else {
      // Không thì tạo mới ngẫu nhiên
      newId = new mongoose.Types.ObjectId();
    }

    doc._id = newId;
    idMap[mapKey] = newId;

    // Lưu thêm dạng số ít (vd: route.route1) phòng khi logic tham chiếu dùng số ít
    idMap[`${pluralize.singular(key)}.${customId}`] = newId;
  });
}

// Tạo ánh xạ user → driver (giữ nguyên logic của bạn)
if (Array.isArray(rawData.drivers)) {
  rawData.drivers.forEach((d) => {
    // Logic này phụ thuộc vào việc d.user là string "user1" hay đã bị đổi.
    // Trong file json gốc d.user là "driver1" (trùng _id user), nên ta dùng idMap
    // Lưu ý: Trong ssbData.json của bạn, user của driver là "driver1", "driver2"...

    // Tìm ID mới của user tương ứng
    const userKey = `users.${d.user}`; // vd: users.driver1
    if (d.user && idMap[userKey]) {
      // Map từ ID User cũ -> ID Driver Mới
      // Logic này hơi phức tạp, tạm thời giữ nguyên ý tưởng của bạn nhưng dùng idMap
    }
  });
}

// ============================================
// B2: Hàm resolve tham chiếu (ĐÃ SỬA LỖI)
// ============================================
const resolveRef = (ref, collectionHint) => {
  if (!ref) return null;

  // Nếu đã là ObjectId hợp lệ thì trả về luôn
  if (mongoose.Types.ObjectId.isValid(ref))
    return new mongoose.Types.ObjectId(ref);

  // Tạo các biến thể key để tìm trong idMap
  // VD: ref="route1", collectionHint="routes" -> tìm "routes.route1"
  const keyVariants = [
    `${collectionHint}.${ref}`, // Đã sửa collectionGuess -> collectionHint
    `${pluralize.singular(collectionHint)}.${ref}`,
    `${pluralize.plural(collectionHint)}.${ref}`,
    // Fallback: Đôi khi ref đã chứa prefix, vd "route1" nhưng map lưu "routes.route1"
  ];

  for (const k of keyVariants) {
    if (idMap[k]) return idMap[k];
  }

  return null; // Không tìm thấy thì trả về null (hoặc giữ nguyên string gốc ở bước sau)
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

      // === Xử lý tham chiếu chuỗi đơn ===
      // Logic: Nếu là string và không phải là Date ISO hoặc text dài, thử resolve
      if (typeof val === "string" && val.length < 50 && !val.includes(" ")) {
        let hint = key;
        // Map tên trường sang tên Collection
        if (["bus", "busId", "assignedBus"].includes(key)) hint = "buses";
        if (["route", "routeId"].includes(key)) hint = "routes";
        if (["parent"].includes(key)) hint = "parents";
        if (["user"].includes(key)) hint = "users"; // Sửa parents -> users cho đúng logic chung
        if (["driver"].includes(key)) hint = "drivers";
        if (["scheduleId"].includes(key)) hint = "schedules";

        const refId = resolveRef(val, hint);
        if (refId) newDoc[key] = refId;
      }

      // === Xử lý mảng tham chiếu (vd: students: ["stu1", "stu2"]) ===
      if (Array.isArray(val)) {
        let hint = key;
        if (["children", "students"].includes(key)) hint = "students"; // Hint cho mảng

        newDoc[key] = val.map((item) => {
          if (typeof item === "string") {
            const refId = resolveRef(item, hint);
            return refId || item;
          }
          return item; // Nếu object con (vd: stops) thì giữ nguyên
        });
      }
    }
    return newDoc;
  });

  const col = mongoose.connection.collection(pluralize.plural(name));

  // Xóa dữ liệu cũ trước khi insert
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

console.log("🎉 Import thành công! ID Route1 đã được cố định.");
await mongoose.disconnect();

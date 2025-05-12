import { db } from "./index";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Thêm dữ liệu mẫu cho người dùng
async function seedUsers() {
  console.log("Seeding users...");
  
  // Kiểm tra xem đã có người dùng admin chưa
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.username, "admin")
  });
  
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      username: "admin",
      password: await hashPassword("admin123"),
      email: "admin@finsmart.vn",
      fullName: "Quản trị viên",
      role: "admin"
    });
    console.log("Created admin user");
  } else {
    console.log("Admin user already exists");
  }
  
  // Kiểm tra và tạo người dùng thông thường
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.username, "nguyenthanh")
  });
  
  if (!existingUser) {
    await db.insert(schema.users).values({
      username: "nguyenthanh",
      password: await hashPassword("user123"),
      email: "thanh@example.com",
      fullName: "Nguyễn Văn Thành",
      role: "user"
    });
    console.log("Created regular user");
  } else {
    console.log("Regular user already exists");
  }
  
  // Thêm một người dùng thông thường khác
  const existingUser2 = await db.query.users.findFirst({
    where: eq(schema.users.username, "user2")
  });
  
  if (!existingUser2) {
    await db.insert(schema.users).values({
      username: "user2",
      password: await hashPassword("user123"),
      email: "user2@example.com",
      fullName: "Trần Thị Hương",
      role: "user"
    });
    console.log("Created second regular user");
  } else {
    console.log("Second regular user already exists");
  }
}

// Thêm dữ liệu mẫu cho danh mục
async function seedCategories() {
  console.log("Seeding categories...");
  
  // Danh mục thu nhập
  const incomeCategories = [
    { name: "Lương", type: "income" as const, icon: "banknote" },
    { name: "Thưởng", type: "income" as const, icon: "gift" },
    { name: "Đầu tư", type: "income" as const, icon: "trending-up" },
    { name: "Kinh doanh", type: "income" as const, icon: "shopping-bag" },
    { name: "Cho thuê", type: "income" as const, icon: "home" },
    { name: "Khác", type: "income" as const, icon: "plus-circle" }
  ];
  
  // Danh mục chi tiêu
  const expenseCategories = [
    { name: "Ăn uống", type: "expense" as const, icon: "utensils" },
    { name: "Mua sắm", type: "expense" as const, icon: "shopping-cart" },
    { name: "Nhà cửa", type: "expense" as const, icon: "home" },
    { name: "Di chuyển", type: "expense" as const, icon: "car" },
    { name: "Giải trí", type: "expense" as const, icon: "film" },
    { name: "Sức khỏe", type: "expense" as const, icon: "activity" },
    { name: "Giáo dục", type: "expense" as const, icon: "book" },
    { name: "Hóa đơn", type: "expense" as const, icon: "file-text" },
    { name: "Khác", type: "expense" as const, icon: "more-horizontal" }
  ];
  
  // Kiểm tra và thêm các danh mục
  const existingCategories = await db.query.categories.findMany();
  
  if (existingCategories.length === 0) {
    // Thêm danh mục thu nhập
    for (const category of incomeCategories) {
      await db.insert(schema.categories).values(category);
    }
    
    // Thêm danh mục chi tiêu
    for (const category of expenseCategories) {
      await db.insert(schema.categories).values(category);
    }
    
    console.log("Created categories");
  } else {
    console.log("Categories already exist");
  }
}

// Thêm dữ liệu mẫu cho mô hình AI
async function seedAIModels() {
  console.log("Seeding AI models...");
  
  const aiModelsList = [
    {
      modelName: "Financial Forecaster",
      modelVersion: "1.0.0",
      modelType: "forecast" as const,
      parameters: JSON.stringify({
        timeInterval: "monthly",
        forecastHorizon: 6,
        confidenceInterval: 0.95,
        algorithm: "arima",
        weightHistorical: 0.7,
        weightSeasonal: 0.3
      }),
      accuracy: "0.85",
      isActive: true
    },
    {
      modelName: "Transaction Classifier",
      modelVersion: "1.1.0",
      modelType: "classifier" as const,
      parameters: JSON.stringify({
        minSamples: 50,
        featureImportance: {
          amount: 0.4,
          category: 0.3,
          date: 0.2,
          description: 0.1
        },
        algorithm: "randomForest"
      }),
      accuracy: "0.92",
      isActive: true
    },
    {
      modelName: "Saving Recommender",
      modelVersion: "0.9.5",
      modelType: "recommender" as const,
      parameters: JSON.stringify({
        minSavingRate: 0.2,
        idealSavingRate: 0.3,
        riskTolerance: "medium",
        optimizationTarget: "balance",
        personalizedRecommendations: true
      }),
      accuracy: "0.78",
      isActive: true
    },
    {
      modelName: "Fraud Detection",
      modelVersion: "1.2.1",
      modelType: "fraud" as const,
      parameters: JSON.stringify({
        sensitivityThreshold: 0.85,
        minDeviationScore: 3.5,
        timeWindowDays: 30,
        falsePosRegulation: 0.2,
        algorithm: "neuralNetwork"
      }),
      accuracy: "0.97",
      isActive: false
    }
  ];
  
  // Kiểm tra và thêm mô hình AI
  const existingModels = await db.query.aiModels.findMany();
  
  if (existingModels.length === 0) {
    for (const model of aiModelsList) {
      await db.insert(schema.aiModels).values(model);
    }
    console.log("Created AI models");
  } else {
    console.log("AI models already exist");
  }
}

// Khởi chạy tất cả các hàm seed
async function seedAll() {
  try {
    await seedUsers();
    await seedCategories();
    await seedAIModels();
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

// Khởi chạy hàm seedAll nếu chạy file này trực tiếp
if (require.main === module) {
  seedAll();
}

export { seedUsers, seedCategories, seedAIModels, seedAll };
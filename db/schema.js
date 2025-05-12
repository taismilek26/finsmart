/**
 * Tạo schema MySQL cho ứng dụng FinSmart
 */

// Mảng các câu lệnh SQL để tạo từng bảng riêng biệt
const CREATE_TABLES = [
  // Bảng người dùng
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Bảng danh mục
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Bảng giao dịch
  `CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    categoryId INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transactionDate TIMESTAMP NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
  )`,

  // Bảng mục tiêu tài chính
  `CREATE TABLE IF NOT EXISTS financial_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    targetAmount DECIMAL(15, 2) NOT NULL,
    currentAmount DECIMAL(15, 2) DEFAULT 0,
    startDate TIMESTAMP NOT NULL,
    targetDate TIMESTAMP NOT NULL,
    isCompleted BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Bảng gợi ý từ AI
  `CREATE TABLE IF NOT EXISTS ai_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('primary', 'success', 'warning') DEFAULT 'primary',
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Bảng mô hình AI
  `CREATE TABLE IF NOT EXISTS ai_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modelName VARCHAR(100) NOT NULL,
    modelVersion VARCHAR(20) NOT NULL,
    modelType ENUM('forecast', 'classifier', 'recommender', 'fraud', 'market') NOT NULL,
    parameters JSON,
    accuracy VARCHAR(10),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Bảng cập nhật mô hình AI
  `CREATE TABLE IF NOT EXISTS ai_model_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modelId INT NOT NULL,
    updateType ENUM('parameters', 'version', 'status') NOT NULL,
    previousValue JSON,
    newValue JSON,
    updatedBy INT NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modelId) REFERENCES ai_models(id) ON DELETE CASCADE,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE RESTRICT
  )`,

  // Bảng ngân sách
  `CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    categoryId INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
  )`,

  // Bảng phiên người dùng
  `CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    expires INT UNSIGNED NOT NULL,
    data TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
  )`
];

export default {
  CREATE_TABLES
};
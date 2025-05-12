-- FinSmart Database Setup
-- Tạo bởi export-sql.js
-- 2025-05-12T08:11:42.674Z

-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS finsmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finsmart;

-- Tạo cấu trúc bảng

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  fullName VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng danh mục
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng giao dịch
CREATE TABLE IF NOT EXISTS transactions (
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
);

-- Bảng mục tiêu tài chính
CREATE TABLE IF NOT EXISTS financial_goals (
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
);

-- Bảng gợi ý từ AI
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('primary', 'success', 'warning') DEFAULT 'primary',
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng mô hình AI
CREATE TABLE IF NOT EXISTS ai_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modelName VARCHAR(100) NOT NULL,
  modelVersion VARCHAR(20) NOT NULL,
  modelType ENUM('forecast', 'classifier', 'recommender', 'fraud', 'market') NOT NULL,
  parameters JSON,
  accuracy VARCHAR(10),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng cập nhật mô hình AI
CREATE TABLE IF NOT EXISTS ai_model_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modelId INT NOT NULL,
  updateType ENUM('parameters', 'version', 'status') NOT NULL,
  previousValue JSON,
  newValue JSON,
  updatedBy INT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modelId) REFERENCES ai_models(id) ON DELETE CASCADE,
  FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng ngân sách
CREATE TABLE IF NOT EXISTS budgets (
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
);

-- Bảng phiên người dùng (nếu sử dụng session store trong MySQL)
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
);


-- Thêm dữ liệu người dùng
INSERT INTO users (username, password, email, fullName, role) VALUES
('admin', '454ab18c800eb38c504f00f4b8f4ed258784a8574bcd2b57705fc08576aa8837ce4e3e7a24a60b4f13565ac040a3bc8bb0d9d6e8d2c407a73d0d5a9d9ae5b938.cb1f0df24ec82483be05f39c37628249', 'admin@finsmart.vn', 'Quản trị viên', 'admin'),
('nguyenthanh', '6c37bcd817262937bbcb5f98bdbc8f03ef6b966c6d417493921a9e81a3216b0281710470d58132ffb74a94dd69495fbc05e2fdf7c680a87e43367696b1a200cf.e25f07f978b9999f9a23856eecaefaa0', 'thanh@example.com', 'Nguyễn Văn Thành', 'user'),
('user2', '6c37bcd817262937bbcb5f98bdbc8f03ef6b966c6d417493921a9e81a3216b0281710470d58132ffb74a94dd69495fbc05e2fdf7c680a87e43367696b1a200cf.e25f07f978b9999f9a23856eecaefaa0', 'user2@example.com', 'Trần Thị Hương', 'user');

-- Thêm dữ liệu danh mục
-- Danh mục thu nhập
INSERT INTO categories (name, type, icon) VALUES
('Lương', 'income', 'banknote'),
('Thưởng', 'income', 'gift'),
('Đầu tư', 'income', 'trending-up'),
('Kinh doanh', 'income', 'shopping-bag'),
('Cho thuê', 'income', 'home'),
('Khác', 'income', 'plus-circle');

-- Danh mục chi tiêu
INSERT INTO categories (name, type, icon) VALUES
('Ăn uống', 'expense', 'utensils'),
('Mua sắm', 'expense', 'shopping-cart'),
('Nhà cửa', 'expense', 'home'),
('Di chuyển', 'expense', 'car'),
('Giải trí', 'expense', 'film'),
('Sức khỏe', 'expense', 'activity'),
('Giáo dục', 'expense', 'book'),
('Hóa đơn', 'expense', 'file-text'),
('Khác', 'expense', 'more-horizontal');

-- Thêm dữ liệu mô hình AI
INSERT INTO ai_models (modelName, modelVersion, modelType, parameters, accuracy, isActive) VALUES
('Financial Forecaster', '1.0.0', 'forecast', 
 '{"timeInterval":"monthly","forecastHorizon":6,"confidenceInterval":0.95,"algorithm":"arima","weightHistorical":0.7,"weightSeasonal":0.3}',
 '0.85', TRUE),
 
('Transaction Classifier', '1.1.0', 'classifier',
 '{"minSamples":50,"featureImportance":{"amount":0.4,"category":0.3,"date":0.2,"description":0.1},"algorithm":"randomForest"}',
 '0.92', TRUE),
 
('Saving Recommender', '0.9.5', 'recommender',
 '{"minSavingRate":0.2,"idealSavingRate":0.3,"riskTolerance":"medium","optimizationTarget":"balance","personalizedRecommendations":true}',
 '0.78', TRUE),
 
('Fraud Detection', '1.2.1', 'fraud',
 '{"sensitivityThreshold":0.85,"minDeviationScore":3.5,"timeWindowDays":30,"falsePosRegulation":0.2,"algorithm":"neuralNetwork"}',
 '0.97', FALSE);


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import schemaDefinition from './schema.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tạo hash mật khẩu
 * @param {string} password Mật khẩu cần hash
 * @returns {Promise<string>} Chuỗi hash dạng hex.salt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Tạo file SQL từ dữ liệu của chúng ta
 */
async function generateSQLFile() {
  try {
    const outputPath = path.join(__dirname, 'finsmart-setup.sql');
    let sqlContent = '';
    
    // Thêm tiêu đề
    sqlContent += '-- FinSmart Database Setup\n';
    sqlContent += '-- Tạo bởi export-sql.js\n';
    sqlContent += '-- ' + new Date().toISOString() + '\n\n';
    
    // Tạo cơ sở dữ liệu
    sqlContent += '-- Tạo cơ sở dữ liệu\n';
    sqlContent += 'CREATE DATABASE IF NOT EXISTS finsmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
    sqlContent += 'USE finsmart;\n\n';
    
    // Thêm schema
    sqlContent += '-- Tạo cấu trúc bảng\n';
    sqlContent += schemaDefinition.CREATE_SCHEMA + '\n\n';
    
    // Thêm dữ liệu người dùng
    sqlContent += '-- Thêm dữ liệu người dùng\n';
    const adminPass = await hashPassword('admin123');
    const userPass = await hashPassword('user123');
    
    sqlContent += `INSERT INTO users (username, password, email, fullName, role) VALUES
('admin', '${adminPass}', 'admin@finsmart.vn', 'Quản trị viên', 'admin'),
('nguyenthanh', '${userPass}', 'thanh@example.com', 'Nguyễn Văn Thành', 'user'),
('user2', '${userPass}', 'user2@example.com', 'Trần Thị Hương', 'user');\n\n`;
    
    // Thêm dữ liệu danh mục
    sqlContent += '-- Thêm dữ liệu danh mục\n';
    sqlContent += `-- Danh mục thu nhập
INSERT INTO categories (name, type, icon) VALUES
('Lương', 'income', 'banknote'),
('Thưởng', 'income', 'gift'),
('Đầu tư', 'income', 'trending-up'),
('Kinh doanh', 'income', 'shopping-bag'),
('Cho thuê', 'income', 'home'),
('Khác', 'income', 'plus-circle');\n\n`;

    sqlContent += `-- Danh mục chi tiêu
INSERT INTO categories (name, type, icon) VALUES
('Ăn uống', 'expense', 'utensils'),
('Mua sắm', 'expense', 'shopping-cart'),
('Nhà cửa', 'expense', 'home'),
('Di chuyển', 'expense', 'car'),
('Giải trí', 'expense', 'film'),
('Sức khỏe', 'expense', 'activity'),
('Giáo dục', 'expense', 'book'),
('Hóa đơn', 'expense', 'file-text'),
('Khác', 'expense', 'more-horizontal');\n\n`;
    
    // Thêm dữ liệu mô hình AI
    sqlContent += '-- Thêm dữ liệu mô hình AI\n';
    sqlContent += `INSERT INTO ai_models (modelName, modelVersion, modelType, parameters, accuracy, isActive) VALUES
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
 '0.97', FALSE);\n\n`;
    
    // Ghi file
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`File SQL đã được tạo tại: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo file SQL:', error);
    return false;
  }
}

// Chạy hàm nếu gọi trực tiếp
if (process.argv[1].endsWith('export-sql.js')) {
  generateSQLFile()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Lỗi:', error);
      process.exit(1);
    });
}

export default generateSQLFile;
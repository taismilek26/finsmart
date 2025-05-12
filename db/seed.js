import db from './connection.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

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
 * Thêm người dùng mẫu
 */
export async function seedUsers() {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await db.queryOne('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      await db.insert('users', {
        username: 'admin',
        password: await hashPassword('admin123'),
        email: 'admin@finsmart.vn',
        fullName: 'Quản trị viên',
        role: 'admin'
      });
      console.log('Đã tạo tài khoản admin');
    }
    
    // Kiểm tra người dùng thứ nhất
    const user1Exists = await db.queryOne('SELECT * FROM users WHERE username = ?', ['nguyenthanh']);
    
    if (!user1Exists) {
      await db.insert('users', {
        username: 'nguyenthanh',
        password: await hashPassword('user123'),
        email: 'thanh@example.com',
        fullName: 'Nguyễn Văn Thành',
        role: 'user'
      });
      console.log('Đã tạo tài khoản người dùng thứ nhất');
    }
    
    // Kiểm tra người dùng thứ hai
    const user2Exists = await db.queryOne('SELECT * FROM users WHERE username = ?', ['user2']);
    
    if (!user2Exists) {
      await db.insert('users', {
        username: 'user2',
        password: await hashPassword('user123'),
        email: 'user2@example.com',
        fullName: 'Trần Thị Hương',
        role: 'user'
      });
      console.log('Đã tạo tài khoản người dùng thứ hai');
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm người dùng:', error);
    return false;
  }
}

/**
 * Thêm danh mục mẫu
 */
export async function seedCategories() {
  try {
    // Kiểm tra xem đã có danh mục chưa
    const categoriesExist = await db.queryOne('SELECT COUNT(*) as count FROM categories');
    
    // Nếu đã có danh mục, không thêm nữa
    if (categoriesExist && categoriesExist.count > 0) {
      console.log('Danh mục đã tồn tại, bỏ qua seed');
      return true;
    }
    
    // Các danh mục thu nhập
    const incomeCategories = [
      { name: 'Lương', type: 'income', icon: 'banknote' },
      { name: 'Thưởng', type: 'income', icon: 'gift' },
      { name: 'Đầu tư', type: 'income', icon: 'trending-up' },
      { name: 'Kinh doanh', type: 'income', icon: 'shopping-bag' },
      { name: 'Cho thuê', type: 'income', icon: 'home' },
      { name: 'Khác', type: 'income', icon: 'plus-circle' }
    ];
    
    // Các danh mục chi tiêu
    const expenseCategories = [
      { name: 'Ăn uống', type: 'expense', icon: 'utensils' },
      { name: 'Mua sắm', type: 'expense', icon: 'shopping-cart' },
      { name: 'Nhà cửa', type: 'expense', icon: 'home' },
      { name: 'Di chuyển', type: 'expense', icon: 'car' },
      { name: 'Giải trí', type: 'expense', icon: 'film' },
      { name: 'Sức khỏe', type: 'expense', icon: 'activity' },
      { name: 'Giáo dục', type: 'expense', icon: 'book' },
      { name: 'Hóa đơn', type: 'expense', icon: 'file-text' },
      { name: 'Khác', type: 'expense', icon: 'more-horizontal' }
    ];
    
    // Thêm danh mục thu nhập
    for (const category of incomeCategories) {
      await db.insert('categories', category);
    }
    
    // Thêm danh mục chi tiêu
    for (const category of expenseCategories) {
      await db.insert('categories', category);
    }
    
    console.log('Đã thêm các danh mục mặc định');
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm danh mục:', error);
    return false;
  }
}

/**
 * Thêm dữ liệu mẫu cho mô hình AI
 */
export async function seedAIModels() {
  try {
    // Kiểm tra xem đã có mô hình AI chưa
    const modelsExist = await db.queryOne('SELECT COUNT(*) as count FROM ai_models');
    
    // Nếu đã có mô hình, không thêm nữa
    if (modelsExist && modelsExist.count > 0) {
      console.log('Mô hình AI đã tồn tại, bỏ qua seed');
      return true;
    }
    
    // Các mô hình AI mẫu
    const aiModels = [
      {
        modelName: 'Financial Forecaster',
        modelVersion: '1.0.0',
        modelType: 'forecast',
        parameters: JSON.stringify({
          timeInterval: 'monthly',
          forecastHorizon: 6,
          confidenceInterval: 0.95,
          algorithm: 'arima',
          weightHistorical: 0.7,
          weightSeasonal: 0.3
        }),
        accuracy: '0.85',
        isActive: true
      },
      {
        modelName: 'Transaction Classifier',
        modelVersion: '1.1.0',
        modelType: 'classifier',
        parameters: JSON.stringify({
          minSamples: 50,
          featureImportance: {
            amount: 0.4,
            category: 0.3,
            date: 0.2,
            description: 0.1
          },
          algorithm: 'randomForest'
        }),
        accuracy: '0.92',
        isActive: true
      },
      {
        modelName: 'Saving Recommender',
        modelVersion: '0.9.5',
        modelType: 'recommender',
        parameters: JSON.stringify({
          minSavingRate: 0.2,
          idealSavingRate: 0.3,
          riskTolerance: 'medium',
          optimizationTarget: 'balance',
          personalizedRecommendations: true
        }),
        accuracy: '0.78',
        isActive: true
      },
      {
        modelName: 'Fraud Detection',
        modelVersion: '1.2.1',
        modelType: 'fraud',
        parameters: JSON.stringify({
          sensitivityThreshold: 0.85,
          minDeviationScore: 3.5,
          timeWindowDays: 30,
          falsePosRegulation: 0.2,
          algorithm: 'neuralNetwork'
        }),
        accuracy: '0.97',
        isActive: false
      }
    ];
    
    // Thêm các mô hình AI
    for (const model of aiModels) {
      await db.insert('ai_models', model);
    }
    
    console.log('Đã thêm các mô hình AI mặc định');
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm mô hình AI:', error);
    return false;
  }
}

/**
 * Hàm seed tất cả dữ liệu mẫu
 */
export async function seedAll() {
  try {
    await seedUsers();
    await seedCategories();
    await seedAIModels();
    console.log('Đã seed tất cả dữ liệu thành công');
    return true;
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    return false;
  }
}

// Chạy hàm seedAll nếu file này được chạy trực tiếp
if (process.argv[1].endsWith('seed.js')) {
  seedAll()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Lỗi:', error);
      process.exit(1);
    });
}
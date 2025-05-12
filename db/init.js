import db from './connection.js';
import schemaDefinition from './schema.js';
import { seedUsers, seedCategories, seedAIModels } from './seed.js';

/**
 * Khởi tạo cơ sở dữ liệu MySQL
 * - Tạo bảng nếu chưa tồn tại
 * - Tạo dữ liệu mẫu nếu cần
 */
async function initializeDatabase(options = {}) {
  const { seedData = true, logOutput = true } = options;
  
  try {
    // Kiểm tra kết nối đến cơ sở dữ liệu
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu MySQL');
    }
    
    if (logOutput) console.log('Đã kết nối đến cơ sở dữ liệu MySQL');
    
    // Tạo các bảng
    if (logOutput) console.log('Đang tạo các bảng...');
    
    // Thực thi từng câu lệnh tạo bảng riêng biệt
    for (const createTableSQL of schemaDefinition.CREATE_TABLES) {
      try {
        await db.query(createTableSQL);
      } catch (error) {
        console.error(`Lỗi khi tạo bảng: ${error.message}`);
        throw error;
      }
    }
    
    // Thêm dữ liệu mẫu nếu được yêu cầu
    if (seedData) {
      if (logOutput) console.log('Đang thêm dữ liệu mẫu...');
      
      // Thêm người dùng
      await seedUsers();
      
      // Thêm danh mục
      await seedCategories();
      
      // Thêm mô hình AI
      await seedAIModels();
      
      if (logOutput) console.log('Đã thêm dữ liệu mẫu thành công');
    }
    
    if (logOutput) console.log('Khởi tạo cơ sở dữ liệu thành công');
    return true;
  } catch (error) {
    console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    return false;
  }
}

// Khởi chạy nếu được gọi trực tiếp từ dòng lệnh
if (process.argv[1].endsWith('init.js')) {
  initializeDatabase()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
      // Đóng kết nối sau khi hoàn thành
      return db.close();
    })
    .then(() => {
      console.log('Đã đóng kết nối cơ sở dữ liệu');
      process.exit(0);
    })
    .catch(err => {
      console.error('Lỗi không xác định:', err);
      process.exit(1);
    });
}

export default initializeDatabase;
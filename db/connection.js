import mysql from 'mysql2/promise';

// Tạo pool kết nối MySQL
const createPool = (config = {}) => {
  // Thiết lập mặc định
  const defaultConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'finsmart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  // Kết hợp cấu hình mặc định với cấu hình được cung cấp
  const poolConfig = { ...defaultConfig, ...config };

  // Tạo và trả về pool
  return mysql.createPool(poolConfig);
};

// Tạo pool mặc định
const pool = createPool();

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL:', error.message);
    return false;
  }
};

// Hàm thực thi truy vấn
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Lỗi thực thi truy vấn:', error.message);
    throw error;
  }
};

// Hàm thực thi nhiều truy vấn trong một transaction
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  pool,
  query,
  transaction,
  testConnection,
  createPool
};
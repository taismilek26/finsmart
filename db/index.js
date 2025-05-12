import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Tải biến môi trường từ file .env nếu có
dotenv.config();

// Cấu hình kết nối
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'finsmart',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool kết nối để sử dụng trong ứng dụng
const pool = mysql.createPool(dbConfig);

// Wrapper để thực hiện các truy vấn
export default {
  /**
   * Thực hiện một truy vấn với các tham số
   * @param {string} sql - Câu lệnh SQL
   * @param {Array} params - Các tham số cho câu lệnh SQL
   * @returns {Promise} Kết quả truy vấn
   */
  async query(sql, params) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  /**
   * Thực hiện một truy vấn đơn và trả về row đầu tiên
   * @param {string} sql - Câu lệnh SQL
   * @param {Array} params - Các tham số
   * @returns {Promise} Row đầu tiên hoặc null
   */
  async queryOne(sql, params) {
    const rows = await this.query(sql, params);
    return rows.length ? rows[0] : null;
  },

  /**
   * Thêm dữ liệu vào bảng và trả về ID
   * @param {string} table - Tên bảng
   * @param {Object} data - Dữ liệu cần thêm
   * @returns {Promise<number>} ID của row được thêm vào
   */
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    return result.insertId;
  },

  /**
   * Cập nhật dữ liệu trong bảng
   * @param {string} table - Tên bảng
   * @param {Object} data - Dữ liệu cần cập nhật
   * @param {string} condition - Điều kiện WHERE (không bao gồm từ khóa WHERE)
   * @param {Array} conditionParams - Tham số cho điều kiện
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async update(table, data, condition, conditionParams = []) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;
    return await this.query(sql, [...values, ...conditionParams]);
  },

  /**
   * Xóa dữ liệu từ bảng
   * @param {string} table - Tên bảng
   * @param {string} condition - Điều kiện WHERE (không bao gồm từ khóa WHERE)
   * @param {Array} params - Tham số cho điều kiện
   * @returns {Promise<Object>} Kết quả xóa
   */
  async delete(table, condition, params = []) {
    const sql = `DELETE FROM ${table} WHERE ${condition}`;
    return await this.query(sql, params);
  },

  /**
   * Kiểm tra kết nối cơ sở dữ liệu
   * @returns {Promise<boolean>} true nếu kết nối thành công
   */
  async testConnection() {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  },

  /**
   * Đóng tất cả các kết nối trong pool
   * @returns {Promise<void>}
   */
  async close() {
    return pool.end();
  }
};
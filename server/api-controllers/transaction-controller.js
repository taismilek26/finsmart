import db from '../../db/connection.js';

// Lấy tất cả giao dịch của người dùng
export async function getUserTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { type, dateFrom, dateTo, categoryId, limit = 50, offset = 0 } = req.query;
    
    // Xây dựng câu truy vấn
    let query = `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon
      FROM transactions t
      JOIN categories c ON t.categoryId = c.id
      WHERE t.userId = ?
    `;
    const queryParams = [userId];
    
    // Thêm điều kiện lọc
    if (type) {
      query += ' AND t.type = ?';
      queryParams.push(type);
    }
    
    if (categoryId) {
      query += ' AND t.categoryId = ?';
      queryParams.push(categoryId);
    }
    
    if (dateFrom) {
      query += ' AND t.transactionDate >= ?';
      queryParams.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND t.transactionDate <= ?';
      queryParams.push(dateTo);
    }
    
    // Thêm sắp xếp và phân trang
    query += ' ORDER BY t.transactionDate DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const transactions = await db.query(query, queryParams);
    
    // Đếm tổng số giao dịch (không giới hạn)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.userId = ?
    `;
    const countParams = [userId];
    
    // Thêm điều kiện lọc cho câu truy vấn đếm
    if (type) {
      countQuery += ' AND t.type = ?';
      countParams.push(type);
    }
    
    if (categoryId) {
      countQuery += ' AND t.categoryId = ?';
      countParams.push(categoryId);
    }
    
    if (dateFrom) {
      countQuery += ' AND t.transactionDate >= ?';
      countParams.push(dateFrom);
    }
    
    if (dateTo) {
      countQuery += ' AND t.transactionDate <= ?';
      countParams.push(dateTo);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + transactions.length < total
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy giao dịch' });
  }
}

// Lấy chi tiết một giao dịch
export async function getTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon
      FROM transactions t
      JOIN categories c ON t.categoryId = c.id
      WHERE t.id = ? AND t.userId = ?
    `;
    
    const transactions = await db.query(query, [id, userId]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }
    
    res.json(transactions[0]);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết giao dịch' });
  }
}

// Tạo giao dịch mới
export async function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { categoryId, amount, description, transactionDate, type } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!categoryId || !amount || !transactionDate || !type) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    // Kiểm tra category có tồn tại không
    const categories = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (categories.length === 0) {
      return res.status(400).json({ message: 'Danh mục không tồn tại' });
    }
    
    // Tạo giao dịch mới
    const result = await db.query(
      'INSERT INTO transactions (userId, categoryId, amount, description, transactionDate, type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, amount, description, transactionDate, type]
    );
    
    // Lấy thông tin giao dịch vừa tạo
    const newTransaction = await db.query(
      `SELECT t.*, c.name as categoryName, c.icon as categoryIcon
       FROM transactions t
       JOIN categories c ON t.categoryId = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newTransaction[0]);
  } catch (error) {
    console.error('Lỗi khi tạo giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo giao dịch' });
  }
}

// Cập nhật giao dịch
export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { categoryId, amount, description, transactionDate, type } = req.body;
    
    // Kiểm tra giao dịch có tồn tại và thuộc về người dùng không
    const existingTransactions = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    if (existingTransactions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }
    
    // Cập nhật giao dịch
    await db.query(
      'UPDATE transactions SET categoryId = ?, amount = ?, description = ?, transactionDate = ?, type = ? WHERE id = ?',
      [categoryId, amount, description, transactionDate, type, id]
    );
    
    // Lấy thông tin giao dịch đã cập nhật
    const updatedTransaction = await db.query(
      `SELECT t.*, c.name as categoryName, c.icon as categoryIcon
       FROM transactions t
       JOIN categories c ON t.categoryId = c.id
       WHERE t.id = ?`,
      [id]
    );
    
    res.json(updatedTransaction[0]);
  } catch (error) {
    console.error('Lỗi khi cập nhật giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật giao dịch' });
  }
}

// Xóa giao dịch
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Kiểm tra giao dịch có tồn tại và thuộc về người dùng không
    const existingTransactions = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    if (existingTransactions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }
    
    // Xóa giao dịch
    await db.query('DELETE FROM transactions WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Đã xóa giao dịch thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa giao dịch' });
  }
}

// Lấy tất cả danh mục
export async function getCategories(req, res) {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY type, name');
    res.json(categories);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
  }
}

export default {
  getUserTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
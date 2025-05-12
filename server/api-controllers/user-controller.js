import db from '../../db/connection.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Mã hóa mật khẩu
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

// Lấy thông tin chi tiết người dùng (trừ mật khẩu)
export async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;
    
    const users = await db.query(
      'SELECT id, username, email, fullName, role, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
  }
}

// Cập nhật thông tin cá nhân người dùng
export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { email, fullName } = req.body;
    
    // Kiểm tra email đã tồn tại chưa (của người dùng khác)
    if (email) {
      const existingUsers = await db.query(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
    }
    
    // Cập nhật thông tin
    const updateFields = [];
    const updateValues = [];
    
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (fullName) {
      updateFields.push('fullName = ?');
      updateValues.push(fullName);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }
    
    // Thêm id vào cuối mảng updateValues
    updateValues.push(userId);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await db.query(
      'SELECT id, username, email, fullName, role, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin người dùng' });
  }
}

// Đổi mật khẩu người dùng
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Cần cung cấp cả mật khẩu hiện tại và mật khẩu mới' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    // Lấy mật khẩu hiện tại để so sánh
    const users = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const storedPassword = users[0].password;
    
    // So sánh mật khẩu hiện tại
    const [hashedCurrent, salt] = storedPassword.split('.');
    const derivedCurrent = await scryptAsync(currentPassword, salt, 64);
    
    if (hashedCurrent !== derivedCurrent.toString('hex')) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
    
    // Mã hóa mật khẩu mới
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Cập nhật mật khẩu
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
  }
}

// === Các API admin ===

// Lấy danh sách người dùng (chỉ admin mới có quyền truy cập)
export async function getAllUsers(req, res) {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let query = `
      SELECT id, username, email, fullName, role, createdAt, updatedAt
      FROM users
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      query += ` WHERE username LIKE ? OR email LIKE ? OR fullName LIKE ?`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Thêm phân trang
    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const users = await db.query(query, queryParams);
    
    // Đếm tổng số người dùng
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    
    if (search) {
      countQuery += ` WHERE username LIKE ? OR email LIKE ? OR fullName LIKE ?`;
    }
    
    const countParams = search 
      ? [searchTerm, searchTerm, searchTerm] 
      : [];
      
    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + users.length < total
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
  }
}

// Cập nhật thông tin người dùng (bởi admin)
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, fullName, role } = req.body;
    
    // Kiểm tra người dùng có tồn tại không
    const existingUsers = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra email đã tồn tại chưa (của người dùng khác)
    if (email) {
      const existingEmail = await db.query(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
    }
    
    // Cập nhật thông tin
    const updateFields = [];
    const updateValues = [];
    
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (fullName) {
      updateFields.push('fullName = ?');
      updateValues.push(fullName);
    }
    
    if (role && ['user', 'admin'].includes(role)) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }
    
    // Thêm id vào cuối mảng updateValues
    updateValues.push(id);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await db.query(
      'SELECT id, username, email, fullName, role, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin người dùng' });
  }
}

// Đặt lại mật khẩu người dùng (bởi admin)
export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    // Kiểm tra người dùng có tồn tại không
    const existingUsers = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Mã hóa mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);
    
    // Cập nhật mật khẩu
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu người dùng' });
  }
}

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  updateUser,
  resetUserPassword
};
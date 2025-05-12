import db from '../../db/connection.js';

// Lấy gợi ý AI cho người dùng
export async function getAIRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;
    
    // Lấy gợi ý từ cơ sở dữ liệu
    const recommendations = await db.query(
      `SELECT * FROM ai_recommendations 
       WHERE userId = ? 
       ORDER BY createdAt DESC 
       LIMIT ?`,
      [userId, parseInt(limit)]
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý AI:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy gợi ý AI' });
  }
}

// Tạo dự báo tài chính
export async function generateForecast(req, res) {
  try {
    const userId = req.user.id;
    const { months = 6 } = req.query;
    
    // Lấy giao dịch trong 12 tháng gần nhất để dự đoán
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    
    const transactions = await db.query(
      `SELECT * FROM transactions
       WHERE userId = ? AND transactionDate >= ?
       ORDER BY transactionDate ASC`,
      [userId, startDate.toISOString()]
    );
    
    // Tạo dự báo từ dữ liệu lịch sử
    const forecast = generateStatisticalForecast(transactions, parseInt(months));
    
    res.json(forecast);
  } catch (error) {
    console.error('Lỗi khi tạo dự báo:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo dự báo' });
  }
}

// Đánh dấu gợi ý AI đã đọc
export async function markRecommendationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Kiểm tra gợi ý tồn tại và thuộc về người dùng
    const recommendations = await db.query(
      'SELECT * FROM ai_recommendations WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    if (recommendations.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy gợi ý' });
    }
    
    // Cập nhật trạng thái đã đọc
    await db.query(
      'UPDATE ai_recommendations SET isRead = 1 WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Đã đánh dấu là đã đọc' });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái gợi ý:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái gợi ý' });
  }
}

// === API cho admin ===

// Lấy danh sách mô hình AI
export async function getAIModels(req, res) {
  try {
    const { active } = req.query;
    
    let query = 'SELECT * FROM ai_models';
    const queryParams = [];
    
    if (active === 'true') {
      query += ' WHERE isActive = 1';
    } else if (active === 'false') {
      query += ' WHERE isActive = 0';
    }
    
    query += ' ORDER BY updatedAt DESC';
    
    const models = await db.query(query, queryParams);
    
    res.json(models);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách mô hình AI:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách mô hình AI' });
  }
}

// Lấy thông tin chi tiết mô hình AI
export async function getAIModel(req, res) {
  try {
    const { id } = req.params;
    
    const models = await db.query('SELECT * FROM ai_models WHERE id = ?', [id]);
    
    if (models.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mô hình AI' });
    }
    
    // Lấy lịch sử cập nhật
    const updates = await db.query(
      `SELECT u.*, usr.username as updatedByUsername
       FROM ai_model_updates u
       JOIN users usr ON u.updatedBy = usr.id
       WHERE u.modelId = ?
       ORDER BY u.updatedAt DESC`,
      [id]
    );
    
    // Trả về mô hình và lịch sử cập nhật
    res.json({
      model: models[0],
      updates
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin mô hình AI:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin mô hình AI' });
  }
}

// Cập nhật mô hình AI
export async function updateAIModel(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { modelName, modelVersion, parameters, accuracy, isActive } = req.body;
    
    // Kiểm tra mô hình tồn tại
    const existingModels = await db.query('SELECT * FROM ai_models WHERE id = ?', [id]);
    
    if (existingModels.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mô hình AI' });
    }
    
    const existingModel = existingModels[0];
    
    // Xác định loại cập nhật và giá trị trước/sau
    let updateType = null;
    let previousValue = null;
    let newValue = null;
    
    // Cập nhật phiên bản
    if (modelVersion && modelVersion !== existingModel.modelVersion) {
      updateType = 'version';
      previousValue = JSON.stringify({ modelVersion: existingModel.modelVersion });
      newValue = JSON.stringify({ modelVersion });
    }
    // Cập nhật tham số
    else if (parameters && JSON.stringify(parameters) !== existingModel.parameters) {
      updateType = 'parameters';
      previousValue = existingModel.parameters;
      newValue = JSON.stringify(parameters);
    }
    // Cập nhật trạng thái
    else if (isActive !== undefined && isActive !== existingModel.isActive) {
      updateType = 'status';
      previousValue = JSON.stringify({ isActive: existingModel.isActive });
      newValue = JSON.stringify({ isActive });
    }
    
    // Tạo đối tượng cập nhật
    const updateFields = [];
    const updateValues = [];
    
    if (modelName) {
      updateFields.push('modelName = ?');
      updateValues.push(modelName);
    }
    
    if (modelVersion) {
      updateFields.push('modelVersion = ?');
      updateValues.push(modelVersion);
    }
    
    if (parameters) {
      updateFields.push('parameters = ?');
      updateValues.push(JSON.stringify(parameters));
    }
    
    if (accuracy) {
      updateFields.push('accuracy = ?');
      updateValues.push(accuracy);
    }
    
    if (isActive !== undefined) {
      updateFields.push('isActive = ?');
      updateValues.push(isActive ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }
    
    // Thêm id vào cuối mảng updateValues
    updateValues.push(id);
    
    // Sử dụng transaction để đảm bảo tính nhất quán
    await db.transaction(async (connection) => {
      // Cập nhật mô hình
      await connection.execute(
        `UPDATE ai_models SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // Lưu lịch sử cập nhật nếu có thay đổi quan trọng
      if (updateType) {
        await connection.execute(
          'INSERT INTO ai_model_updates (modelId, updateType, previousValue, newValue, updatedBy) VALUES (?, ?, ?, ?, ?)',
          [id, updateType, previousValue, newValue, adminId]
        );
      }
    });
    
    // Lấy thông tin mô hình đã cập nhật
    const updatedModel = await db.query('SELECT * FROM ai_models WHERE id = ?', [id]);
    
    res.json(updatedModel[0]);
  } catch (error) {
    console.error('Lỗi khi cập nhật mô hình AI:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật mô hình AI' });
  }
}

// === Hàm hỗ trợ ===

// Hàm tạo dự báo thống kê từ dữ liệu lịch sử
function generateStatisticalForecast(transactions, months) {
  // Dự báo mặc định nếu không có đủ dữ liệu
  if (transactions.length < 3) {
    return generateBasicForecast(months);
  }
  
  // Tổng hợp dữ liệu theo tháng
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        income: 0,
        expense: 0,
        month: monthYear
      };
    }
    
    if (transaction.type === 'income') {
      monthlyData[monthYear].income += parseFloat(transaction.amount);
    } else {
      monthlyData[monthYear].expense += parseFloat(transaction.amount);
    }
  });
  
  // Chuyển đối tượng thành mảng và sắp xếp theo thời gian
  const monthlyArray = Object.values(monthlyData).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });
  
  // Nếu không đủ dữ liệu cho 3 tháng, sử dụng dự báo cơ bản
  if (monthlyArray.length < 3) {
    return generateBasicForecast(months);
  }
  
  // Tính tỷ lệ tăng trưởng trung bình
  const incomeValues = monthlyArray.map(m => m.income);
  const expenseValues = monthlyArray.map(m => m.expense);
  
  const incomeGrowthRate = calculateGrowthRate(incomeValues);
  const expenseGrowthRate = calculateGrowthRate(expenseValues);
  
  // Dự báo cho các tháng tiếp theo
  const forecast = {
    months: [],
    income: [],
    expense: [],
    savings: [],
    confidence: 85 // Giá trị mặc định cho độ tin cậy
  };
  
  // Lấy tháng hiện tại làm điểm bắt đầu
  const lastMonth = new Date();
  
  // Dự báo cho n tháng tiếp theo
  for (let i = 0; i < months; i++) {
    const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i + 1, 1);
    const monthLabel = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Lấy giá trị gần nhất
    const lastKnownIncome = monthlyArray.length > 0 ? monthlyArray[monthlyArray.length - 1].income : 0;
    const lastKnownExpense = monthlyArray.length > 0 ? monthlyArray[monthlyArray.length - 1].expense : 0;
    
    // Tính giá trị dự báo
    const forecastedIncome = lastKnownIncome * Math.pow(1 + incomeGrowthRate, i + 1);
    const forecastedExpense = lastKnownExpense * Math.pow(1 + expenseGrowthRate, i + 1);
    const forecastedSavings = forecastedIncome - forecastedExpense;
    
    // Làm tròn và thêm vào kết quả
    forecast.months.push(monthLabel);
    forecast.income.push(Math.round(forecastedIncome * 100) / 100);
    forecast.expense.push(Math.round(forecastedExpense * 100) / 100);
    forecast.savings.push(Math.round(forecastedSavings * 100) / 100);
  }
  
  // Điều chỉnh độ tin cậy dựa trên số lượng dữ liệu
  forecast.confidence = Math.min(85, 50 + monthlyArray.length * 5);
  
  return forecast;
}

// Hàm tạo dự báo cơ bản khi không có đủ dữ liệu
function generateBasicForecast(months) {
  const forecast = {
    months: [],
    income: [],
    expense: [],
    savings: [],
    confidence: 30
  };
  
  // Giá trị mặc định
  const defaultIncome = 5000000;
  const defaultExpense = 3500000;
  const defaultSavings = defaultIncome - defaultExpense;
  
  // Lấy tháng hiện tại làm điểm bắt đầu
  const lastMonth = new Date();
  
  // Dự báo đơn giản cho n tháng tiếp theo
  for (let i = 0; i < months; i++) {
    const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i + 1, 1);
    const monthLabel = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    forecast.months.push(monthLabel);
    forecast.income.push(defaultIncome);
    forecast.expense.push(defaultExpense);
    forecast.savings.push(defaultSavings);
  }
  
  return forecast;
}

// Hàm tính tỷ lệ tăng trưởng
function calculateGrowthRate(values) {
  if (values.length < 2) return 0;
  
  // Lọc ra các giá trị không phải 0 để tránh chia cho 0
  const nonZeroValues = values.filter(v => v > 0);
  if (nonZeroValues.length < 2) return 0;
  
  // Tính tỷ lệ tăng trưởng giữa các tháng
  const growthRates = [];
  for (let i = 1; i < nonZeroValues.length; i++) {
    const rate = (nonZeroValues[i] - nonZeroValues[i - 1]) / nonZeroValues[i - 1];
    growthRates.push(rate);
  }
  
  // Tính trung bình các tỷ lệ tăng trưởng
  const average = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  
  // Giới hạn tỷ lệ tăng trưởng để tránh dự báo quá cao hoặc quá thấp
  return Math.max(-0.2, Math.min(0.2, average));
}

export default {
  getAIRecommendations,
  generateForecast,
  markRecommendationAsRead,
  getAIModels,
  getAIModel,
  updateAIModel
};
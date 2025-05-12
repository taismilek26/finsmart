import db from '../../db/connection.js';

// Lấy dữ liệu phân tích tài chính cho người dùng
export async function getFinancialAnalysis(req, res) {
  try {
    const userId = req.user.id;
    const { period = '12months' } = req.query;
    
    // Xác định khoảng thời gian
    let dateFrom;
    const now = new Date();
    
    switch (period) {
      case '1month':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '12months':
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
    }
    
    // Lấy tất cả giao dịch trong khoảng thời gian
    const transactions = await db.query(
      `SELECT t.*, c.name as categoryName, c.icon as categoryIcon 
       FROM transactions t
       JOIN categories c ON t.categoryId = c.id
       WHERE t.userId = ? AND t.transactionDate >= ?
       ORDER BY t.transactionDate ASC`,
      [userId, dateFrom.toISOString()]
    );
    
    // Tạo dữ liệu phân tích
    const analysis = generateAnalysisData(transactions);
    
    res.json(analysis);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu phân tích tài chính:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu phân tích tài chính' });
  }
}

// Hàm tạo dữ liệu phân tích từ các giao dịch
function generateAnalysisData(transactions) {
  // Khởi tạo dữ liệu phân tích trống
  const analysis = {
    summary: {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpense: 0,
      savingsRate: 0,
      averageMonthlyIncome: 0,
      averageMonthlyExpense: 0
    },
    monthlyData: [],
    monthlyChanges: [],
    incomeByCategory: [],
    expenseByCategory: []
  };
  
  // Nếu không có giao dịch, trả về phân tích trống
  if (transactions.length === 0) {
    return analysis;
  }
  
  // Tính tổng thu nhập và chi tiêu
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      analysis.summary.totalIncome += parseFloat(transaction.amount);
    } else {
      analysis.summary.totalExpense += parseFloat(transaction.amount);
    }
  });
  
  // Tính tỷ lệ tiết kiệm
  if (analysis.summary.totalIncome > 0) {
    analysis.summary.savingsRate = 
      ((analysis.summary.totalIncome - analysis.summary.totalExpense) / analysis.summary.totalIncome) * 100;
  }
  
  // Tạo dữ liệu theo tháng
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        income: 0,
        expense: 0,
        savings: 0,
        date
      };
    }
    
    if (transaction.type === 'income') {
      monthlyData[monthYear].income += parseFloat(transaction.amount);
    } else {
      monthlyData[monthYear].expense += parseFloat(transaction.amount);
    }
    
    monthlyData[monthYear].savings = 
      monthlyData[monthYear].income - monthlyData[monthYear].expense;
  });
  
  // Chuyển đổi dữ liệu theo tháng thành mảng và sắp xếp theo thời gian
  analysis.monthlyData = Object.values(monthlyData).sort((a, b) => a.date - b.date)
    .map(({ month, income, expense, savings }) => ({ month, income, expense, savings }));
  
  // Tính trung bình thu nhập và chi tiêu hàng tháng
  if (analysis.monthlyData.length > 0) {
    const monthCount = analysis.monthlyData.length;
    analysis.summary.averageMonthlyIncome = analysis.summary.totalIncome / monthCount;
    analysis.summary.averageMonthlyExpense = analysis.summary.totalExpense / monthCount;
  }
  
  // Tính phần trăm thay đổi hàng tháng
  for (let i = 1; i < analysis.monthlyData.length; i++) {
    const current = analysis.monthlyData[i];
    const previous = analysis.monthlyData[i - 1];
    
    const incomeChange = previous.income === 0 ? 100 : 
      ((current.income - previous.income) / previous.income) * 100;
    
    const expenseChange = previous.expense === 0 ? 0 : 
      ((current.expense - previous.expense) / previous.expense) * 100;
    
    const savingsChange = previous.savings === 0 ? 0 :
      ((current.savings - previous.savings) / Math.abs(previous.savings)) * 100;
    
    analysis.monthlyChanges.push({
      month: current.month,
      incomeChange,
      expenseChange,
      savingsChange: isNaN(savingsChange) ? 0 : savingsChange
    });
  }
  
  // Phân tích theo danh mục
  const incomeCategories = {};
  const expenseCategories = {};
  
  transactions.forEach(transaction => {
    const { categoryId, categoryName, amount, type } = transaction;
    const parsedAmount = parseFloat(amount);
    
    if (type === 'income') {
      if (!incomeCategories[categoryId]) {
        incomeCategories[categoryId] = {
          category: categoryName,
          amount: 0,
          percentage: 0
        };
      }
      incomeCategories[categoryId].amount += parsedAmount;
    } else {
      if (!expenseCategories[categoryId]) {
        expenseCategories[categoryId] = {
          category: categoryName,
          amount: 0,
          percentage: 0
        };
      }
      expenseCategories[categoryId].amount += parsedAmount;
    }
  });
  
  // Tính phần trăm cho từng danh mục thu nhập
  Object.values(incomeCategories).forEach(category => {
    category.percentage = analysis.summary.totalIncome === 0 ? 0 :
      (category.amount / analysis.summary.totalIncome) * 100;
  });
  
  // Tính phần trăm cho từng danh mục chi tiêu
  Object.values(expenseCategories).forEach(category => {
    category.percentage = analysis.summary.totalExpense === 0 ? 0 :
      (category.amount / analysis.summary.totalExpense) * 100;
  });
  
  analysis.incomeByCategory = Object.values(incomeCategories).sort((a, b) => b.amount - a.amount);
  analysis.expenseByCategory = Object.values(expenseCategories).sort((a, b) => b.amount - a.amount);
  
  return analysis;
}

export default {
  getFinancialAnalysis
};
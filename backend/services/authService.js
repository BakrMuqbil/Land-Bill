const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const authService = {
  // تسجيل الدخول
  login: async (username, password) => {
    // البحث عن المستخدم
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const user = result.rows[0];

    // التحقق من كلمة المرور
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    // تحديث آخر تسجيل دخول
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // إنشاء JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    };
  },

  // التحقق من صحة التوكن
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, user: decoded };
    } catch {
      return { valid: false };
    }
  },

  // تغيير كلمة المرور
  changePassword: async (userId, oldPassword, newPassword) => {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('المستخدم غير موجود');
    }

    const validPassword = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!validPassword) {
      throw new Error('كلمة المرور الحالية غير صحيحة');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    return { success: true };
  },

  // إضافة مستخدم جديد (للمطورين)
  createUser: async (username, password, fullName, role = 'user') => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
      [username, hashedPassword, fullName, role]
    );

    return result.rows[0];
  }
};

module.exports = authService;

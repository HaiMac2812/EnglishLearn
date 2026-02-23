const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'flashcard_secret_key_2024';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
}

// Admin-only middleware (must be used after authMiddleware)
function adminOnly(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này. Chỉ admin mới được phép.' });
}

module.exports = { authMiddleware, adminOnly, JWT_SECRET };

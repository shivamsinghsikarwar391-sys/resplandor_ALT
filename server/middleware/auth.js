import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'resplandor_secret_jwt_key_2026_snellville';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Administrator authentication token is required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
}

export function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, email: admin.email, name: admin.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const jwt = require("jsonwebtoken");

const generateToken = async (user) => {
  const token = jwt.sign(user.toObject(), process.env.JWT_Secret, { expiresIn: "7d" });
  return token;
};
    
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, "secretjwtkey");
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { generateToken, verifyToken };

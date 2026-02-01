const jwt = require('jsonwebtoken');


const generateToken = (payload) => {
  if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload.toObject(), process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (req,res,next) => {
  if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
   try {
    const token = req.headers.authorization;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
   } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
   }
};

module.exports = {
  generateToken,
  verifyToken,
};
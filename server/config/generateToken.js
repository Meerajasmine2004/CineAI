import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: '30d', // Token expires in 30 days
    }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};

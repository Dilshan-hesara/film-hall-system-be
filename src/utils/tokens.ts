import jwt from 'jsonwebtoken';

// කෙටි කාලීන Access Token (15 min)
export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '15m', 
  });
};

// දිගු කාලීන Refresh Token (7 Days)
export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  });
};
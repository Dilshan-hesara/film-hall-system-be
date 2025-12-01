import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens'; 

// 1. REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    if (user) {
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken, 
        refreshToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password as string))) {
      
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

    res.json({
        user: { 
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// 3. REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const newAccessToken = generateAccessToken(decoded.id);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(403).json({ message: 'Invalid Refresh Token' });
  }
};
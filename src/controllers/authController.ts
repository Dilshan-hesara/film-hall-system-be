import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../utils/email';

// Helper: Generate 6 Digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER

export const registerUser = async (req: Request, res: Response) => {
  try {
    // 👇 Gender එකත් ගන්නවා
    const { username, email, password, gender } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password Hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    // Save User (But isVerified: false)
    await User.create({
      username,
      email,
      password: hashedPassword,
      gender, // 👇 Gender Save වෙනවා
      isVerified: false,
      otp,
      otpExpires
    });

    // Email Sending
    await sendEmail(email, 'Verify Your Account - MKD Cinemas', `Your OTP is: ${otp}`);

    res.status(201).json({ message: 'OTP sent to email. Please verify to complete registration.' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// 2. VERIFY OTP 
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

    res.json({
        user: { _id: user._id, username: user.username, email: user.email, role: user.role },
        accessToken: token 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};



// // 3. LOGIN 
// export const loginUser = async (req: Request, res: Response) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (user && (await bcrypt.compare(password, user.password as string))) {
//         if (!user.isVerified) {
//             return res.status(401).json({ message: 'Please verify your email first.' });
//         }
//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
//         res.json({
//             user: { _id: user._id, username: user.username, email: user.email, role: user.role },
//             accessToken: token 
//         });
//     } else {
//         res.status(400).json({ message: 'Invalid credentials' });
//     }
// };

// 4. FORGOT PASSWORD 
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, 'Reset Password OTP', `Your OTP to reset password is: ${otp}`);
    res.json({ message: 'OTP sent to email' });
};

// 5. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
};



// 3. REFRESH TOKEN
// export const refreshToken = async (req: Request, res: Response) => {
//   const { token } = req.body;

//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
//     const newAccessToken = generateAccessToken(decoded.id);

//     res.json({ accessToken: newAccessToken });

//   } catch (error) {
//     res.status(403).json({ message: 'Invalid Refresh Token' });
//   }
// };


/////////////////////////////////////









const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '15m' }); 
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' }); 
};


// 2. Login User (Updated)
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate Both Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken in DB (Optional but recommended for security/logout)
    // user.refreshToken = refreshToken; await user.save(); 

    res.status(200).json({ 
        message: 'Login successful', 
        accessToken, 
        refreshToken, // Send both
        user: { _id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//3. NEW: Refresh Token Function
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body; // Client sends refresh token

  if (!token) return res.status(401).json({ message: "You are not authenticated!" });

  // Verify Refresh Token
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });

    // Generate NEW Access Token
    // Note: user contains the decoded payload { id: ... }
    // We might need to fetch full user role again if needed, or include role in refresh token.
    // For simplicity, assuming basic user obj is enough or fetch from DB:
    
    const newAccessToken = jwt.sign({ id: user.id, role: user.role || 'user' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    
    // Send new refresh token too? Usually we rotate it, but for uni project keeping same is okay.
    res.status(200).json({ accessToken: newAccessToken });
  });
};
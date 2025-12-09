import express from 'express';
import { registerUser, loginUser, refreshToken, verifyOTP,forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken); 
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword)

export default router;
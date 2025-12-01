import express from 'express';
import { registerUser, loginUser, refreshToken } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken); // අලුත් Route එක

export default router;
import express from 'express';
import { loginUser } from '../controllers/authController';

const router = express.Router();

// http://localhost:5000/api/auth/login
router.post('/login', loginUser);

export default router;
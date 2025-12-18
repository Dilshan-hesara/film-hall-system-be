import express from 'express';
import { getDailyReport } from '../controllers/reportController';

const router = express.Router();

router.get('/daily', getDailyReport);

export default router;
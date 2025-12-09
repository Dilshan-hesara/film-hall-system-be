import express from 'express';
import { getAdminStats, getRecentBookings } from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/recent-bookings', getRecentBookings);

export default router;
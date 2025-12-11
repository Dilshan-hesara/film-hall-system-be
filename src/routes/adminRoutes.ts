import express from 'express';
import { getDashboardStats, getRecentBookings } from '../controllers/adminController';

const router = express.Router();

// Dashboard Stats Route
// router.get('/stats', getDashboardStats);

router.get('/stats', getDashboardStats);

// Recent Bookings Route
router.get('/recent', getRecentBookings);

export default router;
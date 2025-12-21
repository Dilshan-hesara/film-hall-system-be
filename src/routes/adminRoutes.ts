import express from 'express';
import { getDashboardStats, getMonthlySales, getRecentBookings  } from '../controllers/adminController';

const router = express.Router();

// Dashboard Stats Route
// router.get('/stats', getDashboardStats);

router.get('/stats', getDashboardStats);

// Recent Bookings Route
router.get('/recent', getRecentBookings);


router.get('/reports/sales', getMonthlySales); // GET /api/v1/admin/reports/sales?month=12&year=2025


import { getReceptionDashboard } from '../controllers/adminController';

// ...
router.get('/reception-dashboard', getReceptionDashboard);
export default router;
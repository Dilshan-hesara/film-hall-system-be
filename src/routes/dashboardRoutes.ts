import express from 'express';
import { getAdminStats, getRecentBookings } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware'; 
import { authorize } from '../middleware/roleMiddleware';
const router = express.Router();

router.get('/stats', protect, authorize('admin', 'superadmin'), getAdminStats);
router.get('/recent-bookings', protect, authorize('admin', 'superadmin'), getRecentBookings);

export default router;
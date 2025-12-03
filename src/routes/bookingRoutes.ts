import express from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/bookingController';

const router = express.Router();

router.post('/create', createBooking);
router.get('/occupied', getOccupiedSeats);

export default router;
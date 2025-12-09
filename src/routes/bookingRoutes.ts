import express from 'express';
import { cancelBooking, createBooking, getOccupiedSeats ,getAllBookings} from '../controllers/bookingController';

const router = express.Router();

router.post('/create', createBooking);
router.get('/occupied', getOccupiedSeats);


import { getBookingsByUser } from '../controllers/bookingController';

// ...
// GET: http://localhost:5000/api/v1/bookings/user/123
router.get('/user/:userId', getBookingsByUser);

router.get('/all', getAllBookings);       // GET: /api/v1/bookings/all
router.delete('/:id', cancelBooking);

export default router;
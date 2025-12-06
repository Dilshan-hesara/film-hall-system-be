import express from 'express';
import { addShowtime, getShowtimesByMovie } from '../controllers/showtimeController';

const router = express.Router();

router.post('/add', addShowtime); // POST: /api/v1/showtimes/add
router.get('/movie/:movieId', getShowtimesByMovie); // GET: /api/v1/showtimes/movie/123

export default router;
import express from 'express';
import { addShowtime, deleteShowtime, getShowtimesByMovie, getShowtimesByDate ,getShowtimesByMovieDate} from '../controllers/showtimeController';

const router = express.Router();

router.post('/add', addShowtime); 
router.get('/movie/:movieId', getShowtimesByMovie); 

router.post('/add', addShowtime);
router.get('/schedule', getShowtimesByDate); 
router.delete('/:id', deleteShowtime);

router.get('/movie-date', getShowtimesByMovieDate);
export default router;
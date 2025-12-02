import express from 'express';
import { addMovie, getAllMovies } from '../controllers/movieController';

const router = express.Router();

router.post('/add', addMovie); 

router.get('/all', getAllMovies);

export default router;
import express from 'express';
import { addMovie, getAllMovies } from '../controllers/movieController';

const router = express.Router();

router.post('/add', addMovie); 

router.get('/all', getAllMovies);


import {  getMovieById } from '../controllers/movieController';

// ...
router.get('/:id', getMovieById);

export default router;
import express from 'express';
import { addMovie, deleteMovie, getAllMovies, updateMovie } from '../controllers/movieController';

const router = express.Router();

router.post('/add', addMovie); 

router.get('/all', getAllMovies);


import {  getMovieById } from '../controllers/movieController';

// ...
router.get('/:id', getMovieById);

router.put('/:id', updateMovie);   
router.delete('/:id', deleteMovie);

export default router;
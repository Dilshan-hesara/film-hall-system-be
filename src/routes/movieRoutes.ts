import express from 'express';
import { addMovie, deleteMovie, getAllMovies, updateMovie ,searchMovies } from '../controllers/movieController';
import { protect } from '../middleware/authMiddleware'; 
import { authorize } from '../middleware/roleMiddleware';
const router = express.Router();

// router.post('/add', addMovie); 

router.get('/all', getAllMovies);
router.get('/search', searchMovies);

router.post('/add', protect, authorize('admin', 'superadmin'), addMovie);

router.delete('/:id', protect, authorize('superadmin'), deleteMovie);

import {  getMovieById } from '../controllers/movieController';

// ...
router.get('/:id', getMovieById);

router.put('/:id', updateMovie);   
// router.delete('/:id', deleteMovie);


// ...

export default router;
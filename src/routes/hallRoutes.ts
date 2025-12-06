import express from 'express';
import { addHall, getAllHalls } from '../controllers/hallController';

const router = express.Router();

router.post('/add', addHall); // POST: http://localhost:5000/api/v1/halls/add
router.get('/all', getAllHalls);


import { getHallById } from '../controllers/hallController';

// ...
router.get('/:id', getHallById); // GET: /api/v1/halls/65df...

export default router;
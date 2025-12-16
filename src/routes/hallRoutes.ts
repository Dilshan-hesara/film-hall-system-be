import express from 'express';
import { addHall, deleteHall, getAllHalls, updateHall } from '../controllers/hallController';

const router = express.Router();

router.post('/add', addHall); 
router.get('/all', getAllHalls);


import { getHallById } from '../controllers/hallController';

router.get('/:id', getHallById); 


router.put('/:id', updateHall);
router.delete('/:id', deleteHall);

export default router;
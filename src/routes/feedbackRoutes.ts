import express from 'express';
import { addFeedback, getAllFeedbacks } from '../controllers/feedbackController';

const router = express.Router();

router.post('/add', addFeedback);
router.get('/all', getAllFeedbacks);

export default router;
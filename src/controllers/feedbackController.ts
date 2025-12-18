import { Request, Response } from 'express';
import Feedback from '../models/Feedback';

// 1. Add Feedback
export const addFeedback = async (req: Request, res: Response) => {
  try {
    const { userId, rating, message } = req.body;

    const newFeedback = new Feedback({
      user: userId,
      rating,
      message,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Thank you for your feedback!', feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error });
  }
};

// 2. Get All Feedbacks
export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'username profileImage') 
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks', error });
  }
};
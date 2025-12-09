import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Movie from '../models/Movie';
import Hall from '../models/Hall';

// 1. Get Dashboard Stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // A. Total Bookings
    const totalBookings = await Booking.countDocuments();

    // B. Total Users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // C. Total Movies
    const totalMovies = await Movie.countDocuments();

    // D. Total Income
    const incomeResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

    res.status(200).json({
      totalBookings,
      totalUsers,
      totalMovies,
      totalIncome
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

// 2. Get Recent Bookings
export const getRecentBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email') 
      .populate('movie', 'title')         
      .sort({ createdAt: -1 })           
      .limit(5);                          

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent bookings', error });
  }
};
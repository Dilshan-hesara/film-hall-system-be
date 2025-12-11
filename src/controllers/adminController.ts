import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Movie from '../models/Movie';

// 1. Get Dashboard Stats (Cards + Charts)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // --- A. Basic Counts (Cards සඳහා) ---
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    
    // --- B. Total Income Calculation ---
    const incomeResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

    // --- C. CHART DATA 1: Monthly Revenue (Bar Chart) ---
    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, 
          income: { $sum: "$totalPrice" } 
        }
      },
      { $sort: { _id: 1 } }, //    
      { $limit: 6 } //   
    ]);

    //    Frontend    (Jan, Feb...) 
    const formattedRevenue = monthlyRevenue.map(item => {
        const date = new Date();
        date.setMonth(item._id - 1); // MongoDB months are 1-based, JS is 0-based
        return {
            name: date.toLocaleString('default', { month: 'short' }),
            income: item.income
        };
    });

    // --- D. CHART DATA 2: Most Booked Movies (Pie Chart) ---
    const topMovies = await Booking.aggregate([
      {
        $group: {
          _id: "$movie", 
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }, 
      { $limit: 5 },
      {
        $lookup: {
          from: "movies", 
          localField: "_id",
          foreignField: "_id",
          as: "movieData"
        }
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$movieData.title", "Unknown Movie"] },
          value: "$count"
        }
      }
    ]);

    // Debugging 
    console.log("Revenue Data:", formattedRevenue);
    console.log("Movie Data:", topMovies);

    // Data
    res.status(200).json({
      totalBookings,
      totalUsers,
      totalMovies,
      totalIncome,
      revenueChart: formattedRevenue, // Bar Chart Data
      movieChart: topMovies // Pie Chart Data
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

// 2. Get Recent Bookings (Table )
export const getRecentBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username email')
            .populate('movie', 'title')
            .populate('hall', 'name')
            .sort({ createdAt: -1 }) 
            .limit(5); 
            
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent bookings', error });
    }
};
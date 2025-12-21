import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Movie from '../models/Movie';

// 1. Get Dashboard Stats 
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    //  Basic Counts
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    
    // Total Income Calculation
    const incomeResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

    // CHART DATA 1: Monthly Revenue 
    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, 
          income: { $sum: "$totalPrice" } 
        }
      },
      { $sort: { _id: 1 } },    
      { $limit: 6 }   
    ]);

    const formattedRevenue = monthlyRevenue.map(item => {
        const date = new Date();
        date.setMonth(item._id - 1); // MongoDB months are 1-based, JS is 0-based
        return {
            name: date.toLocaleString('default', { month: 'short' }),
            income: item.income
        };
    });

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

    console.log("Revenue Data:", formattedRevenue);
    console.log("Movie Data:", topMovies);

    res.status(200).json({
      totalBookings,
      totalUsers,
      totalMovies,
      totalIncome,
      revenueChart: formattedRevenue,
      movieChart: topMovies 
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

// 2. Get Recent Bookings
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



// 3. Get Monthly Sales Data
export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query; 

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year required" });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const salesData = await Booking.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('user', 'username email')
    .populate('movie', 'title')
    .sort({ createdAt: -1 });

    res.status(200).json(salesData);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching report data', error });
  }
};

import Showtime from '../models/Showtime';


export const getReceptionDashboard = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; 

    const showtimes = await Showtime.find({ showDate: { $gte: todayStr } })
      .populate('movie', 'title language duration') 
      .populate('hall', 'name seatCapacity rows columns')       
      .sort({ showDate: 1, showTime: 1 }); 

    // Dashboard Cards Data
    const dashboardData = await Promise.all(showtimes.map(async (show: any) => {
      const bookings = await Booking.find({
        movie: show.movie._id,
        date: show.showDate,
        time: show.showTime,
        status: { $ne: 'Cancelled' }
      });

      const bookedCount = bookings.reduce((acc, booking) => acc + booking.seats.length, 0);
      
      // Calculate Total Capacity
      let totalCapacity = show.hall?.seatCapacity;
      if (!totalCapacity || totalCapacity === 0) {
          const rows = show.hall?.rows || 0;
          const cols = show.hall?.columns || 0;
          totalCapacity = rows * cols;
      }
      if (totalCapacity === 0) totalCapacity = 1; 

      return {
        _id: show._id,
        movieTitle: show.movie?.title || "Unknown Movie",
        language: show.movie?.language || "EN",
        hallName: show.hall?.name || "Unknown Hall",
        showDate: show.showDate, 
        showTime: show.showTime, 
        totalSeats: totalCapacity,
        bookedSeats: bookedCount,
        availableSeats: totalCapacity - bookedCount
      };
    }));

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('movie', 'title')
      .populate('hall', 'name');


    const todayBookings = await Booking.find({ date: todayStr, status: 'Paid' });
    const totalCashToday = todayBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

    res.status(200).json({
      schedule: dashboardData,
      recentBookings,
      totalCashToday,
      totalTicketsToday: todayBookings.reduce((acc, curr) => acc + curr.seats.length, 0)
    });

  } catch (error) {
    console.error("Reception Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching reception data', error });
  }
};
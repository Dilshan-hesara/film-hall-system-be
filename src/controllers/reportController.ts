import { Request, Response } from 'express';
import Booking from '../models/Booking'; /

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayBookings = await Booking.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    let totalCashCollected = 0;
    let totalOnlineBookings = 0;
    let cancelledAmount = 0;

    todayBookings.forEach((booking: any) => {
      if (booking.status === 'Cancelled') {
        cancelledAmount += booking.totalPrice || 0;
      } 
      else {
        if (booking.paymentMethod === 'Cash') {
          totalCashCollected += booking.totalPrice || 0;
        } else if (booking.paymentMethod === 'Card' || booking.paymentMethod === 'ONLINE_PAYMENT') {
          totalOnlineBookings += booking.totalPrice || 0;
        }
      }
    });

    const netBalance = totalCashCollected; 

    res.status(200).json({
      date: new Date().toLocaleDateString(),
      totalCashCollected,
      totalOnlineBookings,
      cancelledAmount,
      netBalance,
      totalBookingsCount: todayBookings.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report' });
  }
};
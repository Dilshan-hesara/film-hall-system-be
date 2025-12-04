import { Request, Response } from 'express';
import Booking from '../models/Booking';



export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId,hallId, movieId, date, time, seats, totalPrice } = req.body;

    // Check if seats are already taken (Double check)
    const existingBooking = await Booking.findOne({
      movie: movieId,
      hall: hallId,
      date,
      time,
      seats: { $in: seats }, 
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Some seats are already booked!' });
    }

    const newBooking = new Booking({
      user: userId,
      movie: movieId,
      hall: hallId,
      date,
      time,
      seats,
      totalPrice,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking Successful!', booking: newBooking });

  } catch (error) {
    res.status(500).json({ message: 'Booking failed', error });
  }
};




export const getOccupiedSeats = async (req: Request, res: Response) => {
  try {
    // 1. Query  hallId  
    const { movieId, date, time, hallId } = req.query;

    const query: any = { movie: movieId, date, time };
    if (hallId) {
      query.hall = hallId;
    }

    const bookings = await Booking.find(query);

    let occupiedSeats: string[] = [];
    bookings.forEach((booking) => {
      occupiedSeats = occupiedSeats.concat(booking.seats);
    });

    res.status(200).json(occupiedSeats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats', error });
  }
};
import { Request, Response } from 'express';
import Showtime from '../models/Showtime';

// 1. Add Showtime
export const addShowtime = async (req: Request, res: Response) => {
  try {
    const { movieId, hallId, showDate, showTime, ticketPrice } = req.body;

    const existingShow = await Showtime.findOne({ 
      hall: hallId, 
      showDate, 
      showTime 
    });

    if (existingShow) {
      return res.status(400).json({ message: 'This hall is already booked for this time slot!' });
    }

    const newShowtime = new Showtime({
      movie: movieId,
      hall: hallId,
      showDate,
      showTime,
      ticketPrice,
    });

    await newShowtime.save();
    res.status(201).json({ message: 'Showtime added successfully', showtime: newShowtime });

  } catch (error) {
    res.status(500).json({ message: 'Error adding showtime', error });
  }
};

// // 2. Get All Showtimes
// export const getShowtimesByMovie = async (req: Request, res: Response) => {
//   try {
//     const { movieId } = req.params;
    
//     const showtimes = await Showtime.find({ movie: movieId }).populate('hall');
//     res.status(200).json(showtimes);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching showtimes', error });
//   }
// };


// Helper: වෙලාව මිනිත්තු බවට හරවන Function එක (Time Comparison සඳහා)
// "10:30 AM" -> Minutes
const convertTimeToMinutes = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hours += 12;
  }

  return hours * 60 + minutes;
};

export const getShowtimesByMovie = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    // 1. අද දිනය සහ වෙලාව ගන්න
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // "2025-12-05"
    
    // දැනට තියෙන වෙලාව මිනිත්තු වලින් (Current Time in Minutes)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 2. දින 3ක සීමාව හදාගන්න (Max Date)
    const maxDateObj = new Date();
    maxDateObj.setDate(now.getDate() + 3);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    // 3. Database එකෙන් අදාළ Movie එකේ Showtimes ගන්න (Hall විස්තරත් එක්ක)
    const allShowtimes = await Showtime.find({ movie: movieId }).populate('hall');

    // 4. දින 3 ඇතුලත සහ වෙලාව පහු නොවූ ඒවා Filter කරන්න
    const validShowtimes = allShowtimes.filter((show: any) => {
      
      // A. පරණ දින (Yesterday) අයින් කරන්න & දවස් 3ට වඩා වැඩි ඒවා අයින් කරන්න
      if (show.showDate < todayStr || show.showDate > maxDateStr) {
        return false;
      }

      // B. අද දවසෙම නම්, වෙලාව පහු වෙලාද බලන්න
      if (show.showDate === todayStr) {
        const showTimeMinutes = convertTimeToMinutes(show.showTime);
        if (showTimeMinutes < currentMinutes) {
          return false; // වෙලාව පහු වෙලා නම් අයින් කරන්න
        }
      }

      return true; // ඉතුරු ඒවා තියාගන්න
    });

    res.status(200).json(validShowtimes);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching showtimes', error });
  }
};
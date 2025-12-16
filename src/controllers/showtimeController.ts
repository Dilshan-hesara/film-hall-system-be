import { Request, Response } from 'express';
import Showtime from '../models/Showtime';
import Movie from '../models/Movie';

// Helper: Convert "HH:MM AM/PM" to Minutes
const getMinutes = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12 && modifier === 'AM') hours = 0;
  if (hours !== 12 && modifier === 'PM') hours += 12;
  return hours * 60 + minutes;
};

// 1. Add Showtime (with Conflict Check)
export const addShowtime = async (req: Request, res: Response) => {
  try {
    const { movieId, hallId, showDate, showTime, ticketPrice } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const newStart = getMinutes(showTime);
    const newEnd = newStart + movie.duration + 30; // Cleaning time: 30 mins buffer

    const existingShows = await Showtime.find({ hall: hallId, showDate }).populate('movie');

    let hasConflict = false;

    for (const show of existingShows) {
      const existingMovie = show.movie as any;
      const exStart = getMinutes(show.showTime);
      const exEnd = exStart + existingMovie.duration + 30; // Buffer

      // Overlap Logic: (StartA < EndB) and (EndA > StartB)
      if (newStart < exEnd && newEnd > exStart) {
        hasConflict = true;
        break;
      }
    }

    if (hasConflict) {
      return res.status(400).json({ 
        message: 'Time Conflict! Another movie is running in this hall at this time.' 
      });
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

// 2. Get Showtimes By Date (Admin Side)
export const getShowtimesByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const showtimes = await Showtime.find({ showDate: date })
      .populate('movie', 'title duration')
      .populate('hall', 'name')
      .sort({ showTime: 1 }); //ude edan plivelata

    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error });
  }
};

// 3. Delete Showtime
export const deleteShowtime = async (req: Request, res: Response) => {
  try {
    await Showtime.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting showtime', error });
  }
};


//  export const addShowtime = async (req: Request, res: Response) => {
//   try {
//     const { movieId, hallId, showDate, showTime, ticketPrice } = req.body;

//     const existingShow = await Showtime.findOne({ 
//       hall: hallId, 
//       showDate, 
//       showTime 
//     });

//     if (existingShow) {
//       return res.status(400).json({ message: 'This hall is already booked for this time slot!' });
//     }

//     const newShowtime = new Showtime({
//       movie: movieId,
//       hall: hallId,
//       showDate,
//       showTime,
//       ticketPrice,
//     });

//     await newShowtime.save();
//     res.status(201).json({ message: 'Showtime added successfully', showtime: newShowtime });

//   } catch (error) {
//     res.status(500).json({ message: 'Error adding showtime', error });
//   }
// };

// 2. Get All Showtimes
// export const getShowtimesByMovie = async (req: Request, res: Response) => {
//   try {
//     const { movieId } = req.params;
    
//     const showtimes = await Showtime.find({ movie: movieId }).populate('hall');
//     res.status(200).json(showtimes);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching showtimes', error });
//   }
// };


// Helper: Convert "HH:MM AM/PM" to Minutes
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

    // 1. Get Current Date and Time
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // "2025-12-05"
    
    //  (Current Time in Minutes)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 2. Set 3-Day Limit (Max Date)
    const maxDateObj = new Date();
    maxDateObj.setDate(now.getDate() + 3);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    // 3. Get Showtimes for the Movie from Database (Including Hall Details)
    const allShowtimes = await Showtime.find({ movie: movieId }).populate('hall');

    // 4. Filter Showtimes Within 3 Days and Not Past Time
    const validShowtimes = allShowtimes.filter((show: any) => {
      
      // A. Remove Past Dates (Yesterday) & Dates Beyond 3 Days
      if (show.showDate < todayStr || show.showDate > maxDateStr) {
        return false;
      }

      // B. If it's today, check if the time has passed
      if (show.showDate === todayStr) {
        const showTimeMinutes = convertTimeToMinutes(show.showTime);
        if (showTimeMinutes < currentMinutes) {
          return false; // Remove if time has passed
        }
      }

      return true; // Keep the rest
    });

    res.status(200).json(validShowtimes);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching showtimes', error });
  }
};



export const getShowtimesByMovieDate = async (req: Request, res: Response) => {
  try {
    const { movieId, date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const queryDate = new Date(date as string);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    let query: any = {
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (movieId && movieId !== 'undefined' && movieId !== '') {
        query.movie = movieId;
    }

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title _id') 
      .populate('hall', 'name rows columns seatCapacity')
      .sort({ time: 1 });

    res.status(200).json(showtimes);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching showtimes', error });
  }
};
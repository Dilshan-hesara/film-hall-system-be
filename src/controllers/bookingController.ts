import { Request, Response } from 'express';
import Booking from '../models/Booking';
import QRCode from 'qrcode';
import User from '../models/User';
import Movie from '../models/Movie';
import Hall from '../models/Hall';
import { sendEmail } from '../utils/email';


// export const createBooking = async (req: Request, res: Response) => {
//   try {
//     const { userId,hallId, movieId, date, time, seats, totalPrice } = req.body;

//     // Check if seats are already taken (Double check)
//     const existingBooking = await Booking.findOne({
//       movie: movieId,
//       hall: hallId,
//       date,
//       time,
//       seats: { $in: seats }, 
//     });

//     if (existingBooking) {
//       return res.status(400).json({ message: 'Some seats are already booked!' });
//     }

//     const newBooking = new Booking({
//       user: userId,
//       movie: movieId,
//       hall: hallId,
//       date,
//       time,
//       seats,
//       totalPrice,
//     });

//     await newBooking.save();
//     res.status(201).json({ message: 'Booking Successful!', booking: newBooking });

//   } catch (error) {
//     res.status(500).json({ message: 'Booking failed', error });
//   }
// };


export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId, movieId, hallId, date, time, seats, totalPrice } = req.body;

    // 1. Check Existing Booking... 
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

    // 2. Save Booking
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

    // 👇 3. QR CODE & EMAIL  (Updated)
    const user = await User.findById(userId);
    const movie = await Movie.findById(movieId);
    const hall = await Hall.findById(hallId);

    if (user && movie && hall) {
      
      // A. QR Code එක Generate  
      const qrData = JSON.stringify({
        id: newBooking._id,
        movie: movie.title,
        seats: seats
      });
      
      // QR Code  Data URL gnna
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      // B. email eka HTML 
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; background-color: #000; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #e50914; margin: 0;">MKD CINEMAS</h1>
            <p style="color: #fff; margin: 5px 0;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hello ${user.username},</h2>
            <p>Your tickets for <strong>${movie.title}</strong> have been confirmed!</p>
            
            <table style="width: 100%; margin-top: 20px;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Cinema Hall:</td>
                <td>${hall.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Date & Time:</td>
                <td>${date} at ${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Seats:</td>
                <td>${seats.join(', ')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Total Paid:</td>
                <td style="color: #e50914; font-weight: bold;">LKR ${totalPrice}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 14px; color: #555;">Scan this QR code at the entrance:</p>
              <img src="cid:qrcode@mkd" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>


            <div style="margin-top: 30px; border-top: 2px dashed #ddd; padding-top: 20px;">
              <h3 style="color: #d32f2f; margin: 0 0 10px 0; font-size: 16px;">IMPORTANT NOTICE</h3>
              <ul style="font-size: 13px; color: #666; line-height: 1.6; padding-left: 20px; margin: 0;">
                <li>Please show this QR code at the entrance.</li>
                <li>Tickets are non-refundable and non-transferable.</li>
                <li>Adults Only (A) movies require valid ID proof.</li>
                <li>Outside food/beverages are strictly prohibited.</li>
              </ul>
            </div>

          </div>

          <div style="text-align: center; padding: 15px; font-size: 12px; color: #888;">
            <p>Booking ID: #${newBooking._id.toString().slice(-6).toUpperCase()}</p>
            <p>Thank you for choosing MKD Cinemas!</p>
          </div>
        </div>
      `;

      const mailOptions = {
        html: emailHtml,
        attachments: [
          {
            filename: 'qrcode.png',
            path: qrCodeUrl, 
            cid: 'qrcode@mkd' // HTML 
          }
        ]
      };

      sendEmail(user.email, `Booking Confirmed! - ${movie.title}`, emailHtml, mailOptions.attachments)
        .catch(err => console.error("Email failed:", err));
    }

    res.status(201).json({ message: 'Booking Successful & Email Sent!', booking: newBooking });

  } catch (error) {
    console.error(error);
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

export const getBookingsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate('movie', 'title posterUrl') 
      .populate('hall', 'name')             
      .sort({ createdAt: -1 });             

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};
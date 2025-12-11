import { Request, Response } from 'express';
import Booking from '../models/Booking';
import QRCode from 'qrcode';
import User from '../models/User';
import Movie from '../models/Movie';
import Hall from '../models/Hall';
import { sendEmail } from '../utils/email';
import Show from '../models/Booking'; // 👇 Show model එක අනිවාර්යයෙන් import කරන්න

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
paymentMethod: 'Card'
    });

    await newBooking.save();

    // 👇 3. QR CODE & EMAIL  (Updated)
    const user = await User.findById(userId);
    const movie = await Movie.findById(movieId);
    const hall = await Hall.findById(hallId);

    if (user && movie && hall) {
      
      // A. QR Code  Generate  
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

// ... imports

// 1. Get All Bookings (Admin Only)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email') 
      .populate('movie', 'title')        
      .populate('hall', 'name')           
      .sort({ createdAt: -1 });           

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// 2. Cancel Booking (Admin Only)
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};




// 3. Verify & Scan Ticket (Admin App)
export const verifyTicket = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'username')
      .populate('movie', 'title')
      .populate('hall', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Invalid Ticket! Booking not found.' });
    }

    // Check if cancelled
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'This ticket has been CANCELLED.' });
    }

    // Check if already used
    if (booking.status === 'Used') {
      return res.status(400).json({ 
        message: 'Ticket already USED!', 
        details: {
            user: booking.user,
            movie: booking.movie,
            seats: booking.seats,
            scannedAt: booking.updatedAt
        }
      });
    }

    // Valid Ticket නම්, status එක 'Used' කරනවා
    booking.status = 'Used';
    await booking.save();

    res.status(200).json({ 
      message: 'Ticket Verified Successfully! ✅', 
      booking: {
        id: booking._id,
        user: booking.user,
        movie: booking.movie,
        hall: booking.hall,
        seats: booking.seats,
        date: booking.date,
        time: booking.time
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error verifying ticket', error });
  }
};

// 4. Create Counter Booking (POS)
export const createCounterBooking = async (req: Request, res: Response) => {
  try {
    console.log("📥 Received Booking Request:", req.body); // 1. Frontend එකෙන් එන දත්ත බලන්න

    const { movieId, hallId, date, time, seats, totalPrice, guestName, guestPhone } = req.body;

    // Validation Check
    if (!movieId || !hallId || !date || !time || !seats || seats.length === 0) {
        console.error("❌ Missing Fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Create Booking
    const newBooking = new Booking({
      movie: movieId,
      hall: hallId,
      date,
      time,
      seats,
      totalPrice,
      status: 'Paid',
      paymentMethod: 'Cash',
      guestInfo: {
        name: guestName || 'Walk-in Customer',
        phone: guestPhone || 'N/A'
      }
      // වැදගත්: මෙතන 'user' field එක යවන්නේ නෑ (ඒක හිස්ව තියෙන්න ඕන)
    });

    await newBooking.save();
    console.log("✅ Booking Saved Successfully!");

    res.status(201).json({ message: 'Booking Successful!', booking: newBooking });

  } catch (error: any) {
    console.error("❌ Counter Booking Error:", error.message); // 2. Error එක මොකක්ද කියලා බලන්න
    res.status(500).json({ message: 'Counter Booking Failed', error: error.message });
  }
};
// ... imports including User

import mongoose from 'mongoose'; // 👈👈👈 මේ පේළිය අනිවාර්යයෙන්ම එකතු කරන්න


// ... ඉතුරු කෝඩ් එක එලෙසම තියන්න ...

export const searchBookings = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchString = query as string;
    const searchRegex = new RegExp(searchString, 'i');

    const matchingUsers = await User.find({
      $or: [{ email: searchRegex }, { phone: searchRegex }, { username: searchRegex }] 
    }).select('_id');

    const userIds = matchingUsers.map(u => u._id);

    const searchConditions: any[] = [
        { user: { $in: userIds } },
        { 'guestInfo.phone': searchRegex },
        { 'guestInfo.name': searchRegex },
        { 'guestInfo.nic': searchRegex }
    ];

    // 👇 දැන් මේ පේළිය වැඩ කරයි (මොකද උඩින් import කළ නිසා)
    if (mongoose.Types.ObjectId.isValid(searchString)) {
        searchConditions.push({ _id: searchString });
    }

    const bookings = await Booking.find({
      $or: searchConditions
    })
    .populate('user', 'username email phone')
    .populate('movie', 'title')
    .populate('hall', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json(bookings);

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: 'Search failed', error });
  }
};




// Booking Cancel කිරීමේ function එක
// export const cancelBookingRes = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params; // URL එකෙන් Booking ID එක ගන්නවා

//     // 1. මුලින්ම Booking එක හොයාගන්න
//     const booking = await Booking.findById(id);

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // 2. දැනටමත් Cancel කරලා නම් නවත්වන්න
//     if (booking.status === 'Cancelled') {
//       return res.status(400).json({ message: 'This booking is already cancelled' });
//     }

//     // 3. Status එක වෙනස් කරන්න
//     booking.status = 'Cancelled';
    
//     // (Optional) Refund reason එකක් දාන්න ඕන නම් database එකට field එකක් එකතු කරන්න පුළුවන්.
//     // booking.refundReason = req.body.reason; 

//     await booking.save();

//     res.status(200).json({ 
//       message: 'Booking cancelled successfully', 
//       booking 
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error while cancelling' });
//   }
// };

export const cancelBookingRes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Booking එක හොයාගන්න
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // --- වැදගත්ම කොටස මෙතන ---

    // 2. අදාළ Show එකෙන් සීට් ටික අයින් කරන්න (Release Seats)
    // අපි මෙතන $pull පාවිච්චි කරලා Show එකේ 'bookedSeats' array එකෙන් මේ සීට් ටික අයින් කරනවා
    await Show.findByIdAndUpdate(
      booking.showId, 
      { 
        $pull: { bookedSeats: { $in: booking.seats } } 
      }
    );

    // 3. Booking Status එක වෙනස් කරන්න
    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled and seats released successfully' });

  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: 'Server error while cancelling' });
  }
};
import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  hall: mongoose.Types.ObjectId; 
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'Booked' | 'Used'| 'Paid' | 'Cancelled'; 

  paymentMethod: 'Card' | 'Cash';
  guestInfo?: { 
    name: string;
    phone: string;
  };

}

const BookingSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    seats: { type: [String], required: true },
    totalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Booked', 'Used', 'Paid','Cancelled'], 
      default: 'Booked' 
    },

paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'ONLINE_PAYMENT'] 
  },
      guestInfo: {
      name: { type: String },
      phone: { type: String },
    },

    
  },
  { timestamps: true }
);




export default mongoose.model<IBooking>('Booking', BookingSchema);
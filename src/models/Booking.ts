import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  hall: mongoose.Types.ObjectId; 
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    seats: { type: [String], required: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
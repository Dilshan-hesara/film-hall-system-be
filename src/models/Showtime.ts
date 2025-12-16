import mongoose, { Schema, Document } from 'mongoose';

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  hall: mongoose.Types.ObjectId; 
  showDate: string;
  showTime: string; 
  ticketPrice: number;
}

const ShowtimeSchema: Schema = new Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    showDate: { type: String, required: true },
    showTime: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
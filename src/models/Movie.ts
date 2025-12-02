import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: Date;
  posterUrl: string; 
  ticketPrice: number;
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    releaseDate: { type: Date, required: true },
    posterUrl: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>('Movie', MovieSchema);
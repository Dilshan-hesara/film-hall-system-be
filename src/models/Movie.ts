import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: Date;
  posterUrl: string;
  coverUrl: string;
  trailerUrl: string; 
    ticketPrice: number;
  status: 'Now Showing' | 'Coming Soon'; 
  censorRating: 'U' | 'UA' | 'A' | 'S'; 
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    releaseDate: { type: Date, required: true },
    posterUrl: { type: String, required: true },
    coverUrl: { type: String, default: '' }, 
    
    // Video
    trailerUrl: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Now Showing', 'Coming Soon'], 
      default: 'Now Showing' 
    },

    censorRating: {
      type: String,
      enum: ['U', 'UA', 'A', 'S'],
      required: true,
      default: 'U' 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>('Movie', MovieSchema);
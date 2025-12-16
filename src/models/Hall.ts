import mongoose, { Schema, Document } from 'mongoose';

export interface IHall extends Document {
  name: string;
  rows: number;     
  columns: number; 
  capacity: number;
}

const HallSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHall>('Hall', HallSchema);
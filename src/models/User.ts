// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
// }, { timestamps: true });

// export default mongoose.model('User', UserSchema);


import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin' | 'receptionist';
  profileImage?: string;
  gender: 'Male' | 'Female' | 'Other'; 
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  wishlist: mongoose.Schema.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin' , 'receptionist'], default: 'user' },
    profileImage: { type: String, default: '' }, 
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    isVerified: { type: Boolean, default: false }, 
    otp: { type: String }, 
    otpExpires: { type: Date },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
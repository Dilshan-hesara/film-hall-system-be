import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// 1. Update Profile (Name & Image)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId, username, profileImage } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.profileImage = profileImage || user.profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// 2. Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // පරණ Password එක හරිද බලනවා
    const isMatch = await bcrypt.compare(currentPassword, user.password as string);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // අලුත් Password එක Hash කරනවා
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Password එක අතහැරලා (select('-password')) අනිත් විස්තර එවන්න
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// 4. Update User Role (Make Admin / Remove Admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'admin' or 'user'

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error });
  }
};

// 5. Delete User (Admin Only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, gender } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin',       // 👇 කෙලින්ම Admin
      gender: gender || 'Male',
      isVerified: true,    // 👇 කෙලින්ම Verified
    });

    res.status(201).json({ message: 'New Admin created successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

// 7. Admin Force Reset Password (වෙන කෙනෙක්ගේ Password වෙනස් කිරීම)
export const adminResetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // වෙනස් කළ යුතු User ගේ ID එක
    const { newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

// 8. Get All Admins Only
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
};
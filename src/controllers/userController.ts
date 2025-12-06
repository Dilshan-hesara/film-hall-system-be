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
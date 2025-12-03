import { Request, Response } from 'express';
import Hall from '../models/Hall';

// 1. Add New Hall
export const addHall = async (req: Request, res: Response) => {
  try {
    const { name, rows, columns } = req.body;

    // නම දැනටමත් තියෙනවද බලනවා
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      return res.status(400).json({ message: 'Hall name already exists' });
    }

    // Capacity එක Auto Calculate වෙනවා
    const capacity = rows * columns;

    const newHall = new Hall({
      name,
      rows,
      columns,
      capacity,
    });

    await newHall.save();
    res.status(201).json({ message: 'Hall added successfully', hall: newHall });

  } catch (error) {
    res.status(500).json({ message: 'Error adding hall', error });
  }
};

// 2. Get All Halls (Dropdowns සඳහා අවශ්‍ය වෙයි)
export const getAllHalls = async (req: Request, res: Response) => {
  try {
    const halls = await Hall.find();
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching halls', error });
  }
};
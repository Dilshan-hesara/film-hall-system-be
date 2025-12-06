import { Request, Response } from 'express';
import Hall from '../models/Hall';

// 1. Add New Hall
export const addHall = async (req: Request, res: Response) => {
  try {
    const { name, rows, columns } = req.body;

    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      return res.status(400).json({ message: 'Hall name already exists' });
    }

    // Capacity  Auto Calculate 
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

// 2. Get All Halls
export const getAllHalls = async (req: Request, res: Response) => {
  try {
    const halls = await Hall.find();
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching halls', error });
  }
};

export const getHallById = async (req: Request, res: Response) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }
    res.status(200).json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hall', error });
  }
};
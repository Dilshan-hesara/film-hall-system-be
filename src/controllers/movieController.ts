import { Request, Response } from 'express';
import Movie from '../models/Movie';

export const addMovie = async (req: Request, res: Response) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error adding movie', error });
  }
};

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }); 
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies', error });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie', error });
  }
};
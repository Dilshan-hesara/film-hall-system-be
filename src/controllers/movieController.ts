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


export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error updating movie', error });
  }
};

// 5. Delete Movie
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting movie', error });
  }
};

// 6. Advanced Search & Filter
export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { search, genre, language } = req.query;

    const query: any = {};

    // 1. Text Search (Partial Match - Case Insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 2. Genre Filter
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // 3. Language Filter
    if (language && language !== 'All') {
      query.language = language;
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error searching movies', error });
  }
};
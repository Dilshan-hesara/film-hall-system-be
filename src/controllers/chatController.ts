import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Movie from '../models/Movie';
import Showtime from '../models/Showtime';
import dotenv from 'dotenv';

dotenv.config();

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Server Error: API Key missing" });
    }

    const movies = await Movie.find().select('title language genre status description');
    
    const today = new Date().toISOString().split('T')[0];
    const showtimes = await Showtime.find({ showDate: { $gte: today } })
      .populate('movie', 'title')
      .populate('hall', 'name');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    


const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const context = `
      You are a helpful assistant for "MKD Cinema".
      
      Movies Available: ${JSON.stringify(movies)}
      Showtimes: ${JSON.stringify(showtimes)}
      
      User Question: "${message}"
      
      Answer concisely based on the data provided.
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error: any) {
    console.error("AI Error:", error); 
    
    res.status(500).json({ 
      message: "AI Service Unavailable", 
      reply: "Sorry, I am currently overloaded. Please try again later."
    });
  }
};


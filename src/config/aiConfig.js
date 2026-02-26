import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Ensure the API key is present
if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not defined in the environment variables.');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your_api_key_here');

// Helper to easily get the text model (Use the latest flash model to prevent 404s)
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });
};

// Export the base client in case advanced configuration is needed elsewhere
export default genAI;

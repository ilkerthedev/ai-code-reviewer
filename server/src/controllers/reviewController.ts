import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

export const reviewCode = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code is required and must be a string' });
    return;
  }

  // Basic validation to prevent extremely large payloads
  if (code.length > 50000) {
    res.status(400).json({ error: 'Code payload is too large. Maximum 50,000 characters allowed.' });
    return;
  }

  try {
    const rawReview = await aiService.getReview(code);
    
    try {
        // Attempt to parse the JSON. Sometimes LLMs wrap JSON in markdown blocks (```json ... ```)
        const jsonMatch = rawReview.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : rawReview;
        
        const parsedReview = JSON.parse(jsonString);
        res.json({ review: parsedReview });
    } catch (parseError) {
        // Fallback if parsing fails for some reason
        console.error("Failed to parse AI response as JSON:", rawReview);
        res.status(500).json({ error: 'Failed to process AI response format' });
    }

  } catch (error) {
    console.error('Error generating review:', error);
    res.status(500).json({ error: 'Something went wrong during code review' });
  }
};

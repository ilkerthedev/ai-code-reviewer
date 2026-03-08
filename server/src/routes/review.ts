import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

router.post('/', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert code reviewer. Analyze the following code and provide:
      1. **Language**: What language is this?
      2. **Bugs**: Any bugs or errors found
      3. **Security**: Security vulnerabilities if any
      4. **Performance**: Performance improvements
      5. **Best Practices**: What could be done better
      6. **Improved Code**: A better version of the code
      
      Be concise and practical. Format with clear sections.
      
      Code to review:
      \`\`\`
      ${code}
      \`\`\`
    `;

    const result = await model.generateContent(prompt);
    const review = result.response.text();

    res.json({ review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export { router as reviewRouter };
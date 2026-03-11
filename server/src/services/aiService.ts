import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async getReview(code: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert code reviewer. Analyze the following code.
      
      Respond ONLY with a valid JSON object matching this schema:
      {
        "language": "string (the programming language detected)",
        "issues": [
          {
            "type": "bug | security | performance | best-practice",
            "description": "string (clear description of the issue)",
            "severity": "high | medium | low"
          }
        ],
        "improvedCode": "string (the complete refactored/improved version of the code snippet)"
      }
      
      Code to review:
      \`\`\`
      ${code}
      \`\`\`
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export const aiService = new AIService();

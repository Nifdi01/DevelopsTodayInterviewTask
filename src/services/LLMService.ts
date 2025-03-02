import axios from 'axios';
import { config } from '../config/config';

export const cleanArticleContent = async (rawContent: string): Promise<string> => {
  try {
    const prompt = `
        Clean and structure the following article content.
        Return ONLY a object with these fields:
        {
        "title": "Extract Title",
        "content": "The cleaned, structured content with paragraphs intact",
        "date": "Extract the publication date in YYYY-MM-DD format"
        }

        Article content:
        ${rawContent}
    `;
    
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 4096,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.llmApiKey
      },
    });
    
    const responseText = response.data.candidates[0].content.parts[0].text.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    return jsonMatch[0];

  } catch (error) {
    console.error('LLM cleaning error:', error);
    return rawContent;
  }
};

export const generateAnswer = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 4096,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.llmApiKey
      },
    });
    
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('LLM answer generation error:', error);
    return "Error generating answer.";
  }
};
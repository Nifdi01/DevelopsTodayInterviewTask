import axios from 'axios';
import { config } from '../config/config';

export const cleanArticleContent = async (rawContent: string): Promise<string> => {
  try {
    const prompt = `
        Clean and structure the following article content.
        Return ONLY a valid JSON object with these fields:
        {
        "title": "Extract Title",
        "content": "The cleaned, structured content with paragraphs intact",
        "date": "Extract the publication date in YYYY-MM-DD format"
        }
        
        Do not include any explanation, markdown formatting, or code blocks. Return ONLY the JSON object.

        Article content:
        ${rawContent}
    `;
    
    const response = await axios.post(config.generatorApiKey, {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 8192,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.llmApiKey
      },
    });
    
    const responseText = response.data.candidates[0].content.parts[0].text.trim();
    
    let jsonText = responseText.replace(/```json|```/g, '').trim();
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    try {
      JSON.parse(jsonText);
      return jsonText;
    } catch (jsonError) {
      console.error('Invalid JSON from LLM:', jsonError);
      console.log('Attempted to parse:', jsonText);
      
      const fallbackJson = {
        title: "Unknown Title",
        content: rawContent.substring(0, 5000),
        date: new Date().toISOString().split('T')[0]
      };
      
      return JSON.stringify(fallbackJson);
    }

  } catch (error) {
    console.error('LLM cleaning error:', error);
    
    const fallbackJson = {
      title: "Unknown Title",
      content: rawContent.substring(0, 5000), 
      date: new Date().toISOString().split('T')[0]
    };
    
    return JSON.stringify(fallbackJson);
  }
};

export const generateAnswer = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(config.generatorApiKey, {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 8192,
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
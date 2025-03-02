import puppeteer, { Browser, Page } from 'puppeteer';
import { Article } from '../models/Article';
import { cleanArticleContent } from './LLMService';


export const extractArticle = async (url: string): Promise<string | null> => {
  let browser: Browser | undefined;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
    });

    const page: Page = await browser.newPage();
    
    // Set a user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');
    
    
    // Basic error logging
    page.on('error', err => console.error('Page error:', err));
    
    // Navigate with simple settings
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const pageContent: string = await page.evaluate(() => {
      return document.body.innerText || '';
    });
    
    // Clean up the text
    const cleanedContent = pageContent
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!cleanedContent || cleanedContent.length < 50) {
      console.warn('Warning: Extracted content seems too short.');
    }
    
    return cleanedContent;
  } catch (error) {
    console.error('Error extracting article with Puppeteer:', error);
    
    // Try a simpler fallback approach for news sites
    try {
      if (browser) await browser.close();
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page: Page = await browser.newPage();
      await page.goto(url, { timeout: 30000 });
      
      // Wait for a typical news article element
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Simplest possible content extraction
      const textContent = await page.$eval('body', element => element.textContent || '');
      
      return textContent.replace(/\s+/g, ' ').trim();
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError);
      return null;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const processArticle = async (url: string): Promise<Article | null> => {
    const article = await extractArticle(url);
    if (!article) return null;
  
    let cleanedContent = await cleanArticleContent(article);
    let cleanedJson: Article = JSON.parse(cleanedContent) as Article;
    cleanedJson.url = url;
    console.log(cleanedJson);
    return cleanedJson;
  };
  
// processArticle("https://edition.cnn.com/2025/01/23/business/unitedhealthcare-new-ceo/index.html")
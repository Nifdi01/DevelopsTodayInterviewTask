import axios from 'axios';
import { load } from 'cheerio';
import { Article } from '../models/Article';
import { cleanArticleContent } from './LLMService';


export const extractArticle = async (url: string): Promise<string | null> => {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);

    $('script, style').remove();

    const pageContent = $('body').text().replace(/\s+/g, ' ').trim();

    return pageContent;
  } catch (error) {
    console.error('Error extracting article:', error);
    return null;
  }
};

export const processArticle = async (url: string): Promise<Article | null> => {
    const article = await extractArticle(url);
    if (!article) return null;
  
    let cleanedContent = await cleanArticleContent(article);
    let cleanedJson: Article = JSON.parse(cleanedContent) as Article;
    cleanedJson.url = url;
    return cleanedJson;
  };
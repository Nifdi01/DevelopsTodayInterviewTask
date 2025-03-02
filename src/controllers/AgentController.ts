import { Request, Response } from 'express';
import { processArticle } from '../services/ArticleService';
import { getArticleById, storeArticle } from '../services/VectorStoreService';
import {searchSimilarArticles} from '../services/SearchService';
import { generateAnswer } from '../services/LLMService';
import { Article } from '../models/Article';

export const handleAgentQuery = async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  let contextArticles: Article[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = query.match(urlRegex);

  if (urls?.length) {
    const url = urls[0];
    const id = Buffer.from(url).toString('base64');
    let article = await getArticleById(id);
    if (!article) {
      article = await processArticle(url);
      if (article) await storeArticle(article);
    }
    if (article) contextArticles = [article];
  } else {
    contextArticles = await searchSimilarArticles(query);
  }

  const contextText = contextArticles
    .map(article => `${article.title}\n${article.content}`)
    .join('\n');

  const prompt = `Answer the query based on the following context:\n${contextText}\n\nQuery: ${query}\nAnswer:`;
  const answer = await generateAnswer(prompt);

  const sources = contextArticles.map(article => ({
    title: article.title,
    url: article.url,
    date: article.date
  }));

  res.json({ answer, sources });
};
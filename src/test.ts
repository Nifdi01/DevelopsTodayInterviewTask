import { cleanArticleContent, generateAnswer } from './services/LLMService';
import { processArticle } from './services/ArticleService';

const test = async () => {
  // Test cleanArticleContent
  const rawArticle = "Breaking News: The economy is recovering. Published on 2025-03-02.";
  const cleanedArticle = await cleanArticleContent(rawArticle);
  console.log(cleanedArticle);
};

const testArticleService = async () => {
    const url = "https://www.ukrinform.net/rubric-ato/3965957-war-update-97-combat-engagements-on-frontline-most-intense-on-pokrovsk-axis.html"
    const res = processArticle(url);
}

testArticleService();

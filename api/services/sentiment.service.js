// api/services/sentiment.service.js

const safetyKeywords = ["safe", "secure", "crime", "police", "theft"];
const cleanlinessKeywords = ["clean", "dirty", "garbage", "waste", "pollution"];
const livabilityKeywords = ["quiet", "noise", "peaceful", "crowded", "comfortable"];

const scoreText = (text, keywords) => {
  const lower = text.toLowerCase();
  let score = 50;

  keywords.forEach((word) => {
    if (lower.includes(word)) score += 10;
  });

  return Math.min(score, 100);
};

export const analyzeNeighborhoodSentiment = async (text) => {
  return {
    safety: scoreText(text, safetyKeywords),
    cleanliness: scoreText(text, cleanlinessKeywords),
    livability: scoreText(text, livabilityKeywords),
  };
};

import { useCallback } from 'react';

export const useCompareStrings = () => {
    const calculateLevenshtein = useCallback(calculateLevenshteinDistance, []);
    const calculateSimilarity = useCallback(calculateSimilarityPercentage, []);
  
    return {
      calculateLevenshtein,
      calculateSimilarity,
    };
  };

export const calculateLevenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
  
    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;
  
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp[len1][len2];
  };
  
  export const calculateSimilarityPercentage = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const maxLen = Math.max(str1.length, str2.length);
    const distance = calculateLevenshteinDistance(str1, str2);

    return ((maxLen - distance) / maxLen) * 100;
  };
  

export default useCompareStrings;

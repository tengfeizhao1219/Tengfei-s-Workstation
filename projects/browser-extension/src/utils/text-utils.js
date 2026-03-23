// 文本处理工具函数

/**
 * 清理文本内容
 * @param {string} text - 原始文本
 * @returns {string} 清理后的文本
 */
export function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n')           // 统一换行符
    .replace(/\s+/g, ' ')             // 合并多个空格
    .replace(/\n\s*\n/g, '\n\n')      // 合并多个空行
    .trim();
}

/**
 * 计算文本统计信息
 * @param {string} text - 文本内容
 * @returns {Object} 统计信息
 */
export function calculateTextStats(text) {
  if (!text) {
    return {
      length: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime: 0
    };
  }
  
  const cleanedText = cleanText(text);
  
  // 计算单词数（中英文混合）
  const wordCount = cleanedText
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
  
  // 计算句子数
  const sentenceCount = cleanedText
    .split(/[.!?。！？]+/)
    .filter(sentence => sentence.trim().length > 0)
    .length;
  
  // 计算段落数
  const paragraphCount = cleanedText
    .split(/\n\n+/)
    .filter(paragraph => paragraph.trim().length > 0)
    .length;
  
  // 计算阅读时间（假设200字/分钟）
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    length: cleanedText.length,
    wordCount: wordCount,
    sentenceCount: sentenceCount,
    paragraphCount: paragraphCount,
    readingTime: readingTime
  };
}

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  
  // 在完整单词后截断
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

/**
 * 提取关键词（简单实现）
 * @param {string} text - 文本内容
 * @param {number} count - 关键词数量
 * @returns {string[]} 关键词数组
 */
export function extractKeywords(text, count = 5) {
  if (!text) return [];
  
  // 中文文本处理
  const chineseText = text.replace(/[^\u4e00-\u9fa5]/g, ' ');
  const chineseWords = chineseText.split(/\s+/).filter(word => word.length >= 2);
  
  // 英文文本处理
  const englishText = text.replace(/[^a-zA-Z]/g, ' ');
  const englishWords = englishText.toLowerCase().split(/\s+/).filter(word => word.length >= 3);
  
  // 合并并统计词频
  const allWords = [...chineseWords, ...englishWords];
  const wordFrequency = {};
  
  allWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // 按频率排序并提取前N个
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * 生成文本指纹（用于去重）
 * @param {string} text - 文本内容
 * @returns {string} 文本指纹
 */
export function generateTextFingerprint(text) {
  if (!text) return '';
  
  // 简单实现：取前100字符的哈希
  const shortText = text.substring(0, 100).toLowerCase().replace(/\s+/g, '');
  
  // 简单哈希函数
  let hash = 0;
  for (let i = 0; i < shortText.length; i++) {
    const char = shortText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return '无效日期';
  }
  
  const pad = (n) => n.toString().padStart(2, '0');
  
  const replacements = {
    'YYYY': d.getFullYear(),
    'MM': pad(d.getMonth() + 1),
    'DD': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds())
  };
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
}

/**
 * 计算文本相似度（简单实现）
 * @param {string} text1 - 文本1
 * @param {string} text2 - 文本2
 * @returns {number} 相似度（0-1）
 */
export function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // 转换为小写并分割为单词
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  // 计算交集
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  
  // 计算并集
  const union = new Set([...set1, ...set2]);
  
  // Jaccard相似度
  return intersection.size / union.size;
}

export default {
  cleanText,
  calculateTextStats,
  truncateText,
  extractKeywords,
  generateTextFingerprint,
  formatDate,
  calculateSimilarity
};

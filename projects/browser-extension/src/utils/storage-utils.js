// 存储工具函数

/**
 * 获取存储数据
 * @param {string|string[]} keys - 键名或键名数组
 * @returns {Promise<any>} 存储数据
 */
export async function getStorage(keys) {
  try {
    return await chrome.storage.local.get(keys);
  } catch (error) {
    console.error('获取存储数据失败:', error);
    return {};
  }
}

/**
 * 设置存储数据
 * @param {Object} data - 要存储的数据
 * @returns {Promise<void>}
 */
export async function setStorage(data) {
  try {
    await chrome.storage.local.set(data);
  } catch (error) {
    console.error('设置存储数据失败:', error);
  }
}

/**
 * 清除存储数据
 * @param {string|string[]} keys - 要清除的键名
 * @returns {Promise<void>}
 */
export async function clearStorage(keys) {
  try {
    await chrome.storage.local.remove(keys);
  } catch (error) {
    console.error('清除存储数据失败:', error);
  }
}

/**
 * 获取所有存储数据
 * @returns {Promise<Object>} 所有存储数据
 */
export async function getAllStorage() {
  try {
    return await chrome.storage.local.get(null);
  } catch (error) {
    console.error('获取所有存储数据失败:', error);
    return {};
  }
}

/**
 * 保存摘要到历史记录
 * @param {Object} summary - 摘要数据
 * @param {Object} metadata - 元数据
 * @returns {Promise<Object>} 保存的条目
 */
export async function saveSummaryToHistory(summary, metadata = {}) {
  try {
    const storage = await getStorage(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    const newEntry = {
      id: Date.now().toString(),
      summary: summary,
      metadata: {
        ...metadata,
        savedAt: new Date().toISOString(),
        url: metadata.url || window.location.href || 'unknown'
      }
    };
    
    // 添加到开头
    history.unshift(newEntry);
    
    // 保持最多100条记录
    const trimmedHistory = history.slice(0, 100);
    
    // 保存到存储
    await setStorage({ summaryHistory: trimmedHistory });
    
    // 更新统计
    await updateSummaryStats();
    
    return newEntry;
  } catch (error) {
    console.error('保存摘要到历史记录失败:', error);
    throw error;
  }
}

/**
 * 获取摘要历史记录
 * @param {Object} options - 选项
 * @param {number} options.limit - 限制数量
 * @param {number} options.offset - 偏移量
 * @param {string} options.search - 搜索关键词
 * @returns {Promise<Object>} 历史记录数据
 */
export async function getSummaryHistory(options = {}) {
  try {
    const { limit = 20, offset = 0, search = '' } = options;
    const storage = await getStorage(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    // 应用搜索过滤
    let filteredHistory = history;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredHistory = history.filter(entry => 
        entry.summary?.summary?.toLowerCase().includes(searchLower) ||
        entry.metadata?.url?.toLowerCase().includes(searchLower) ||
        entry.metadata?.title?.toLowerCase().includes(searchLower)
      );
    }
    
    // 应用分页
    const paginatedHistory = filteredHistory.slice(offset, offset + limit);
    
    return {
      items: paginatedHistory,
      total: filteredHistory.length,
      hasMore: offset + limit < filteredHistory.length
    };
  } catch (error) {
    console.error('获取摘要历史记录失败:', error);
    return { items: [], total: 0, hasMore: false };
  }
}

/**
 * 删除摘要历史记录
 * @param {string} id - 条目ID
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteSummaryHistory(id) {
  try {
    const storage = await getStorage(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    // 过滤掉要删除的条目
    const filteredHistory = history.filter(entry => entry.id !== id);
    
    // 保存更新后的历史记录
    await setStorage({ summaryHistory: filteredHistory });
    
    return true;
  } catch (error) {
    console.error('删除摘要历史记录失败:', error);
    return false;
  }
}

/**
 * 清空摘要历史记录
 * @returns {Promise<boolean>} 是否成功
 */
export async function clearSummaryHistory() {
  try {
    await clearStorage(['summaryHistory']);
    return true;
  } catch (error) {
    console.error('清空摘要历史记录失败:', error);
    return false;
  }
}

/**
 * 更新摘要统计
 * @returns {Promise<Object>} 更新后的统计
 */
export async function updateSummaryStats() {
  try {
    const storage = await getStorage(['totalSummaries', 'todaySummaries', 'lastSummaryDate']);
    
    const today = new Date().toDateString();
    const lastDate = storage.lastSummaryDate || today;
    
    let todaySummaries = storage.todaySummaries || 0;
    let totalSummaries = storage.totalSummaries || 0;
    
    // 如果日期变化，重置今日统计
    if (lastDate !== today) {
      todaySummaries = 0;
    }
    
    // 增加统计
    todaySummaries += 1;
    totalSummaries += 1;
    
    // 保存更新后的统计
    await setStorage({
      totalSummaries: totalSummaries,
      todaySummaries: todaySummaries,
      lastSummaryDate: today
    });
    
    return { todaySummaries, totalSummaries };
  } catch (error) {
    console.error('更新摘要统计失败:', error);
    return { todaySummaries: 0, totalSummaries: 0 };
  }
}

/**
 * 获取摘要统计
 * @returns {Promise<Object>} 统计信息
 */
export async function getSummaryStats() {
  try {
    const storage = await getStorage(['totalSummaries', 'todaySummaries', 'lastSummaryDate']);
    
    const today = new Date().toDateString();
    const lastDate = storage.lastSummaryDate || today;
    
    let todaySummaries = storage.todaySummaries || 0;
    
    // 如果日期变化，重置今日统计
    if (lastDate !== today) {
      todaySummaries = 0;
      await setStorage({
        todaySummaries: 0,
        lastSummaryDate: today
      });
    }
    
    return {
      todaySummaries: todaySummaries,
      totalSummaries: storage.totalSummaries || 0,
      lastSummaryDate: lastDate
    };
  } catch (error) {
    console.error('获取摘要统计失败:', error);
    return { todaySummaries: 0, totalSummaries: 0, lastSummaryDate: '' };
  }
}

/**
 * 导出历史记录为JSON
 * @returns {Promise<string>} JSON字符串
 */
export async function exportHistoryToJSON() {
  try {
    const storage = await getStorage(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      count: history.length,
      history: history
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('导出历史记录失败:', error);
    throw error;
  }
}

/**
 * 从JSON导入历史记录
 * @param {string} jsonString - JSON字符串
 * @returns {Promise<boolean>} 是否成功
 */
export async function importHistoryFromJSON(jsonString) {
  try {
    const importData = JSON.parse(jsonString);
    
    if (!importData.history || !Array.isArray(importData.history)) {
      throw new Error('无效的导入数据格式');
    }
    
    // 验证数据格式
    const validHistory = importData.history.filter(entry => 
      entry.id && entry.summary && entry.metadata
    );
    
    // 获取现有历史记录
    const storage = await getStorage(['summaryHistory']);
    const existingHistory = storage.summaryHistory || [];
    
    // 合并历史记录（避免重复）
    const mergedHistory = [...validHistory, ...existingHistory];
    
    // 去重（基于ID）
    const uniqueHistory = [];
    const seenIds = new Set();
    
    for (const entry of mergedHistory) {
      if (!seenIds.has(entry.id)) {
        seenIds.add(entry.id);
        uniqueHistory.push(entry);
      }
    }
    
    // 按时间排序（最新的在前）
    uniqueHistory.sort((a, b) => {
      const timeA = new Date(a.metadata.savedAt || 0).getTime();
      const timeB = new Date(b.metadata.savedAt || 0).getTime();
      return timeB - timeA;
    });
    
    // 保持最多200条记录
    const trimmedHistory = uniqueHistory.slice(0, 200);
    
    // 保存到存储
    await setStorage({ summaryHistory: trimmedHistory });
    
    return true;
  } catch (error) {
    console.error('导入历史记录失败:', error);
    throw error;
  }
}

export default {
  getStorage,
  setStorage,
  clearStorage,
  getAllStorage,
  saveSummaryToHistory,
  getSummaryHistory,
  deleteSummaryHistory,
  clearSummaryHistory,
  updateSummaryStats,
  getSummaryStats,
  exportHistoryToJSON,
  importHistoryFromJSON
};

// 后台服务worker - 智能网页总结插件

// 扩展安装或更新时
chrome.runtime.onInstalled.addListener((details) => {
  console.log('智能网页总结插件已安装/更新:', details.reason);
  
  // 创建上下文菜单
  chrome.contextMenus.create({
    id: 'summarizePage',
    title: '智能总结此页面',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'summarizeSelection',
    title: '总结选中文本',
    contexts: ['selection']
  });
  
  // 初始化存储
  chrome.storage.local.set({
    totalSummaries: 0,
    todaySummaries: 0,
    lastSummaryDate: new Date().toDateString(),
    settings: {
      summaryLength: 'medium',
      language: 'zh-CN',
      autoSave: true,
      showSidebar: false
    }
  });
});

// 上下文菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarizePage') {
    // 总结整个页面
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarizePage',
      source: 'contextMenu'
    });
  } else if (info.menuItemId === 'summarizeSelection') {
    // 总结选中文本
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarizeSelection',
      text: info.selectionText,
      source: 'contextMenu'
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('后台收到消息:', message);
  
  switch (message.action) {
    case 'getPageContent':
      // 获取页面内容
      handleGetPageContent(message, sender, sendResponse);
      break;
      
    case 'generateSummary':
      // 生成摘要
      handleGenerateSummary(message, sender, sendResponse);
      break;
      
    case 'saveSummary':
      // 保存摘要
      handleSaveSummary(message, sender, sendResponse);
      break;
      
    case 'getHistory':
      // 获取历史记录
      handleGetHistory(message, sender, sendResponse);
      break;
      
    case 'updateStats':
      // 更新统计
      handleUpdateStats(message, sender, sendResponse);
      break;
      
    default:
      console.warn('未知消息类型:', message.action);
      sendResponse({ success: false, error: '未知操作' });
  }
  
  return true; // 保持消息通道开放用于异步响应
});

// 处理获取页面内容
async function handleGetPageContent(message, sender, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      sendResponse({ success: false, error: '未找到活动标签页' });
      return;
    }
    
    // 执行内容脚本获取页面内容
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageContent,
      args: [message.options]
    });
    
    if (results && results[0] && results[0].result) {
      sendResponse({ success: true, data: results[0].result });
    } else {
      sendResponse({ success: false, error: '未能获取页面内容' });
    }
  } catch (error) {
    console.error('获取页面内容失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理生成摘要
async function handleGenerateSummary(message, sender, sendResponse) {
  try {
    const { content, options } = message;
    
    // 这里调用AI API生成摘要
    // 暂时使用模拟数据
    const summary = await generateAISummary(content, options);
    
    // 更新统计
    await updateSummaryStats();
    
    sendResponse({ success: true, data: summary });
  } catch (error) {
    console.error('生成摘要失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理保存摘要
async function handleSaveSummary(message, sender, sendResponse) {
  try {
    const { summary, metadata } = message;
    
    // 获取现有历史记录
    const storage = await chrome.storage.local.get(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    // 添加新摘要
    const newEntry = {
      id: Date.now().toString(),
      summary: summary,
      metadata: {
        ...metadata,
        savedAt: new Date().toISOString(),
        url: sender.tab?.url || 'unknown'
      }
    };
    
    history.unshift(newEntry); // 添加到开头
    
    // 保持最多100条记录
    const trimmedHistory = history.slice(0, 100);
    
    // 保存到存储
    await chrome.storage.local.set({ summaryHistory: trimmedHistory });
    
    sendResponse({ success: true, data: newEntry });
  } catch (error) {
    console.error('保存摘要失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理获取历史记录
async function handleGetHistory(message, sender, sendResponse) {
  try {
    const storage = await chrome.storage.local.get(['summaryHistory']);
    const history = storage.summaryHistory || [];
    
    // 应用过滤和分页
    const { limit = 20, offset = 0 } = message;
    const filteredHistory = history.slice(offset, offset + limit);
    
    sendResponse({
      success: true,
      data: {
        items: filteredHistory,
        total: history.length,
        hasMore: offset + limit < history.length
      }
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理更新统计
async function handleUpdateStats(message, sender, sendResponse) {
  try {
    const storage = await chrome.storage.local.get(['totalSummaries', 'todaySummaries', 'lastSummaryDate']);
    
    const today = new Date().toDateString();
    const lastDate = storage.lastSummaryDate || today;
    
    let todaySummaries = storage.todaySummaries || 0;
    let totalSummaries = storage.totalSummaries || 0;
    
    // 如果日期变化，重置今日统计
    if (lastDate !== today) {
      todaySummaries = 0;
    }
    
    // 增加统计
    todaySummaries += message.count || 1;
    totalSummaries += message.count || 1;
    
    // 保存更新后的统计
    await chrome.storage.local.set({
      totalSummaries: totalSummaries,
      todaySummaries: todaySummaries,
      lastSummaryDate: today
    });
    
    sendResponse({
      success: true,
      data: {
        todaySummaries: todaySummaries,
        totalSummaries: totalSummaries
      }
    });
  } catch (error) {
    console.error('更新统计失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 提取页面内容函数（在页面上下文中执行）
function extractPageContent(options = {}) {
  const config = {
    maxLength: options.maxLength || 5000,
    includeImages: options.includeImages || false,
    includeLinks: options.includeLinks || true,
    ...options
  };
  
  // 尝试获取正文内容
  const article = document.querySelector('article') || 
                 document.querySelector('.post-content') ||
                 document.querySelector('.content') ||
                 document.querySelector('main') ||
                 document.querySelector('[role="main"]') ||
                 document.body;
  
  // 克隆节点以避免修改原DOM
  const clone = article.cloneNode(true);
  
  // 移除不需要的元素
  const elementsToRemove = clone.querySelectorAll(
    'script, style, noscript, iframe, object, embed, nav, footer, header, aside, .ad, .advertisement, [class*="ad-"], [id*="ad-"]'
  );
  
  elementsToRemove.forEach(el => el.remove());
  
  // 提取文本内容
  let content = '';
  const walker = document.createTreeWalker(
    clone,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text && text.length > 10) { // 过滤过短的文本
      content += text + '\n\n';
    }
  }
  
  // 提取标题
  const title = document.title || '';
  
  // 提取元描述
  const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
  
  // 提取关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
  
  // 提取发布时间
  const publishTime = document.querySelector('time[datetime], .publish-date, .post-date')?.textContent || 
                     document.querySelector('meta[property="article:published_time"]')?.content || '';
  
  // 如果内容过长，截取
  if (content.length > config.maxLength) {
    content = content.substring(0, config.maxLength) + '...';
  }
  
  return {
    title: title,
    url: window.location.href,
    content: content || '未能提取到有效内容',
    meta: {
      description: metaDescription,
      keywords: metaKeywords,
      publishTime: publishTime
    },
    stats: {
      length: content.length,
      wordCount: content.split(/\s+/).length,
      paragraphCount: content.split(/\n\n/).length
    },
    timestamp: new Date().toISOString(),
    config: config
  };
}

// 生成AI摘要（模拟函数）
async function generateAISummary(content, options = {}) {
  // 模拟AI处理延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const length = options.length || 'medium';
  const language = options.language || 'zh-CN';
  
  // 根据长度设置摘要长度
  const lengthMap = {
    short: 100,
    medium: 200,
    long: 400
  };
  
  const targetLength = lengthMap[length] || 200;
  
  // 生成模拟摘要
  const summary = `这是对"${content.title}"的智能摘要。文章讨论了相关主题，提供了有价值的见解和分析。摘要长度为${targetLength}字左右，使用${language}语言生成。`;
  
  // 生成关键要点
  const keyPoints = [
    '文章主要讨论了核心主题和关键问题',
    '提供了重要的数据、统计和事实依据',
    '提出了有见地的观点和分析结论',
    '给出了实用的建议和解决方案',
    '展望了未来的发展趋势和可能影响'
  ].slice(0, options.keyPointsCount || 5);
  
  // 生成标签
  const tags = ['科技', '分析', '总结', '阅读', '效率'].slice(0, options.tagsCount || 3);
  
  return {
    summary: summary,
    keyPoints: keyPoints,
    tags: tags,
    metadata: {
      length: length,
      language: language,
      readingTime: Math.ceil(content.stats.wordCount / 200), // 假设200字/分钟
      generatedAt: new Date().toISOString(),
      model: 'simulated-ai-v1.0'
    },
    stats: {
      originalLength: content.stats.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / content.stats.length * 100).toFixed(1) + '%'
    }
  };
}

// 更新摘要统计
async function updateSummaryStats() {
  const storage = await chrome.storage.local.get(['totalSummaries', 'todaySummaries', 'lastSummaryDate']);
  
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
  await chrome.storage.local.set({
    totalSummaries: totalSummaries,
    todaySummaries: todaySummaries,
    lastSummaryDate: today
  });
  
  return { todaySummaries, totalSummaries };
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // 页面加载完成，可以发送消息给内容脚本
    chrome.tabs.sendMessage(tabId, {
      action: 'pageLoaded',
      url: tab.url
    }).catch(() => {
      // 内容脚本可能未加载，这是正常的
    });
  }
});

console.log('智能网页总结插件后台服务worker已启动');

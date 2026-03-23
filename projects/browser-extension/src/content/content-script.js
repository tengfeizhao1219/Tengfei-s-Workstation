// 内容脚本 - 在网页上下文中运行

console.log('智能网页总结内容脚本已加载');

// 监听来自弹出窗口或后台的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('内容脚本收到消息:', message);
  
  switch (message.action) {
    case 'extractContent':
      // 提取页面内容
      const content = extractPageContent(message.options);
      sendResponse({ success: true, data: content });
      break;
      
    case 'summarizePage':
      // 总结整个页面
      handleSummarizePage(message, sendResponse);
      break;
      
    case 'summarizeSelection':
      // 总结选中文本
      handleSummarizeSelection(message, sendResponse);
      break;
      
    case 'highlightText':
      // 高亮文本
      handleHighlightText(message, sendResponse);
      break;
      
    case 'showSidebar':
      // 显示侧边栏
      handleShowSidebar(message, sendResponse);
      break;
      
    case 'pageLoaded':
      // 页面加载完成
      handlePageLoaded(message, sendResponse);
      break;
      
    default:
      console.warn('内容脚本收到未知消息:', message);
      sendResponse({ success: false, error: '未知操作' });
  }
  
  return true; // 保持消息通道开放
});

// 提取页面内容
function extractPageContent(options = {}) {
  const config = {
    maxLength: options.maxLength || 5000,
    includeImages: options.includeImages || false,
    includeLinks: options.includeLinks || true,
    ...options
  };
  
  try {
    // 尝试获取正文内容
    const article = document.querySelector('article') || 
                   document.querySelector('.post-content') ||
                   document.querySelector('.content') ||
                   document.querySelector('main') ||
                   document.querySelector('[role="main"]') ||
                   document.body;
    
    if (!article) {
      throw new Error('未找到正文内容');
    }
    
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
    
    // 如果内容为空，尝试其他方法
    if (!content.trim()) {
      content = document.body.innerText || '';
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
    
    // 计算统计信息
    const wordCount = content.split(/\s+/).length;
    const paragraphCount = content.split(/\n\n/).length;
    const readingTime = Math.ceil(wordCount / 200); // 假设200字/分钟
    
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
        wordCount: wordCount,
        paragraphCount: paragraphCount,
        readingTime: readingTime
      },
      timestamp: new Date().toISOString(),
      config: config
    };
  } catch (error) {
    console.error('提取页面内容失败:', error);
    return {

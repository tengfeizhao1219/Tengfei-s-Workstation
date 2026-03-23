// 内容脚本 - 完整实现

import { calculateTextStats, extractKeywords } from '../utils/text-utils.js';

// 全局状态
let isSidebarVisible = false;
let sidebarElement = null;
let currentHighlights = [];
let isProcessing = false;

// 初始化
(function init() {
    console.log('智能网页总结内容脚本初始化');
    
    // 监听来自弹出窗口或后台的消息
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // 监听页面变化
    observePageChanges();
    
    // 初始化侧边栏（但不显示）
    initSidebar();
    
    console.log('内容脚本初始化完成');
})();

// 处理消息
function handleMessage(message, sender, sendResponse) {
    console.log('内容脚本收到消息:', message);
    
    const actions = {
        'extractContent': () => handleExtractContent(message, sendResponse),
        'summarizePage': () => handleSummarizePage(message, sendResponse),
        'summarizeSelection': () => handleSummarizeSelection(message, sendResponse),
        'highlightText': () => handleHighlightText(message, sendResponse),
        'showSidebar': () => handleShowSidebar(message, sendResponse),
        'getPageStats': () => handleGetPageStats(message, sendResponse),
        'pageLoaded': () => handlePageLoaded(message, sendResponse)
    };
    
    const action = actions[message.action];
    if (action) {
        return action();
    } else {
        console.warn('未知消息类型:', message.action);
        sendResponse({ success: false, error: '未知操作' });
        return true;
    }
}

// 处理提取内容
function handleExtractContent(message, sendResponse) {
    try {
        const content = extractPageContent(message.options);
        sendResponse({ success: true, data: content });
    } catch (error) {
        console.error('提取内容失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理总结页面
function handleSummarizePage(message, sendResponse) {
    try {
        const content = extractPageContent();
        sendResponse({ 
            success: true, 
            data: {
                content: content,
                extractedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('总结页面失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理总结选中文本
function handleSummarizeSelection(message, sendResponse) {
    try {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (!selectedText) {
            throw new Error('没有选中文本');
        }
        
        const stats = calculateTextStats(selectedText);
        const keywords = extractKeywords(selectedText, 3);
        
        sendResponse({
            success: true,
            data: {
                text: selectedText,
                stats: stats,
                keywords: keywords,
                selectedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('总结选中文本失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理高亮文本
function handleHighlightText(message, sendResponse) {
    try {
        const { text, color = '#FFEB3B' } = message;
        
        // 清除旧的高亮
        clearHighlights();
        
        // 创建新高亮
        const highlights = highlightText(text, color);
        currentHighlights = highlights;
        
        sendResponse({
            success: true,
            data: {
                count: highlights.length,
                highlightedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('高亮文本失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理显示侧边栏
function handleShowSidebar(message, sendResponse) {
    try {
        const { show = true, content } = message;
        
        if (show) {
            showSidebar(content);
        } else {
            hideSidebar();
        }
        
        sendResponse({
            success: true,
            data: {
                visible: show,
                action: show ? 'shown' : 'hidden'
            }
        });
    } catch (error) {
        console.error('显示侧边栏失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理获取页面统计
function handleGetPageStats(message, sendResponse) {
    try {
        const content = extractPageContent({ maxLength: 1000 });
        const stats = calculateTextStats(content.content);
        
        sendResponse({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取页面统计失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 处理页面加载完成
function handlePageLoaded(message, sendResponse) {
    try {
        console.log('页面加载完成:', message.url);
        
        // 可以在这里执行一些页面加载后的初始化
        // 比如检查是否有缓存的摘要要显示
        
        sendResponse({
            success: true,
            data: {
                url: message.url,
                loadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('处理页面加载失败:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true;
}

// 提取页面内容
function extractPageContent(options = {}) {
    const config = {
        maxLength: options.maxLength || 5000,
        includeImages: options.includeImages || false,
        includeLinks: options.includeLinks || true,
        smartContent: options.smartContent !== false,
        filterAds: options.filterAds !== false,
        ...options
    };
    
    try {
        // 智能识别正文内容
        let article = findMainContent();
        
        if (!article && config.smartContent) {
            article = document.body;
        }
        
        if (!article) {
            throw new Error('未找到正文内容');
        }
        
        // 克隆节点以避免修改原DOM
        const clone = article.cloneNode(true);
        
        // 过滤不需要的内容
        filterUnwantedElements(clone, config);
        
        // 提取文本内容
        const content = extractTextContent(clone, config);
        
        // 提取元数据
        const metadata = extractMetadata();
        
        // 计算统计信息
        const stats = calculateTextStats(content);
        
        // 提取关键词
        const keywords = extractKeywords(content, 5);
        
        return {
            title: document.title || '',
            url: window.location.href,
            content: content,
            metadata: metadata,
            stats: stats,
            keywords: keywords,
            extractedAt: new Date().toISOString(),
            config: config
        };
        
    } catch (error) {
        console.error('提取页面内容失败:', error);
        
        // 返回基本内容作为后备
        return {
            title: document.title || '无标题',
            url: window.location.href,
            content: document.body.innerText || '未能提取到有效内容',
            metadata: {},
            stats: { length: 0, wordCount: 0, readingTime: 0 },
            keywords: [],
            extractedAt: new Date().toISOString(),
            config: config,
            error: error.message
        };
    }
}

// 智能识别正文内容
function findMainContent() {
    // 尝试常见的正文选择器
    const selectors = [
        'article',
        'main',
        '[role="main"]',
        '.post-content',
        '.article-content',
        '.content',
        '.entry-content',
        '.post-body',
        '.story-content',
        '.text'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && hasSubstantialText(element)) {
            return element;
        }
    }
    
    // 尝试基于启发式的方法
    return findContentByHeuristics();
}

// 检查元素是否有实质性文本
function hasSubstantialText(element) {
    if (!element) return false;
    
    const text = element.textContent || '';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // 至少要有200个字符才认为是实质性内容
    return cleanText.length > 200;
}

// 基于启发式的方法查找内容
function findContentByHeuristics() {
    // 获取所有可能的内容元素
    const candidates = Array.from(document.querySelectorAll('div, section, p'))
        .filter(el => {
            // 过滤太小或太大的元素
            const text = el.textContent || '';
            const cleanText = text.replace(/\s+/g, ' ').trim();
            return cleanText.length > 200 && cleanText.length < 10000;
        })
        .filter(el => {
            // 过滤可能不是正文的元素
            const className = el.className || '';
            const id = el.id || '';
            
            // 排除常见非正文类名
            const nonContentPatterns = [
                /nav/i, /menu/i, /sidebar/i, /footer/i, /header/i,
                /ad/i, /banner/i, /widget/i, /comment/i, /related/i
            ];
            
            return !nonContentPatterns.some(pattern => 
                pattern.test(className) || pattern.test(id)
            );
        });
    
    if (candidates.length === 0) {
        return null;
    }
    
    // 选择文本最长的候选元素
    return candidates.reduce((longest, current) => {
        const longestText = longest.textContent || '';
        const currentText = current.textContent || '';
        return currentText.length > longestText.length ? current : longest;
    });
}

// 过滤不需要的元素
function filterUnwantedElements(element, config) {
    const selectors = [
        'script',
        'style',
        'noscript',
        'iframe',
        'object',
        'embed',
        'nav',
        'footer',
        'header',
        'aside'
    ];
    
    // 添加广告过滤
    if (config.filterAds) {
        selectors.push(
            '.ad',
            '.advertisement',
            '[class*="ad-"]',
            '[id*="ad-"]',
            '.banner',
            '.sponsor',
            '.promo'
        );
    }
    
    // 添加社交媒体和分享按钮
    selectors.push(
        '.social',
        '.share',
        '.like',
        '.comment',
        '.related',
        '.recommend'
    );
    
    selectors.forEach(selector => {
        const elements = element.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
}

// 提取文本内容
function extractTextContent(element, config) {
    let content = '';
    
    // 使用TreeWalker遍历文本节点
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过脚本和样式内容
                if (node.parentNode.nodeName === 'SCRIPT' || 
                    node.parentNode.nodeName === 'STYLE') {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // 检查文本是否实质性
                const text = node.textContent || '';
                const cleanText = text.replace(/\s+/g, ' ').trim();
                
                if (cleanText.length < 10) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        const text = node.textContent || '';
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        if (cleanText) {
            content += cleanText + '\n\n';
        }
    }
    
    // 如果内容为空，使用innerText作为后备
    if (!content.trim()) {
        content = element.innerText || '';
    }
    
    // 清理内容
    content = content
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    
    // 限制长度
    if (content.length > config.maxLength) {
        content = content.substring(0, config.maxLength) + '...';
    }
    
    return content;
}

// 提取元数据
function extractMetadata() {
    const metadata = {
        description: '',
        keywords: '',
        author: '',
        publishTime: '',
        siteName: ''
    };
    
    // 提取meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metadata.description = metaDescription.content || '';
    }
    
    // 提取meta关键词
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metadata.keywords = metaKeywords.content || '';
    }
    
    // 提取作者
    const metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor) {
        metadata.author = metaAuthor.content || '';
    }
    
    // 提取发布时间
    const metaPublishTime = document.querySelector('meta[property="article:published_time"]');
    if (metaPublishTime) {
        metadata.publishTime = metaPublishTime.content || '';
    }
    
    // 提取网站名称
    const metaSiteName = document.querySelector('meta[property="og:site_name"]');
    if (metaSiteName) {
        metadata.siteName = metaSiteName.content || '';
    }
    
    return metadata;
}

// 初始化侧边栏
function initSidebar() {
    if (sidebarElement) return;
    
    sidebarElement = document.createElement('div');
    sidebarElement.className = 'smart-summary-sidebar';
    sidebarElement.innerHTML = `
        <div class="smart-summary-sidebar-header">
            <h3>
                <i class="fas fa-file-contract"></i>
                智能网页总结
            </h3>
            <button class="smart-summary-close-btn" title="关闭侧边栏">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="smart-summary-content">
            <div class="smart-summary-loading" id="sidebarLoading">
                <div class="smart-summary-loading-spinner"></div>
                <div class="smart-summary-loading-text">正在加载...</div>
            </div>
            <div class="smart-summary-result" id="sidebarResult" style="display: none;">
                <!-- 摘要内容将在这里显示 -->
            </div>
        </div>
    `;
    
    // 添加关闭按钮事件
    const closeBtn = sidebarElement.querySelector('.smart-summary-close-btn');
    closeBtn.addEventListener('click', () => {
        hideSidebar();
    });
    
    // 添加到页面
    document.body.appendChild(sidebarElement);
    
    // 添加样式
    addSidebarStyles();
}

// 添加侧边栏样式
function addSidebarStyles() {
    if (document.querySelector('#smart-summary-sidebar-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'smart-summary-sidebar-styles';
    style.textContent = `
        .smart-summary-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .smart-summary-sidebar.collapsed {
            transform: translateX(100%);
        }
        
        .smart-summary-sidebar-header {
            padding: 16px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .smart-summary-sidebar-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .smart-summary-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }
        
        .smart-summary-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .smart-summary-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .smart-summary-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .smart-summary-loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;

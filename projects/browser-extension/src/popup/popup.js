// 弹出窗口主JavaScript文件 - 完整实现

import { getSummaryStats, saveSummaryToHistory, getSummaryHistory } from '../utils/storage-utils.js';
import { calculateTextStats, formatDate } from '../utils/text-utils.js';

// 全局状态
let currentPageInfo = null;
let currentSummary = null;
let isLoading = false;

// DOM元素
let elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('智能网页总结插件弹出窗口初始化');
    
    // 初始化DOM元素
    initializeElements();
    
    // 初始化事件监听器
    initializeEventListeners();
    
    // 加载页面信息和统计数据
    await initializePageInfo();
    await initializeStats();
    
    // 检查是否有缓存的摘要
    await checkCachedSummary();
    
    console.log('弹出窗口初始化完成');
});

// 初始化DOM元素
function initializeElements() {
    elements = {
        // 按钮
        summarizeBtn: document.getElementById('summarizeBtn'),
        quickSummaryBtn: document.getElementById('quickSummaryBtn'),
        viewHistoryBtn: document.getElementById('viewHistoryBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        helpBtn: document.getElementById('helpBtn'),
        copySummaryBtn: document.getElementById('copySummaryBtn'),
        saveSummaryBtn: document.getElementById('saveSummaryBtn'),
        exportSummaryBtn: document.getElementById('exportSummaryBtn'),
        shareSummaryBtn: document.getElementById('shareSummaryBtn'),
        refreshSummaryBtn: document.getElementById('refreshSummaryBtn'),
        
        // 内容区域
        pageTitle: document.getElementById('pageTitle'),
        pageUrl: document.getElementById('pageUrl'),
        wordCount: document.getElementById('wordCount'),
        readingTime: document.getElementById('readingTime'),
        summaryResult: document.getElementById('summaryResult'),
        summaryContent: document.getElementById('summaryContent'),
        summaryLength: document.getElementById('summaryLength'),
        summaryTime: document.getElementById('summaryTime'),
        keyPoints: document.getElementById('keyPoints'),
        pointsList: document.getElementById('pointsList'),
        loading: document.getElementById('loading'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        
        // 统计
        todayCount: document.getElementById('todayCount'),
        totalCount: document.getElementById('totalCount'),
        
        // 状态指示器
        statusIndicator: document.getElementById('statusIndicator'),
        statusDot: document.querySelector('.status-dot'),
        statusText: document.querySelector('.status-text')
    };
}

// 初始化事件监听器
function initializeEventListeners() {
    // 主要功能按钮
    elements.summarizeBtn.addEventListener('click', handleSummarize);
    elements.quickSummaryBtn.addEventListener('click', handleQuickSummary);
    elements.viewHistoryBtn.addEventListener('click', handleViewHistory);
    elements.settingsBtn.addEventListener('click', handleSettings);
    elements.helpBtn.addEventListener('click', handleHelp);
    
    // 摘要操作按钮
    elements.copySummaryBtn.addEventListener('click', handleCopySummary);
    elements.saveSummaryBtn.addEventListener('click', handleSaveSummary);
    elements.exportSummaryBtn.addEventListener('click', handleExportSummary);
    elements.shareSummaryBtn.addEventListener('click', handleShareSummary);
    elements.refreshSummaryBtn.addEventListener('click', handleRefreshSummary);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 初始化页面信息
async function initializePageInfo() {
    try {
        // 获取当前标签页信息
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab) {
            currentPageInfo = {
                title: tab.title || '无标题',
                url: tab.url || '',
                id: tab.id
            };
            
            // 更新UI
            elements.pageTitle.textContent = currentPageInfo.title;
            elements.pageUrl.textContent = currentPageInfo.url ? new URL(currentPageInfo.url).hostname : '未知网站';
            
            // 获取页面内容统计
            await updatePageStats();
            
            updateStatus('就绪', 'active');
        } else {
            elements.pageTitle.textContent = '未找到活动标签页';
            updateStatus('错误', 'error');
        }
    } catch (error) {
        console.error('初始化页面信息失败:', error);
        elements.pageTitle.textContent = '获取失败';
        updateStatus('错误', 'error');
    }
}

// 更新页面统计
async function updatePageStats() {
    try {
        // 发送消息给内容脚本获取页面统计
        const response = await chrome.tabs.sendMessage(currentPageInfo.id, {
            action: 'getPageStats'
        });
        
        if (response && response.success) {
            const stats = response.data;
            elements.wordCount.textContent = stats.wordCount || 0;
            elements.readingTime.textContent = stats.readingTime || 0;
        }
    } catch (error) {
        // 内容脚本可能未加载，使用默认值
        console.log('获取页面统计失败，使用默认值:', error);
        elements.wordCount.textContent = '0';
        elements.readingTime.textContent = '0';
    }
}

// 初始化统计数据
async function initializeStats() {
    try {
        const stats = await getSummaryStats();
        elements.todayCount.textContent = stats.todaySummaries || 0;
        elements.totalCount.textContent = stats.totalSummaries || 0;
    } catch (error) {
        console.error('初始化统计数据失败:', error);
        elements.todayCount.textContent = '0';
        elements.totalCount.textContent = '0';
    }
}

// 检查缓存的摘要
async function checkCachedSummary() {
    try {
        // 从存储中获取当前页面的缓存摘要
        const storage = await chrome.storage.local.get(['cachedSummaries']);
        const cachedSummaries = storage.cachedSummaries || {};
        
        const cacheKey = currentPageInfo.url;
        if (cachedSummaries[cacheKey]) {
            const cached = cachedSummaries[cacheKey];
            const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
            
            // 如果缓存小于1小时，显示缓存摘要
            if (cacheAge < 3600000) {
                displayCachedSummary(cached);
            }
        }
    } catch (error) {
        console.error('检查缓存摘要失败:', error);
    }
}

// 显示缓存的摘要
function displayCachedSummary(cached) {
    elements.summaryResult.style.display = 'block';
    elements.summaryLength.textContent = cached.length || '中等';
    elements.summaryTime.textContent = '缓存';
    
    const html = `
        <div class="summary-text">${cached.summary}</div>
        <div class="cache-notice">
            <i class="fas fa-info-circle"></i>
            这是缓存的摘要，生成于 ${formatDate(cached.timestamp, 'HH:mm')}
        </div>
    `;
    
    elements.summaryContent.innerHTML = html;
}

// 更新状态指示器
function updateStatus(text, type = 'active') {
    if (elements.statusText) {
        elements.statusText.textContent = text;
    }
    
    if (elements.statusDot) {
        elements.statusDot.className = 'status-dot';
        elements.statusDot.classList.add(type);
    }
    
    if (elements.statusIndicator) {
        const types = {
            active: 'active',
            loading: 'loading',
            error: 'error',
            warning: 'warning'
        };
        
        elements.statusIndicator.className = 'status-indicator';
        elements.statusIndicator.classList.add(types[type] || 'active');
    }
}

// 处理生成摘要
async function handleSummarize() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        updateStatus('分析中', 'loading');
        showLoading(true);
        hideSummary();
        
        // 获取页面内容
        const pageContent = await getPageContent();
        if (!pageContent) {
            throw new Error('未能获取页面内容');
        }
        
        // 模拟进度
        simulateProgress();
        
        // 生成摘要
        const summary = await generateSummary(pageContent);
        
        // 显示摘要
        displaySummary(summary);
        
        // 缓存摘要
        await cacheSummary(summary);
        
        // 更新统计
        await updateStats();
        
        updateStatus('完成', 'active');
        
    } catch (error) {
        console.error('生成摘要失败:', error);
        displayError('生成摘要失败: ' + error.message);
        updateStatus('错误', 'error');
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

// 处理快速总结
async function handleQuickSummary() {
    // 快速总结使用更短的配置
    const originalText = elements.summarizeBtn.innerHTML;
    elements.summarizeBtn.innerHTML = '<i class="fas fa-bolt"></i><span>快速生成中...</span>';
    elements.summarizeBtn.disabled = true;
    
    try {
        // 快速总结逻辑
        await handleSummarize();
    } finally {
        elements.summarizeBtn.innerHTML = originalText;
        elements.summarizeBtn.disabled = false;
    }
}

// 处理查看历史
async function handleViewHistory() {
    try {
        // 打开历史记录页面
        chrome.tabs.create({
            url: chrome.runtime.getURL('src/options/options.html#history')
        });
    } catch (error) {
        console.error('打开历史记录失败:', error);
        alert('打开历史记录失败: ' + error.message);
    }
}

// 处理设置
async function handleSettings() {
    try {
        // 打开设置页面
        chrome.tabs.create({
            url: chrome.runtime.getURL('src/options/options.html')
        });
    } catch (error) {
        console.error('打开设置失败:', error);
        alert('打开设置失败: ' + error.message);
    }
}

// 处理帮助
async function handleHelp() {
    try {
        // 打开帮助文档
        chrome.tabs.create({
            url: 'https://github.com/tengfeizhao1219/Tengfei-s-Workstation/tree/main/projects/browser-extension/docs/user'
        });
    } catch (error) {
        console.error('打开帮助失败:', error);
        alert('打开帮助失败: ' + error.message);
    }
}

// 处理复制摘要
async function handleCopySummary() {
    try {
        const summaryText = elements.summaryContent.querySelector('.summary-text')?.textContent;
        if (!summaryText) {
            throw new Error('没有可复制的摘要内容');
        }
        
        await navigator.clipboard.writeText(summaryText);
        
        // 显示成功提示
        showToast('摘要已复制到剪贴板');
    } catch (error) {
        console.error('复制摘要失败:', error);
        showToast('复制失败: ' + error.message, 'error');
    }
}

// 处理保存摘要
async function handleSaveSummary() {
    try {
        if (!currentSummary) {
            throw new Error('没有可保存的摘要');
        }
        
        const saved = await saveSummaryToHistory(currentSummary.summary, {
            title: currentPageInfo.title,
            url: currentPageInfo.url,
            length: currentSummary.metadata.length,
            readingTime: currentSummary.metadata.readingTime
        });
        
        showToast('摘要已保存到历史记录');
        
        // 更新统计
        await initializeStats();
        
    } catch (error) {
        console.error('保存摘要失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

// 处理导出摘要
async function handleExportSummary() {
    try {
        if (!currentSummary) {
            throw new Error('没有可导出的摘要');
        }
        
        const exportData = {
            summary: currentSummary.summary,
            keyPoints: currentSummary.keyPoints,
            metadata: {
                ...currentSummary.metadata,
                exportedAt: new Date().toISOString(),
                source: {
                    title: currentPageInfo.title,
                    url: currentPageInfo.url
                }
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('摘要已导出为JSON文件');
        
    } catch (error) {
        console.error('导出摘要失败:', error);
        showToast('导出失败: ' + error.message, 'error');
    }
}

// 处理分享摘要
async function handleShareSummary() {
    try {
        if (!currentSummary) {
            throw new Error('没有可分享的摘要');
        }
        
        const shareText = `📚 网页摘要: ${currentPageInfo.title}\n\n${currentSummary.summary}\n\n关键要点:\n${currentSummary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n来源: ${currentPageInfo.url}`;
        
        if (navigator.share) {
            await navigator.share({
                title: `摘要: ${currentPageInfo.title}`,
                text: shareText,
                url: currentPageInfo.url
            });
        } else {
            await navigator.clipboard.writeText(shareText);
            showToast('摘要已复制，可以粘贴分享');
        }
        
    } catch (error) {
        console.error('分享摘要失败:', error);
        showToast('分享失败: ' + error.message, 'error');
    }
}

// 处理重新生成摘要
async function handleRefreshSummary() {
    await handleSummarize();
}

// 处理键盘快捷键
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S: 生成摘要
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSummarize();
    }
    
    // Ctrl/Cmd + H: 查看历史
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault();
        handleViewHistory();
    }
    
    // Ctrl/Cmd + C: 复制摘要
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && currentSummary) {
        event.preventDefault();
        handleCopySummary();
    }
}

// 获取页面内容
async function getPageContent() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getPageContent',
            options: {
                maxLength: 3000,
                includeLinks: false
            }
        });
        
        if (response && response.success) {
            return response.data;
        } else {
            throw new Error(response?.error || '未知错误');
        }
    } catch (error) {
        console.error('获取页面内容失败:', error);
        throw error;
    }
}

// 生成摘要
async function generateSummary(pageContent) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'generateSummary',
            content: pageContent,
            options: {
                length: 'medium',
                language: 'zh-CN',
                keyPointsCount: 5
            }
        });
        
        if (response && response.success) {
            return response.data;
        } else {
            throw new Error(response?.error || '未知错误');
        }
    } catch (error) {
        console.error('生成摘要失败:', error);
        throw error;
    }
}

// 显示摘要
function displaySummary(summary) {
    currentSummary = summary;
    
    elements.summaryResult.style.display = 'block';
    elements.summaryLength.textContent = summary.metadata.length || '中等';
    elements.summaryTime.textContent = formatDate(summary.metadata.generatedAt, 'HH:mm');
    
    const html = `
        <div class="summary-text">${summary.summary}</div>
        
        <div class="key-points-section">
            <h4><i class="fas fa-bullseye"></i> 关键要点:</h4>
            <div class="points-grid">
                ${summary.keyPoints.map((point, index) => `
                    <div class="point-card">
                        <div class="point-number">${index + 1}</div>
                        <div class="point-text">${point}</div>
                    </div>

// 选项页面JavaScript - 完整实现

import { 
    getStorage, 
    setStorage, 
    getAllStorage,
    getSummaryHistory,
    clearSummaryHistory,
    exportHistoryToJSON,
    importHistoryFromJSON
} from '../utils/storage-utils.js';

// 全局状态
let currentSettings = {};
let isInitialized = false;

// DOM元素
let elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('选项页面初始化');
    
    // 初始化DOM元素
    initializeElements();
    
    // 初始化事件监听器
    initializeEventListeners();
    
    // 加载设置
    await loadSettings();
    
    // 根据URL哈希显示对应标签页
    handleHashChange();
    
    // 监听哈希变化
    window.addEventListener('hashchange', handleHashChange);
    
    isInitialized = true;
    console.log('选项页面初始化完成');
});

// 初始化DOM元素
function initializeElements() {
    // 标签页按钮
    elements.tabBtns = document.querySelectorAll('.tab-btn');
    
    // 常规设置
    elements.themeSelect = document.getElementById('themeSelect');
    elements.popupSizeSelect = document.getElementById('popupSizeSelect');
    elements.showSidebarToggle = document.getElementById('showSidebarToggle');
    elements.autoSaveToggle = document.getElementById('autoSaveToggle');
    elements.contextMenuToggle = document.getElementById('contextMenuToggle');
    elements.keyboardShortcutsToggle = document.getElementById('keyboardShortcutsToggle');
    elements.historyLimitSelect = document.getElementById('historyLimitSelect');
    elements.autoCleanupToggle = document.getElementById('autoCleanupToggle');
    elements.clearCacheBtn = document.getElementById('clearCacheBtn');
    elements.exportDataBtn = document.getElementById('exportDataBtn');
    elements.importDataBtn = document.getElementById('importDataBtn');
    
    // 摘要设置
    elements.summaryLengthSelect = document.getElementById('summaryLengthSelect');
    elements.keyPointsCountSelect = document.getElementById('keyPointsCountSelect');
    elements.languageSelect = document.getElementById('languageSelect');
    elements.maxTextLengthSelect = document.getElementById('maxTextLengthSelect');
    elements.smartContentToggle = document.getElementById('smartContentToggle');
    elements.filterAdsToggle = document.getElementById('filterAdsToggle');
    elements.aiModelSelect = document.getElementById('aiModelSelect');
    
    // 历史记录
    elements.historyList = document.getElementById('historyList');
    elements.historySearch = document.getElementById('historySearch');
    elements.historyFilter = document.getElementById('historyFilter');
    elements.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    elements.exportHistoryBtn = document.getElementById('exportHistoryBtn');
    elements.loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // 关于页面
    elements.versionInfo = document.getElementById('versionInfo');
    elements.checkUpdateBtn = document.getElementById('checkUpdateBtn');
    elements.reportIssueBtn = document.getElementById('reportIssueBtn');
    elements.viewDocsBtn = document.getElementById('viewDocsBtn');
    
    // 通用按钮
    elements.backBtn = document.getElementById('backBtn');
    elements.saveBtn = document.getElementById('saveBtn');
    elements.resetBtn = document.getElementById('resetBtn');
}

// 初始化事件监听器
function initializeEventListeners() {
    // 标签页切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // 常规设置事件
    if (elements.clearCacheBtn) {
        elements.clearCacheBtn.addEventListener('click', handleClearCache);
    }
    
    if (elements.exportDataBtn) {
        elements.exportDataBtn.addEventListener('click', handleExportData);
    }
    
    if (elements.importDataBtn) {
        elements.importDataBtn.addEventListener('click', handleImportData);
    }
    
    // 历史记录事件
    if (elements.historySearch) {
        elements.historySearch.addEventListener('input', handleHistorySearch);
    }
    
    if (elements.historyFilter) {
        elements.historyFilter.addEventListener('change', handleHistoryFilter);
    }
    
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', handleClearHistory);
    }
    
    if (elements.exportHistoryBtn) {
        elements.exportHistoryBtn.addEventListener('click', handleExportHistory);
    }
    
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', handleLoadMoreHistory);
    }
    
    // 关于页面事件
    if (elements.checkUpdateBtn) {
        elements.checkUpdateBtn.addEventListener('click', handleCheckUpdate);
    }
    
    if (elements.reportIssueBtn) {
        elements.reportIssueBtn.addEventListener('click', handleReportIssue);
    }
    
    if (elements.viewDocsBtn) {
        elements.viewDocsBtn.addEventListener('click', handleViewDocs);
    }
    
    // 通用按钮事件
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', handleBack);
    }
    
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', handleSaveSettings);
    }
    
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', handleResetSettings);
    }
    
    // 设置变更监听
    document.querySelectorAll('.form-select, .switch input').forEach(element => {
        element.addEventListener('change', handleSettingChange);
    });
}

// 加载设置
async function loadSettings() {
    try {
        const storage = await getStorage(['settings', 'summaryHistory']);
        
        // 加载设置
        currentSettings = storage.settings || getDefaultSettings();
        
        // 更新UI
        updateSettingsUI();
        
        // 加载历史记录（如果当前是历史标签页）
        if (window.location.hash === '#history') {
            await loadHistory();
        }
        
        // 更新关于信息
        updateAboutInfo();
        
    } catch (error) {
        console.error('加载设置失败:', error);
        showToast('加载设置失败: ' + error.message, 'error');
    }
}

// 获取默认设置
function getDefaultSettings() {
    return {
        // 常规设置
        theme: 'auto',
        popupSize: 'medium',
        showSidebar: true,
        autoSave: true,
        contextMenu: true,
        keyboardShortcuts: true,
        historyLimit: 100,
        autoCleanup: true,
        
        // 摘要设置
        summaryLength: 'medium',
        keyPointsCount: 5,
        language: 'zh-CN',
        maxTextLength: 3000,
        smartContent: true,
        filterAds: true,
        aiModel: 'simulated',
        
        // 其他设置
        version: '0.1.0',
        lastUpdated: new Date().toISOString()
    };
}

// 更新设置UI
function updateSettingsUI() {
    if (!isInitialized) return;
    
    // 常规设置
    if (elements.themeSelect) {
        elements.themeSelect.value = currentSettings.theme || 'auto';
    }
    
    if (elements.popupSizeSelect) {
        elements.popupSizeSelect.value = currentSettings.popupSize || 'medium';
    }
    
    if (elements.showSidebarToggle) {
        elements.showSidebarToggle.checked = currentSettings.showSidebar !== false;
    }
    
    if (elements.autoSaveToggle) {
        elements.autoSaveToggle.checked = currentSettings.autoSave !== false;
    }
    
    if (elements.contextMenuToggle) {
        elements.contextMenuToggle.checked = currentSettings.contextMenu !== false;
    }
    
    if (elements.keyboardShortcutsToggle) {
        elements.keyboardShortcutsToggle.checked = currentSettings.keyboardShortcuts !== false;
    }
    
    if (elements.historyLimitSelect) {
        elements.historyLimitSelect.value = currentSettings.historyLimit || 100;
    }
    
    if (elements.autoCleanupToggle) {
        elements.autoCleanupToggle.checked = currentSettings.autoCleanup !== false;
    }
    
    // 摘要设置
    if (elements.summaryLengthSelect) {
        elements.summaryLengthSelect.value = currentSettings.summaryLength || 'medium';
    }
    
    if (elements.keyPointsCountSelect) {
        elements.keyPointsCountSelect.value = currentSettings.keyPointsCount || 5;
    }
    
    if (elements.languageSelect) {
        elements.languageSelect.value = currentSettings.language || 'zh-CN';
    }
    
    if (elements.maxTextLengthSelect) {
        elements.maxTextLengthSelect.value = currentSettings.maxTextLength || 3000;
    }
    
    if (elements.smartContentToggle) {
        elements.smartContentToggle.checked = currentSettings.smartContent !== false;
    }
    
    if (elements.filterAdsToggle) {
        elements.filterAdsToggle.checked = currentSettings.filterAds !== false;
    }
    
    if (elements.aiModelSelect) {
        elements.aiModelSelect.value = currentSettings.aiModel || 'simulated';
    }
}

// 处理哈希变化
function handleHashChange() {
    const hash = window.location.hash.substring(1) || 'general';
    switchTab(hash);
}

// 切换标签页
function switchTab(tabId) {
    // 更新标签页按钮状态
    elements.tabBtns.forEach(btn => {
        const btnTabId = btn.getAttribute('data-tab');
        if (btnTabId === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 更新标签页内容
    document.querySelectorAll('.tab-content').forEach(content => {
        const contentTabId = content.id.replace('-tab', '');
        if (contentTabId === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // 更新URL哈希
    window.location.hash = tabId;
    
    // 如果是历史标签页，加载历史记录
    if (tabId === 'history') {
        loadHistory();
    }
}

// 处理设置变更
function handleSettingChange() {
    // 标记设置已修改
    document.querySelector('.save-btn')?.classList.add('visible');
}

// 处理清理缓存
async function handleClearCache() {
    if (!confirm('确定要清理所有缓存数据吗？这不会删除历史记录。')) {
        return;
    }
    
    try {
        await setStorage({
            cachedSummaries: {},
            todaySummaries: 0,
            lastSummaryDate: new Date().toDateString()
        });
        
        showToast('缓存已清理');
    } catch (error) {
        console.error('清理缓存失败:', error);
        showToast('清理缓存失败: ' + error.message, 'error');
    }
}

// 处理导出数据
async function handleExportData() {
    try {
        const allData = await getAllStorage();
        
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: allData.settings || {},
            summaryHistory: allData.summaryHistory || [],
            stats: {
                totalSummaries: allData.totalSummaries || 0,
                todaySummaries: allData.todaySummaries || 0
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-summary-backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('数据已导出为JSON文件');
        
    } catch (error) {

import { apiTest } from './services/apiTest';

// 检查是否需要运行每日测试
async function checkAndRunDailyTest() {
  try {
    // 获取上次测试日期
    const { lastTestDate } = await chrome.storage.local.get('lastTestDate');
    const today = new Date().toISOString().split('T')[0];
    
    // 如果今天还没有运行测试，则运行
    if (lastTestDate !== today) {
      console.log('Running daily API test...');
      await apiTest.runDailyTest();
      await chrome.storage.local.set({ lastTestDate: today });
    }
  } catch (error) {
    console.error('Error in daily test:', error);
  }
}

// 扩展安装或更新时运行
chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.local.set({
    apiTestLogs: [],
    lastTestDate: null
  });
});

// 每天检查一次
chrome.alarms.create('dailyApiTest', {
  periodInMinutes: 24 * 60 // 24小时
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyApiTest') {
    checkAndRunDailyTest();
  }
});

// 立即运行一次检查
checkAndRunDailyTest(); 
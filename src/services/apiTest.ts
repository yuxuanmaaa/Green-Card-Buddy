import { realUscisService } from './realUscisService';

// 定义测试日志的类型
interface TestLog {
  date: string;
  connectionTest: boolean;
  queryResults: {
    success: number;
    error: number;
    total: number;
    responseCodes: {
      '200': number;
      '400': number;
      '401': number;
      '404': number;
      '429': number;
      '503': number;
    };
  };
  timestamp: string;
}

// 测试用例收据号列表
const TEST_RECEIPT_NUMBERS = [
  // 200 成功响应 - 使用有效的收据号格式
  'IOE1234567890', // 有效的收据号格式，应该返回200
  
  // 400 错误响应
  'IOE123456',     // 格式不完整，应该返回400
  'IOE123456789',  // 格式不完整，应该返回400
  
  // 404 错误响应
  'IOE0000000000', // 不存在的收据号，应该返回404
  'IOE9999999999', // 不存在的收据号，应该返回404
  
  // 401 错误响应 - 通过临时移除token来测试
  'IOE1234567890', // 使用无效token测试，应该返回401
  
  // 503 错误响应 - 在非工作时间测试
  'IOE1234567890', // 在非工作时间测试，应该返回503
];

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 测试API连接
async function testApiConnection() {
  console.log('Testing API connection...');
  try {
    const result = await realUscisService.testConnection();
    console.log('Connection test result:', result);
    return result.success;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// 测试案件状态查询
async function testCaseStatusQueries() {
  console.log('Testing case status queries...');
  const results = {
    success: 0,
    error: 0,
    total: TEST_RECEIPT_NUMBERS.length,
    responseCodes: {
      '200': 0,
      '400': 0,
      '401': 0,
      '404': 0,
      '429': 0,
      '503': 0
    }
  };

  // 保存原始token
  const originalToken = realUscisService.getCurrentToken();
  
  for (const receiptNumber of TEST_RECEIPT_NUMBERS) {
    try {
      // 在每次请求之间添加延迟，避免触发速率限制
      await delay(1000); // 1秒延迟

      // 对于401测试，临时移除token
      if (receiptNumber === 'IOE1234567890' && results.responseCodes['401'] === 0) {
        realUscisService.clearCurrentToken();
      }
      
      const status = await realUscisService.fetchCaseStatus(receiptNumber);
      console.log(`Success for ${receiptNumber}:`, status);
      results.success++;
      results.responseCodes['200']++;
    } catch (error: any) {
      console.error(`Error for ${receiptNumber}:`, error);
      results.error++;
      
      // 记录错误响应码
      if (error && error.status) {
        const statusCode = error.status.toString();
        if (statusCode in results.responseCodes) {
          results.responseCodes[statusCode as keyof typeof results.responseCodes]++;
        }
      } else if (error.message && error.message.includes('rate limit')) {
        // 处理速率限制错误
        results.responseCodes['429'] = (results.responseCodes['429'] || 0) + 1;
        // 如果遇到速率限制，等待更长时间
        await delay(2000); // 2秒延迟
      }
    }
  }

  // 恢复原始token
  if (originalToken) {
    realUscisService.setCurrentToken(originalToken);
  }

  return results;
}

// 运行每日测试
async function runDailyTest() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`Running daily test for ${date}...`);

  const connectionTest = await testApiConnection();
  if (!connectionTest) {
    console.error('API connection test failed, aborting daily test');
    return false;
  }

  // 在连接测试和查询测试之间添加延迟
  await delay(1000);

  const queryResults = await testCaseStatusQueries();
  console.log('Daily test results:', queryResults);

  // 记录测试结果
  const validLog: TestLog = {
    date,
    connectionTest,
    queryResults: {
      success: queryResults.success,
      error: queryResults.error,
      total: queryResults.total,
      responseCodes: {
        '200': queryResults.responseCodes['200'] || 0,
        '400': queryResults.responseCodes['400'] || 0,
        '401': queryResults.responseCodes['401'] || 0,
        '404': queryResults.responseCodes['404'] || 0,
        '429': queryResults.responseCodes['429'] || 0,
        '503': queryResults.responseCodes['503'] || 0
      }
    },
    timestamp: new Date().toISOString()
  };

  // 保存测试日志
  try {
    console.log('Starting to save test log...');
    const logs = await chrome.storage.local.get('apiTestLogs');
    console.log('Current logs in storage:', logs);
    
    const apiTestLogs: TestLog[] = Array.isArray(logs.apiTestLogs) ? logs.apiTestLogs : [];
    console.log('Current apiTestLogs array:', apiTestLogs);
    
    console.log('New test log to be saved:', validLog);
    apiTestLogs.push(validLog);
    
    await chrome.storage.local.set({ apiTestLogs });
    console.log('Test log saved successfully. New logs array:', apiTestLogs);
    
    // 验证保存是否成功
    const verifyLogs = await chrome.storage.local.get('apiTestLogs');
    console.log('Verification - logs in storage after save:', verifyLogs);
  } catch (error) {
    console.error('Failed to save test log:', error);
  }

  return true;
}

// 检查是否满足生产环境要求
async function checkProductionRequirements() {
  try {
    const logs = await chrome.storage.local.get('apiTestLogs');
    const apiTestLogs: TestLog[] = logs.apiTestLogs || [];
    
    // 检查是否有至少5天的测试记录
    const uniqueDates = new Set(apiTestLogs.map((log: TestLog) => log.date));
    const hasFiveDays = uniqueDates.size >= 5;
    
    // 检查是否有成功和错误响应
    const hasSuccessAndErrors = apiTestLogs.some((log: TestLog) => 
      log.queryResults.success > 0 && log.queryResults.error > 0
    );

    return {
      hasFiveDays,
      hasSuccessAndErrors,
      totalDays: uniqueDates.size,
      lastTestDate: apiTestLogs[apiTestLogs.length - 1]?.date || null
    };
  } catch (error) {
    console.error('Failed to check requirements:', error);
    return {
      hasFiveDays: false,
      hasSuccessAndErrors: false,
      totalDays: 0,
      lastTestDate: null
    };
  }
}

// 导出测试函数
export const apiTest = {
  runDailyTest,
  checkProductionRequirements,
  testApiConnection,
  testCaseStatusQueries
}; 
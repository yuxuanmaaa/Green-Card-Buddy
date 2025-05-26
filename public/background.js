// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.type === 'SHOW_NOTIFICATION') {
    console.log('Creating notification with:', request);
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icon48.png',  // 添加前导斜杠
      title: request.title,
      message: request.message,
      priority: 2
    }, (notificationId) => {
      console.log('Notification created with ID:', notificationId);
      sendResponse({ success: true, notificationId });
    });
    
    return true; // 保持消息通道开放
  }
}); 
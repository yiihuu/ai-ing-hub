// AI 会话中枢 —— 后台 service worker（最小实现）
chrome.runtime.onInstalled.addListener(() => {
  console.log('[会话中枢] 捕获扩展已安装');
});

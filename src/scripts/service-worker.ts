// service-worker.ts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "export_captions" && message.data) {
    const blob = new Blob([JSON.stringify(message.data, null, 2)], { type: 'application/json' });
    
    // BlobをData URLに変換します。
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        const dataUrl = event.target.result as string;

        chrome.downloads.download({
          url: dataUrl,
          filename: 'captions.json',
          saveAs: true // ユーザーに保存場所を指定させる場合
        }, (downloadId) => {
          // ダウンロードIDをチェックするなど、必要に応じて処理を行います。
          if (downloadId) {
            console.log(`Download started with ID: ${downloadId}`);
            sendResponse({ success: true });
          } else if (chrome.runtime.lastError) {
            // エラーハンドリング
            console.error(chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          }
        });
      }
    };
    
    // Data URLへの変換を開始します
    reader.readAsDataURL(blob);

    // 非同期レスポンスを返す場合は true を返します
    return true;
  }
});

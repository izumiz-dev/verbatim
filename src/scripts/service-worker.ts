// service-worker.ts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "export_captions" && message.data) {
    const formattedText = formatCaptions(message.data);
    const blob = new Blob([formattedText], { type: 'text/plain' });

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        const dataUrl = event.target.result as string;

        chrome.downloads.download({
          url: dataUrl,
          filename: 'captions.txt',
          saveAs: true
        }, (downloadId) => {
          if (downloadId) {
            console.log(`ダウンロードが開始されました。ID: ${downloadId}`);
            sendResponse({ success: true });
          } else if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          }
        });
      }
    };

    reader.readAsDataURL(blob);
    return true;
  }
});

function formatCaptions(captions: any[]): string {
  let formattedText = '';
  let currentUser = '';

  captions.forEach((caption) => {
    if (caption.userName !== currentUser) {
      currentUser = caption.userName;
      formattedText += `\n${currentUser}:\n`;
    }
    formattedText += `[${formatTime(caption.timeStamp)}] ${caption.text}\n`;
  });

  return formattedText.trim();
}

function formatTime(timeStamp: string): string {
  const date = new Date(timeStamp);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

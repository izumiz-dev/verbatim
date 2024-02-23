// content-script.ts
interface CaptionData {
  userName: string;
  timeStamp: string;  // 時刻のみの文字列
  text: string;
}

interface InternalCaptionData extends CaptionData {
  element: HTMLSpanElement;
}

const captions: InternalCaptionData[] = [];
const captionsContainerSelector: string = 'div[jsname="dsyhDe"]';

const observeDOMChanges = (): void => {
  const captionsContainer: HTMLElement | null = document.querySelector(captionsContainerSelector);

  if (captionsContainer) {
    const config: MutationObserverInit = {
      childList: true,
      characterData: true,
      subtree: true
    };

    const observer: MutationObserver = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === 'span') {
              const spanElement = node as HTMLSpanElement;
              const newCaption = createCaptionData(spanElement);
              captions.push(newCaption);
            }
          });
        } else if (mutation.type === 'characterData' && mutation.target.parentNode) {
          const spanElement = mutation.target.parentNode as HTMLSpanElement;
          updateCaption(spanElement, mutation.target.textContent || '');
        }
      });
    });

    observer.observe(captionsContainer, config);
    console.log('字幕監視を開始しました。');
  } else {
    console.log('字幕コンテナが見つかりません。再試行します。');
  }
};

const createCaptionData = (spanElement: HTMLSpanElement): InternalCaptionData => {
  const userNameElement = spanElement.closest(captionsContainerSelector)?.querySelector('div.zs7s8d.jxFHg');
  const userName = userNameElement?.textContent?.trim() || 'Unknown';
  const text = spanElement.textContent || '';
  const timeStamp = new Date().toISOString();
  return { userName, timeStamp, text, element: spanElement };
};

const updateCaption = (spanElement: HTMLSpanElement, newText: string): void => {
  // 空白文字のみでないかチェックするロジックを追加
  if (!newText.trim()) {
    return; // newTextが空白文字のみの場合は、ここで処理を終了します。
  }

  const existingCaption = captions.find(c => c.element === spanElement);
  if (existingCaption) {
    existingCaption.text = newText;
    existingCaption.timeStamp = new Date().toISOString();
  }
};

const formatCaptionDataForLog = (caption: InternalCaptionData): CaptionData => {
  return {
    userName: caption.userName,
    timeStamp: caption.timeStamp,
    text: caption.text
  };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get_captions") {
    // 以前に定義した関数を使用して字幕データを送信
    sendCaptionsToBackground();
  }
});

// コンテンツスクリプト内でこの関数を呼び出してデータをバックグラウンドスクリプトに送信する
const sendCaptionsToBackground = () => {
  if (captions.length > 0) {
    console.log('バックグラウンドに字幕データを送信します:', captions);
    const captionsForExport = captions.map(formatCaptionDataForLog);
    chrome.runtime.sendMessage({ action: "export_captions", data: captionsForExport }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('バックグラウンドへの送信中にエラーが発生しました:', chrome.runtime.lastError.message);
      }
    });
  } else {
    console.log('エクスポートする字幕データがありません。');
  }
};

// DOMが読み込まれた後に監視を開始する
const intervalId = window.setInterval(() => {
  if (document.querySelector(captionsContainerSelector)) {
    observeDOMChanges();
    clearInterval(intervalId);
  }
}, 500);

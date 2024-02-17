// content-script.ts
interface CaptionData {
  userName: string;
  timeStamp: Date;
  text: string;
}

const captions: CaptionData[] = [];
const captionsContainerSelector: string = 'div[jsname="dsyhDe"]';
let lastCaption: CaptionData | null = null; // 直前のキャプションを追跡
let debounceTimer: number | undefined;

const observeDOMChanges = (): void => {
  const captionsContainer: HTMLElement | null = document.querySelector(captionsContainerSelector);

  if (captionsContainer) {
    const config: MutationObserverInit = {
      childList: true,
      subtree: true,
      characterData: true
    };

    const callback: MutationCallback = (mutationsList: MutationRecord[]): void => {
      // デバウンスタイマーをクリアする
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // 変更が一時的に止まったと見なされた場合にのみ実行される
      debounceTimer = window.setTimeout(() => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === 'characterData' && mutation.target.parentNode) {
            const spanElement = mutation.target.parentNode as HTMLSpanElement;
            if (spanElement.tagName.toLowerCase() === 'span') {
              const userNameElement: HTMLElement | null | undefined = spanElement.closest('div[jsname="dsyhDe"]')?.querySelector('div.zs7s8d.jxFHg');
              const userName: string = userNameElement?.textContent?.trim() || 'Unknown';
              const text: string = spanElement.textContent || '';
              const timeStamp: Date = new Date(); // 現在のタイムスタンプ

              const captionData: CaptionData = {
                userName,
                timeStamp,
                text
              };

              // 直前のキャプションと比較して重複チェック
              if (!lastCaption || (lastCaption.text !== text || lastCaption.userName !== userName)) {
                lastCaption = captionData; // 現在のキャプションを記録
                captions.push(captionData);
                console.log(`字幕が更新されました:`, captionData);
              }
            }
          }
        });
      }, 500); // 500msのデバウンス時間
    };

    const observer: MutationObserver = new MutationObserver(callback);
    observer.observe(captionsContainer, config);
    console.log('字幕監視を開始しました。');
  } else {
    console.log('字幕コンテナが見つかりません。再試行します。');
  }
};

// DOMが読み込まれた後に監視を開始する
const intervalId: number = window.setInterval(() => {
  if (document.querySelector(captionsContainerSelector)) {
    observeDOMChanges();
    clearInterval(intervalId);
  }
}, 500);

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {}

  exportCaptions(): void {
    // 字幕データを取得するメッセージをコンテンツスクリプトに送信
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "get_captions" }, (response) => {
        if (response && response.success) {
          console.log('字幕データの取得に成功しました。');
        } else if (chrome.runtime.lastError) {
          console.error('字幕データの取得に失敗しました。', chrome.runtime.lastError.message);
        }
      });
    });
  }
}

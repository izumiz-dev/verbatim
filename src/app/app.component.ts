import { Component } from '@angular/core';

interface CaptionData {
  userName: string;
  timeStamp: string;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {}

  exportCaptionsWithText(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "get_captions" }, (response) => {
        if (response && response.success) {
          console.log('字幕データの取得に成功しました。');
          this.formatAndDownloadCaptions(response.data);
        } else if (chrome.runtime.lastError) {
          console.error('字幕データの取得に失敗しました。', chrome.runtime.lastError.message);
        }
      });
    });
  }

  private formatAndDownloadCaptions(captions: CaptionData[]): void {
    let formattedText = '';
    let currentUser = '';

    captions.forEach((caption, index) => {
      if (caption.userName !== currentUser) {
        currentUser = caption.userName;
        formattedText += `\n${currentUser}:\n`;
      }
      formattedText += `[${this.formatTime(caption.timeStamp)}] ${caption.text}\n`;
    });

    // 空白行を削除し、連続する文を結合
    formattedText = formattedText.split('\n').filter(line => line.trim() !== '').join('\n');

    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private formatTime(timeStamp: string): string {
    const date = new Date(timeStamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

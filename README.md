## Verbatim for Google Meet

Google Meetの字幕機能から文字を取得し、記録やAIによる要約などを目的とするChrome拡張機能の実験/プロトタイプです。

### 現段階

* 現時点で行えること
  * json形式で字幕情報をダウンロード・保存

適当なテスト例：

```json
[
  {
    "userName": "あなた",
    "timeStamp": "2024-02-23T06:56:14.071Z",
    "text": "Google meet の 字幕機能から文字を取得し、記録や AI"
  },
  {
    "userName": "あなた",
    "timeStamp": "2024-02-23T06:56:21.084Z",
    "text": "などによる要約を目的とする Chrome 拡張機能の実験になります"
  },
  {
    "userName": "あなた",
    "timeStamp": "2024-02-23T06:56:25.465Z",
    "text": "現時点では JSON 形式で 字幕"
  },
  {
    "userName": "あなた",
    "timeStamp": "2024-02-23T06:56:27.095Z",
    "text": "情報をダウンロードし保存することができます。"
  }
]
```


### 将来的な機能

- [x] 何かのファイル形式でファイル出力
- [ ] ファイルを元に要約
  - [ ] → 会議時中に現段階までのまとめの生成


### ビルド方法

1. リポジトリをクローン
2. `npm install` を実行
3. `npm run build` を実行
4. Chromeの [chrome://extensions/](chrome://extensions/) からデベロッパーモードを有効
5. パッケージ化されていない拡張機能を読み込むから distの下の verbatim を選択

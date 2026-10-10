# 模板支撐互動分析

包含樓板、梁、柱、牆模板檢核，L2 ↔ Y、L3 ↔ X 尺寸連動，以及詳細 Word 計算書匯出。

使用 GitHub Pages 開啟，或下載完整儲存庫後開啟 index.html。所有運算與 Word 函式庫均在本機執行。

計算依提供的原始 VB 程式移植，適用範圍與公式詳見頁面；未宣稱已依現行規範完成校訂。

第三方 docx 函式庫授權詳見 vendor/docx-LICENSE.txt。

## 2026-10-10 更新

- 33 類參數的定義、單位與資料来源；逐欄展開及全文搜尋。
- 1 分 52 秒教學影片：台灣華語女性 HsiaoChen 合成旁白、繁體字幕、六章跳轉。影片內嵌於 index.html，可離線使用。
- 營造安全衛生設施標準的版本／生效狀態、131 條高度與面積分類、現場查驗清單，及 ACI 官方版本資訊。
- 規範檢視並非完整規範設計引擎；既有數值公式保留，不能据此主張整體支架安全認證。
- 手機版可展開欄位定義；構件檢核直接呈現表格。阻擋不完整構件與無效模型選項。

建置：`node build.cjs`（不需額外套件）。封裝：安裝 jszip 後執行 `node build-offline.cjs`。測試：`node tests/regression.cjs`。
教學影片製作來源在 tutorial-source；需要 HyperFrames、FFmpeg、Python edge-tts。現有 MP4 與網頁播放不需要這些工具或網路語音服務。

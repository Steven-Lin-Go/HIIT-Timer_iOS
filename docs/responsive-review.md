# Guideline 4 排版修正與驗證

日期：2026-09-18。審查資訊依使用者提供：2026-09-09、Version 1.0 (5)、iPhone 17 Pro Max、iOS 26.6.1。

後續補強：Expo 相容 patch 已更新，Doctor 現為 21 / 21 通過。下方「第一輪結果」保留當時紀錄；最新狀態見「第二輪補強」。

發行準備更新：Build 6 不含圓環修正；Build 7 只移除 Zen 固定缺口；Build 8 將彩色弧固定為完整圓。最新需求恢復倒數進度效果：四主題的底層軌道保持閉環，彩色弧從完整圓隨剩餘秒數縮短並於完成時消失。下方尚未建置的敘述是前兩輪當時狀態；目前進度、實機待驗證清單及審查回覆見 [送審準備](app-review-reply.md)。原生建置成功不代表實機版面驗證通過。

## 截圖與原因

提供的 1320 × 2868 截圖中，首頁的 `00:20` 被拆成 `00:2` 與 `0`，導致運動標籤、倒數與回合數佔用過多高度並碰到圓環。若以 3x 顯示比例換算，對應 440 × 956 邏輯尺寸；這個尺寸用作測試案例，不代表已取得 Apple 當時的文字大小或 Display Zoom 設定。

原先 `CircularTimer` 的數字可以換行，沒有單行縮放約束；中央區塊缺少明確的內圈寬度。首頁用整個視窗高度估算圓環大小，執行頁則固定 300pt。兩頁都以不可捲動的 flex 容器置中，因此在可用高度不足、長名稱或較大文字時，內容可能超出區塊。

## 已修改

- 共用圓環：數字單行、原生自動縮字、等寬數字，文字寬度與基本字級依圓環尺寸計算，保留內圈留白。圓環內文字、導覽文字、數值及圖示設有字級倍率上限，其他內容仍可放大與換行。
- 首頁與執行頁：`TimerLayout` 量測 Safe Area、標題與導覽列扣除後的實際容器。內容與操作鍵在同一捲動容器，較寬橫向畫面分欄。執行中的課表名稱移到圓環外，可完整換行。
- 設定、時間調整器、自訂課表：選項及按鈕空間不足時換列。主題卡片改為可成長高度；調整時間的加減按鈕為 44pt。
- 編輯頁：內容與套用／儲存按鈕一起捲動，加入 iOS 鍵盤避讓。課表頁與統計頁的子頁籤也納入捲動，避免短畫面被固定區塊佔滿。
- 統計：窄螢幕／原生較大文字採單欄；數字可原生縮放。圖表 Y 軸寬度依數字長度調整，X 軸標籤密度依實際寬度調整。
- 保留根容器四邊的 `SafeAreaView`，橫向左右安全區由原生 safe-area-context 提供。

## 自動化驗證

測試實際 Expo／React Native Web 元件，不是另寫一份 HTML 模型。每個矩陣案例操作首頁、設定、預設／自訂課表、編輯、計時各階段、暫停／恢復，以及週／月／年統計。使用長中英文課表名、60:00 倒數與超過 100 小時的統計資料。

| 類別 | 範圍 |
| --- | --- |
| iPhone 邏輯尺寸 | 320×568、375×667、375×812、390×844、393×852、402×874、414×896、428×926、430×932、440×956 |
| 平板防退化尺寸 | 768×1024、1024×1366 |
| 方向與語言 | 每個尺寸直向／橫向，各測繁中／英文 |
| 渲染引擎 | Chromium、WebKit（Windows） |
| 額外情境 | 四種主題＋背景圖＋即時旋轉；320×568、667×375、440×956 的雙語 200% 文字壓力測試 |
| 斷言 | 文字不超出父容器／視窗、不裁切；可見文字不互相重疊；圓環文字留在內圈；倒數保持單行；操作鍵可實際捲到並點擊；頁面無 JavaScript 錯誤 |

完整矩陣共 116 案例，全部通過；執行時間 8.1 分鐘。結果與挑選的畫面截圖記錄於下方。

文字壓力測試是瀏覽器 DOM 字級放大，**不是 iOS Dynamic Type 模擬**。Web 不支援原生 `adjustsFontSizeToFit`，因此計時／統計數值保留基本字級；其他文字依測試倍率放大，圖示與圖表標籤保留基本字級。此測試也不會觸發原生 `fontScale` 切換單欄的分支。Safe Area 使用保守的容器內距測試值，不能證明某台 iPhone 的真實 inset。

本機重跑：

```powershell
npm ci
$env:PLAYWRIGHT_BROWSERS_PATH='.cache/ms-playwright'
npx playwright install chromium webkit
npm run test:responsive
npx playwright show-report
npm run typecheck
npm test
```

CI 已加入單元測試與雙引擎排版測試，EAS build 工作需等待兩者成功。完整截圖位於 `test-results/`，HTML 報告位於 `playwright-report/`；CI 會保留兩者 14 天。

## 原生與送審前待辦

本次執行環境是 Windows，無法執行 Xcode Simulator。沒有宣稱已在 iPhone 17 Pro Max／iOS 26.6.1 通過原生測試，也尚未建立或上傳 Build 6。

1. 在 Mac 使用新增的 `simulator` EAS profile 建置，或以 `npx expo run:ios` 本機編譯。在 Xcode 可取得該 runtime 的前提下，優先測 Apple 指定裝置與版本；若 runtime 不可取得，記錄替代 runtime，並以指定版本實機補驗。
2. 原生驗證首頁、所有計時階段、暫停／恢復／結束／重新開始、課表展開／編輯、設定、統計。重測 00:20、60:00、99 回合、長名稱、中英文、四主題與自訂照片。
3. 檢查直橫向旋轉、Display Zoom、最大一般字級與輔助使用大字級、Dynamic Island、Home Indicator，以及編輯時鍵盤開啟後可否捲到套用／儲存。
4. 原生 `Alert`（刪除課表／清除紀錄）與照片選擇器由 iOS 提供，瀏覽器測試未驗證；請在測試資料上操作取消／確認流程。
5. `app.json` 的 `ios.supportsTablet` 目前為 `false`，沒有開啟原生 iPad 版。這個設定**不能單獨證明** App Store 禁止 iPad 以 iPhone 相容模式安裝；仍需確認 App Store 可用裝置，若可下載則在 iPad 相容模式補驗。平板瀏覽器尺寸測試也不能取代這一步。
6. EAS 使用 `appVersionSource: remote`，production 已設 `autoIncrement: true`。建置前確認遠端目前 build number 為 5，才可把下一包稱作 Build 6；不要只在 `app.json` 寫入 6。完成原生驗證後建立 production 包、TestFlight 安裝驗證，再送審。

原生模擬器建置命令（需要既有 EAS 登入／專案權限，安裝與執行需要 Mac）：

```sh
npx eas-cli build --platform ios --profile simulator
```

實作依據：[React Native Text](https://reactnative.dev/docs/text#adjustsfontsizetofit)、[ScrollView](https://reactnative.dev/docs/scrollview)。

## 第一輪結果（更新前）

- `npm run typecheck`：通過。
- `npm test`：51 / 51 通過。
- `npx expo export --platform ios --output-dir .cache/ios-export --max-workers 2`：通過，產生 iOS Hermes bundle。這是 JS／資產匯出，並非 Xcode 原生編譯或 IPA。
- `expo-doctor@latest`：20 / 21 通過；失敗項目為專案既有 9 個 Expo 套件低於遠端目前建議 patch 版本（expo 57.0.18 vs 57.0.23，另有 asset/audio/constants/dev-client/file-system/haptics/image-picker/speech）。本次未升級原生 SDK，也未停用檢查。現行 CI 的 Doctor gate 仍會因此失敗，正式 build 前需另行更新相容 patch 並重跑原生驗證。
- Chromium：58 / 58 通過。WebKit：58 / 58 通過。合計 116 / 116。
- 人工檢視大／小螢幕、橫向、設定、放大文字編輯頁與大數值統計截圖。最後僅調整 5 個檔案縮排，並以 TypeScript 編譯輸出完全相同的斷言確認未改變行為，再次通過 typecheck 與 `git diff --check`。

人工檢視截圖（瀏覽器渲染，非 iOS Simulator）：

- [440×956 首頁](review-layout/home-440x956.png)
- [956×440 橫向計時、長課表名稱](review-layout/run-956x440.png)
- [320×568 設定](review-layout/settings-320x568.png)
- [320×568 編輯頁、放大文字](review-layout/setup-320x568-large-text.png)
- [440×956 統計與大數值座標軸](review-layout/stats-440x956.png)

## 第二輪補強

- 依 Expo 官方 `expo install --fix` 更新 SDK 57 相容 patch，並同步 package.json 與 lockfile；未跨 SDK 主版本。Expo Doctor 已從 20 / 21 改為 21 / 21 通過。
- 暫停時停用上一／下一階段按鈕，視覺及輔助使用狀態與既有計時行為一致；恢復後重新啟用。
- 為返回、設定、上一／下一階段、暫停／繼續、加減值按鈕及設定開關補上中英文朗讀名稱。底部導覽提供 tab 角色與選取狀態；加減值達上下限會停用。
- 從課表進入編輯後按返回，會回到課表頁，未儲存修改會捨棄；不再意外跳到計時首頁。
- 小螢幕計時模式按鈕提供較寬的換列基準，改善放大英文字體時單字被拆行的情況。
- CI 增加 iOS JavaScript bundle 匯出；手動建置可選 simulator；移除 `--no-wait`，讓遠端建置失敗能反映在 CI 結果，設 90 分鐘逾時。EAS preflight 補驗 simulator profile 與 production 遠端版本自動遞增。
- 新增雙語操作回歸：按鈕朗讀名稱、暫停狀態、數值上下限、取消編輯與原資料保留。完整瀏覽器案例由 116 增至 120。

驗證：TypeScript、51 項單元測試、EAS 設定 preflight、Expo Doctor 21 項檢查與 iOS Hermes bundle 匯出均通過。116 項既有瀏覽器案例重新通過；新增的 4 項操作案例起初找出導覽選取狀態未傳到網頁的問題，改用原生及網頁均支援的 `aria-selected` 後，雙引擎／雙語 4 項重跑全部通過（7.5 秒）。合計驗證 120 項案例；不是把初次的 4 項失敗視為通過。

初次完整執行紀錄保留在 `playwright-report/`、`test-results/`；修正後的操作測試紀錄在 `.cache/controls-report/`、`.cache/controls-results/`。一般執行 `npm run test:responsive` 會一次執行全部 120 項。最新的小螢幕放大文字畫面：[模式按鈕換列](review-layout/setup-320x568-followup.png)。

以上是本機驗證，尚未推送執行 GitHub Actions、產出 EAS 原生 IPA 或送審。原生 iOS／實機待辦依前節執行；更新原生套件後需要重新建置安裝包。

套件更新依據：[Expo 官方升級流程](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)。

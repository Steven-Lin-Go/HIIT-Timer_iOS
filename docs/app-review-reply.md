# Build 8：TestFlight 驗證與 App Review 回覆

更新：2026-09-19。使用者已完成審查訊息回覆；此文件保留實機驗證與重新送審步驟。

## 目前進度

- EAS 登入與專案權限已確認；production 遠端 build number 已遞增為 8。
- App 設定版本為 1.0.0。Build 6 不含圓環修正；Build 7 只修正固定缺口，但倒數進度弧仍會縮短。兩者都不應再選用；重新送審應選最終的 Build 8。
- 正式簽署的 [iOS 1.0.0 Build 8](https://expo.dev/accounts/stevenlin73s-team/projects/stevenlin/builds/1d8d4767-9c13-40f8-86bb-253dd4ae7257) 已完成，EAS 狀態為 FINISHED。
- [Build 8 上傳 App Store Connect / TestFlight](https://expo.dev/accounts/stevenlin73s-team/projects/stevenlin/submissions/cc026f2a-eb84-4804-933f-fcbd7f81e334) 已完成，EAS submission 狀態為 FINISHED。EAS Submit 不會提交正式 App Review；Apple 仍可能需要一些時間讓 build 出現在 TestFlight。
- 本機 TypeScript、51 項單元測試、Expo Doctor 21 項檢查、iOS JavaScript bundle 匯出通過。
- 116 項瀏覽器版面測試與修正後 4 項操作測試通過，涵蓋 Chromium / WebKit；這不是 iOS 原生驗證。
- 最終圓環設計在倒數前與倒數中都保持閉環，只依階段切換顏色，不再用縮短的進度弧顯示剩餘時間。
- 尚待 TestFlight 實機測試；不能宣稱已在 iPhone 17 Pro Max / iOS 26.6.1 通過。

## iPhone + TestFlight

1. 等 EAS 建置成功並上傳 App Store Connect。EAS Submit 上傳不等於送交正式 App Review。
2. 在 App Store Connect → HIIT Timer → TestFlight 確認 Build 8 已處理完成。若有出口合規或測試資訊待填，依實際內容完成。
3. 將 Build 8 加入內部測試群組，並確認自己的 App Store Connect 使用者在該群組。外部測試者可能另需 TestFlight App Review。
4. 在 iPhone 的 TestFlight 安裝／更新 HIIT Timer，核對安裝的是 Build 8。
5. 執行下方清單，記錄真實的型號、iOS 版本與字級設定，並擷取原生畫面。`docs/review-layout` 是瀏覽器測試截圖，不能當作 iPhone 實機驗證證明。

Apple 官方：[新增內部測試者與 build](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)。

「What to Test」可填寫：

```text
The updated build fixes overlapping layouts and restores the countdown progress effect consistently across all four themes. Check that 00:20 remains on one line, the phase/round labels do not overlap, the colored arc starts as a complete circle, shrinks with the remaining seconds, and disappears at completion while the base track remains closed. Test portrait and landscape, larger system text, and Display Zoom. Confirm that timer controls, workout editing with the keyboard open, settings, and statistics remain readable and accessible. Report your iPhone model, iOS version, and screenshots of any issue.
```

| 驗證項目 | 結果／證據（實測後填寫） |
| --- | --- |
| iPhone 型號、iOS 版本、TestFlight 版本與 build | 待驗證 |
| 首頁 `00:20` 完整單行；階段、回合不與圓環交疊 | 待驗證；截圖 |
| 每階段開始時彩色弧為完整閉環；倒數時逐秒縮短；完成時彩色弧消失且底層軌道維持閉環 | 待驗證；截圖 |
| 開始、暫停、繼續、上一／下一階段、完成畫面 | 待驗證 |
| 直向／橫向切換；頂部與底部安全區 | 待驗證；截圖 |
| 系統放大文字與 Display Zoom；必要時可捲動至所有操作 | 待驗證；記錄設定 |
| 繁中／英文、長課表名稱、60:00、99 回合 | 待驗證 |
| 編輯課表與鍵盤開啟；儲存／取消可操作 | 待驗證 |
| 設定、主題／背景照片、照片選擇器與原生確認視窗 | 待驗證 |
| 統計日／週／月與長數字；無遮擋 | 待驗證 |
| 小尺寸 iPhone；若可取得 Apple 指定型號，優先覆測 | 待驗證 |
| App Store 若允許 iPad 相容模式安裝，補測該模式 | 待確認可安裝性／待驗證 |

只有一台 iPhone 時，回覆僅列實際測過的裝置；其他尺寸的瀏覽器測試不可描述成原生裝置測試。

## 已傳送的進度回覆（歷史紀錄）

```text
Hello App Review Team,

Thank you for identifying the overlapping layout issue under Guideline 4.

We identified that the timer value could wrap onto a second line, causing the timer content to overlap. We have updated the timer to keep the countdown on one line with adaptive sizing, and revised the surrounding layouts to adapt and scroll when space is limited. We also updated the settings, workout editor, and statistics screens to better accommodate smaller screens and longer text.

We have created Build 6 and queued it for upload to TestFlight. We will verify the changes on iPhone before resubmitting the updated build.

Thank you.
```

## 實機驗證通過並選好新 build 後的回覆

以下草稿須先替換方括號，且僅保留真正完成的測試。附檔句僅在確實附上原生截圖時保留。

```text
Hello App Review Team,

Thank you for your feedback regarding Guideline 4 – Design.

We have addressed the overlapping layout issue in the updated build. The timer countdown now stays on a single line and scales to fit its available space. The phase and round labels are contained within the timer layout, and the surrounding content adapts or scrolls when space is limited. Across all four themes, the colored timer arc starts as a complete circle, shrinks with the remaining time, and disappears at completion while the base track remains closed. We also adjusted the settings, workout editor, workout list, and statistics layouts for smaller screens and longer text.

We verified the updated build on [actual iPhone model(s) and iOS version(s)], including [actual orientations and text/display settings tested]. We have attached screenshots from the updated iPhone build showing the corrected layout.

To review the timer, launch the app, open the Timer tab, and tap Start. The countdown, phase, round, and playback controls should remain readable and accessible. Settings, workout editing, and statistics are available from the main navigation.

We have selected Build 8 for this resubmission. Thank you for reviewing the updated build.
```

## 在 App Store Connect 回覆

1. Apps → HIIT Timer → 頁面上方未解決問題連結（View App Review Issues & Messages）。
2. In Progress → 該次被拒提交旁的 Resolve。
3. Reply to App Review → 貼上適用草稿。
4. 可使用 Attach File 加入本次 build 的原生截圖，再按 Reply。

Apple 官方：[Reply to App Review messages](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/reply-to-app-review-messages)。需要 Account Holder、Admin 或 App Manager 權限。

## 重新送審（與回覆訊息是兩個動作）

1. 實機驗證通過後，在被拒版本頁面的 Build 區塊移除舊 Build 5 的關聯，選擇已處理完成的 Build 8 並儲存。請勿選 Build 6 或 7；移除版本關聯不會刪除帳戶中的 build。
2. 在 Resolve 頁面編輯被拒項目，完成必要修改後按 Add for Review。
3. 確認所有被拒項目已處理，再按 Resubmit to App Review。

Apple 官方：[選擇 build](https://developer.apple.com/help/app-store-connect/manage-builds/choose-a-build-to-submit)、[處理未解決的提交](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/manage-a-submission-with-unresolved-issues)。

Expo 官方：[上傳 iOS build](https://docs.expo.dev/submit/ios/)。

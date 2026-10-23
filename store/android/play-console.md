# Google Play Console：HIIT Timer 填寫內容

把這份文件的內容照抄到 Play Console 的對應欄位。素材檔都在同一個資料夾。

| 素材 | 檔案 | 規格 |
|---|---|---|
| App 圖示 | `play-icon-512.png` | 512×512 PNG |
| 主題圖片（Feature graphic） | `feature-graphic-1024x500.png` | 1024×500 PNG |
| 手機螢幕截圖 | `screenshots/phone-*.png` | 1080×2150（6 張，依檔名順序上傳；Play 規定至少 2 張、最多 8 張） |
| 上傳的 App | `D:\Android\release\hiit-timer-<版本>-<versionCode>-release.aab` | 已用上傳金鑰簽章 |

---

## 1. 建立應用程式

| 欄位 | 填寫 |
|---|---|
| 應用程式名稱 | HIIT Timer |
| 預設語言 | 中文（台灣）– zh-TW |
| 應用程式或遊戲 | 應用程式 |
| 免費或付費 | 免費（之後**不能**改成付費） |

## 2. 主要商店資訊

### 中文（台灣）zh-TW（預設）

**應用程式名稱**（30 字元內）
```
HIIT Timer
```

**簡短說明**（80 字元內）
```
簡潔好讀的 HIIT／Tabata 間歇訓練計時器，含語音倒數、課表與訓練統計。
```

**完整說明**（4000 字元內）
```
HIIT Timer 是一款專為高強度間歇訓練設計的計時器。數字大、顏色分明，訓練時一眼就看得到現在該做什麼。

【計時】
• 支援標準間歇（40 秒／20 秒）與 Tabata（20 秒／10 秒 × 8 回合）模式
• 自訂準備、訓練、休息、回合數與緩和時間
• 每個階段以不同顏色顯示，並提示下一個階段
• 可暫停、繼續、跳到上一段或下一段

【提示】
• 提示音、震動回饋與語音倒數，眼睛不用一直盯著螢幕
• 語音支援正體中文與英文

【課表】
• 內建多組預設課表，依難度分類
• 建立、編輯、排序自己的課表

【統計】
• 依週、月、年檢視訓練次數、總時間、實際訓練時間與完成回合
• 連續訓練天數與最佳紀錄
• 與上一期比較，掌握進步幅度

【外觀】
• 四種介面風格可切換
• 可用自己的照片當計時畫面底圖，並保留遮罩確保數字清楚可讀
• 支援直向與橫向畫面

【隱私】
沒有帳號、沒有廣告、沒有追蹤。課表、紀錄與設定都只存在你的手機上。
```

### English (United States) en-US

在「管理翻譯」新增英文（美國）後填入：

**Short description**
```
Clear HIIT & Tabata interval timer with voice countdown, workouts and stats.
```

**Full description**
```
HIIT Timer is an interval timer built for high-intensity training. Big numbers and distinct colors tell you at a glance what to do next.

TIMER
• Standard intervals (40s / 20s) and Tabata (20s / 10s × 8)
• Set your own prepare, work, rest, rounds and cool-down times
• Each phase has its own color, with the next phase always shown
• Pause, resume, or skip back and forward between intervals

CUES
• Beeps, vibration and a spoken countdown, so you can keep your eyes off the screen
• Voice cues in English and Traditional Chinese

WORKOUTS
• Built-in presets grouped by difficulty
• Create, edit and reorder your own workouts

STATS
• Workouts, total time, active time and completed rounds by week, month or year
• Day streaks and your best streak
• Comparison with the previous period

LOOK
• Four interface styles
• Use your own photo as the timer backdrop; a wash keeps the countdown readable
• Portrait and landscape layouts

PRIVACY
No account, no ads, no tracking. Your workouts, history and settings stay on your phone.
```

### 圖像
- 應用程式圖示：`play-icon-512.png`
- 主題圖片：`feature-graphic-1024x500.png`
- 手機螢幕截圖：`screenshots/` 裡全部的 `phone-*.png`（中英文商店資訊可共用）
- 7 吋、10 吋平板截圖：**不用上傳**（本版不針對平板）

## 3. 商店設定

| 欄位 | 填寫 |
|---|---|
| 應用程式類別 | 健康與健身（Health & Fitness） |
| 標記 | 可略過，或選「健身追蹤」等相近項目 |
| 電子郵件地址 | steven@steven.tw |
| 網站 | https://steven-lin-go.github.io/HIIT-Timer_iOS/ |
| 電話 | 不填 |

## 4. 應用程式內容（政策宣告）

### 隱私權政策
```
https://steven-lin-go.github.io/HIIT-Timer_iOS/privacy-policy.html
```

### 應用程式存取權
選「**所有功能皆可使用，無須特殊存取權**」（沒有登入）。

### 廣告
「**否，我的應用程式沒有廣告**」。

### 內容分級（IARC 問卷）
- 電子郵件：steven@steven.tw
- 類別：「**所有其他應用程式類型**」（不是遊戲、不是社群）
- 暴力、性、粗俗語言、受管制物質、賭博：全部「否」
- 使用者互動／分享內容：「否」（使用者之間無法互動，也不會分享內容）
- 分享使用者位置：「否」
- 數位購買：「否」
- 預期結果：普遍級（3+／Everyone）

### 目標對象和內容
- 目標年齡層：勾 **18 歲以上**（建議只勾這一組；勾到 13 歲以下會觸發「家庭」政策的額外審查）
- 是否可能吸引兒童：否

### 資料安全性（Data safety）

App 本身不蒐集個人資料，但內建的 expo-updates 在每次啟動檢查更新時，會送出一組**隨機產生的安裝 ID**（`EAS-Client-ID`）給 Expo 的更新伺服器。依 Google 的定義，這屬於「裝置或其他 ID」，應如實申報：

| 問題 | 回答 |
|---|---|
| 是否蒐集或分享任何必須申報的使用者資料類型？ | **是** |
| 所有使用者資料在傳輸過程中都經過加密？ | **是**（HTTPS） |
| 是否提供使用者要求刪除資料的方式？ | 選「**否**」並說明：ID 隨機產生、不與個人身分連結；解除安裝即刪除 |
| 資料類型 | 只勾「**裝置或其他 ID → 裝置或其他 ID**」 |
| 這項資料是蒐集、分享，還是兩者？ | **蒐集**（不分享） |
| 是否為暫時處理？ | 否 |
| 是否為必要？ | 必要（使用者無法關閉） |
| 蒐集目的 | **應用程式功能**（下載 App 更新） |

其他所有資料類型（位置、個人資訊、照片、健康與健身、App 活動等）一律**不勾**。照片只複製到 App 的私有空間，不會離開裝置，所以不算「蒐集」。

### 其他宣告
- 新聞應用程式：否
- 新冠肺炎接觸追蹤：否
- 政府應用程式：否
- 金融功能：無
- 健康應用程式：**「健身」類**，若問卷出現「健康應用程式」宣告，勾「活動和健身」，說明 App 不讀取健康感測器、也不連 Health Connect

## 5. 測試與發布順序

1. **內部測試**：上傳 AAB，加入自己的 Gmail 當測試人員，從 Play 商店安裝，確認可以正常更新與執行。
2. **封閉測試**：新的個人開發者帳號必須先有 **至少 12 位測試人員連續加入 14 天**，才能申請正式版。
3. **申請正式版存取權**：14 天滿後在資訊主頁填問卷申請，Google 審查約需數天。
4. **正式版**：建立正式版發布，可以先從 20% 分階段推出。

## 6. 之後上傳新版本

1. 修改 `app.json` 的 `android.versionCode`（每次 +1，絕不重複），需要時同時修改 `version`。
   - 注意：`version` 也是 iOS 的版本號，且決定 `runtimeVersion`，改它前先確認 iOS 的發布計畫。
2. 執行 prebuild，再執行 `D:\Android\build-hiit-release.ps1`。
3. 在 Play Console 建立新的發布，上傳新的 AAB。

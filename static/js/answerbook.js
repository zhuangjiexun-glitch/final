// =====================
// 答案之書 - 獨立功能腳本
// =====================

// 頁面初始化：確保進入頁面時，畫面狀態是初始的提示文字
document.addEventListener("DOMContentLoaded", () => {
    const resultDiv = document.getElementById("answerResult");
    if (resultDiv) {
        resultDiv.innerHTML = "請在心中默念問題<br><br><span style='font-size: 14px; font-weight: normal; color: #666;'>然後點擊書本</span>";
        resultDiv.style.opacity = "1";
    }
});

let isFlippingBook = false;

function flipBook() {
    if (isFlippingBook) return;
    isFlippingBook = true;

    const resultDiv = document.getElementById("answerResult");
    const flippingPage = document.getElementById("flippingPage");

    if (!resultDiv || !flippingPage) return; // 防呆機制

    // 讓舊文字短暫淡出
    resultDiv.style.opacity = "0";

    // 啟動 3D 翻頁動畫
    flippingPage.classList.remove("is-flipping");
    void flippingPage.offsetWidth; // 觸發 reflow，確保瀏覽器重新計算動畫
    flippingPage.classList.add("is-flipping");

    const answers = [
        // 肯定與積極
        "毫無疑問", "這是一個好主意", "大膽去做吧", "放手一搏", "結果會如你所願",
        "絕對是肯定的", "這將帶來好運", "你的直覺是對的", "勇敢前進", "這值得你投入",
        "這將為你打開新大門", "毫無保留地去做", "現在正是時候", "你會為此感到高興",
        "百分之百正確", "這就是你要找的答案", "當然可以", "這是命中注定", "去爭取吧",
        "一切都在掌握中", "不用懷疑",

        // 否定與警告
        "絕對不行", "現在還不是時候", "再等一等", "這可能會帶來麻煩", "這不是個好主意",
        "你需要重新考慮", "最好放棄這個念頭", "這不值得你煩惱", "不要抱太大期望",
        "時機尚未成熟", "這條路行不通", "你會後悔的", "請三思而後行", "這充滿了未知數",
        "風險太大了", "目前情況不利", "不要急於求成", "這可能是一個陷阱", "現在別做決定",
        "情況可能會變得更糟",

        // 觀望與反思
        "順其自然就好", "答案就在你心中", "你需要更多的資訊", "保持耐心", "這取決於你的行動",
        "換個角度想", "這需要時間來證明", "留意身邊的暗示", "專注於當下", "這是一個學習的過程",
        "不要太過執著", "問問自己為什麼", "這會帶來意想不到的驚喜", "退一步海闊天空",
        "答案很快就會浮現", "這不是你現在該擔心的", "保持開放的態度", "你需要專注於內心",
        "隨遇而安", "靜觀其變",

        // 行動與指引
        "尋求他人的建議", "先休息一下再說", "把注意力轉移到別處", "列出優缺點再決定",
        "採取主動", "這需要你付出更多努力", "給自己多一點時間", "去吃頓好的犒賞自己",
        "出門兜個風轉換心情", "嘗試不同的方法", "從過去的經驗中學習", "仔細評估每一個細節",
        "保持冷靜並觀察", "勇敢表達你的想法", "是時候放下過去了", "與信任的人聊聊",
        "專注於你真正想要的", "不要害怕失敗", "這是一個新的開始"
    ];

    // 在書頁翻過去遮住視線時（大約 350ms），替換文字
    setTimeout(() => {
        const randomAns = answers[Math.floor(Math.random() * answers.length)];

        resultDiv.innerHTML = `
            ${randomAns}
            <div style="margin-top: 15px; border-top: 1px solid #444; width: 40px; margin-left: auto; margin-right: auto; opacity: 0.5;"></div>
        `;
        // 顯示新文字
        resultDiv.style.opacity = "1";
    }, 350);

    // 動畫結束，解除鎖定，允許玩家進行下一次點擊
    setTimeout(() => {
        isFlippingBook = false;
    }, 700);
}
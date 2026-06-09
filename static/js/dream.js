// =====================
// 周公解夢 - 獨立功能腳本
// =====================

// 頁面初始化：確保進入頁面時畫面狀態是乾淨的
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("dreamInput")) {
        document.getElementById("dreamInput").value = "";
        if (document.getElementById("dreamResult")) document.getElementById("dreamResult").style.display = "none";
        if (document.getElementById("dreamLoading")) document.getElementById("dreamLoading").style.display = "none";
        if (document.getElementById("submitDreamBtn")) document.getElementById("submitDreamBtn").style.display = "block";
    }
});

async function analyzeDream() {
    const dreamText = document.getElementById("dreamInput").value.trim();
    if (!dreamText) {
        alert("請先描述你的夢境喔！");
        return;
    }

    // 1. 檢查登入與扣款邏輯 (使用 main.js 提供的核心函數)
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (!currentUser) {
        alert("請先登入才能解夢喔！");
        window.location.href = '/auth'; // 真實網址跳轉至登入註冊頁
        return;
    }

    if (currentUser.balance < 10) {
        alert("餘額不足！解夢需要 10 元智幣，請先去迷宮尋寶賺取金幣！");
        return;
    }

    // 確定扣款
    currentUser.balance -= 10;
    
    // 透過 main.js 的全域函數自動同步儲存與更新
    if (typeof persistCurrentUser === 'function') {
        persistCurrentUser(currentUser);
    }

    // 更新 UI 顯示的餘額 (防錯機制)
    if (document.getElementById('dropdownUserBalance')) {
        document.getElementById('dropdownUserBalance').innerText = currentUser.balance + " 元智幣";
    }
    if (document.getElementById('modalUserBalance')) {
        document.getElementById('modalUserBalance').innerText = currentUser.balance + " 元智幣";
    }

    // 2. 切換 UI 狀態
    const submitBtn = document.getElementById("submitDreamBtn");
    const loadingDiv = document.getElementById("dreamLoading");
    const resultDiv = document.getElementById("dreamResult");

    submitBtn.style.display = "none";
    resultDiv.style.display = "none";
    loadingDiv.style.display = "block";

    // 3. 呼叫後端 API
    try {
        const response = await fetch('/api/dream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream: dreamText })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "解夢連線失敗");
        }

        // 4. 顯示結果
        loadingDiv.style.display = "none";
        resultDiv.style.display = "block";
        // 將換行符號轉為 <br>
        resultDiv.innerHTML = data.text.replace(/\n/g, '<br>');

        // 恢復按鈕（讓玩家可以重複解下一個夢）
        submitBtn.style.display = "block";
        submitBtn.innerText = "解開下一個夢境 (💰10)";
        document.getElementById("dreamInput").value = "";

    } catch (error) {
        console.error("解夢錯誤:", error);
        loadingDiv.style.display = "none";
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "<span style='color: #ff6464;'>潛意識訊號受到干擾，請稍後再試一次。</span>";
        submitBtn.style.display = "block";
    }
}
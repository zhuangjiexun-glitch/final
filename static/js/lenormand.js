// =====================
// 雷諾曼卡 - 獨立功能腳本
// =====================

const lenormandDeck = [
    { name: "騎士", icon: "🏇" }, { name: "幸運草", icon: "🍀" }, { name: "船", icon: "⛵" },
    { name: "房子", icon: "🏠" }, { name: "樹", icon: "🌳" }, { name: "雲", icon: "☁️" },
    { name: "蛇", icon: "🐍" }, { name: "棺材", icon: "⚰️" }, { name: "花束", icon: "💐" },
    { name: "鐮刀", icon: "🪃" }, { name: "鞭子", icon: "🪢" }, { name: "鳥", icon: "🐦" },
    { name: "小孩", icon: "👶" }, { name: "狐狸", icon: "🦊" }, { name: "熊", icon: "🐻" },
    { name: "星星", icon: "⭐" }, { name: "鸛鳥", icon: "🦩" }, { name: "狗", icon: "🐕" },
    { name: "塔", icon: "🗼" }, { name: "花園", icon: "⛲" }, { name: "山", icon: "⛰️" },
    { name: "交叉路", icon: "🛤️" }, { name: "老鼠", icon: "🐁" }, { name: "心", icon: "❤️" },
    { name: "戒指", icon: "💍" }, { name: "書", icon: "📘" }, { name: "信", icon: "✉️" },
    { name: "男人", icon: "👨" }, { name: "女人", icon: "👩" }, { name: "百合", icon: "⚜️" },
    { name: "太陽", icon: "☀️" }, { name: "月亮", icon: "🌙" }, { name: "鑰匙", icon: "🗝️" },
    { name: "魚", icon: "🐟" }, { name: "錨", icon: "⚓" }, { name: "十字架", icon: "✝️" }
];

let lenormandFlippedCount = 0;
let lenormandDrawnCards = [];
let currentLenormandQuestion = "";

// 頁面初始化：確保進入頁面時畫面狀態是乾淨的
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("lenormandQuestion")) {
        resetLenormandInit();
    }
});

function resetLenormandInit() {
    if (document.getElementById("lenormandQuestion")) {
        document.getElementById("lenormandQuestion").value = "";
        document.getElementById("lenormandQuestion").disabled = false;
        document.getElementById("lenormandCardsArea").style.display = "none";
        document.getElementById("lenormandCardsArea").innerHTML = "";
        document.getElementById("lenormandResult").style.display = "none";
        document.getElementById("lenormandLoading").style.display = "none";
        document.getElementById("drawLenormandBtn").style.display = "inline-block";
        document.getElementById("resetLenormandBtn").style.display = "none";
        document.getElementById("lenormandProgressText").style.display = "none";
    }
    lenormandFlippedCount = 0;
    lenormandDrawnCards = [];
}

// 直接進行下一場
function resetLenormand() {
    resetLenormandInit();
}

function startDrawLenormand() {
    currentLenormandQuestion = document.getElementById("lenormandQuestion").value.trim();
    if (!currentLenormandQuestion) {
        alert("請輸入你想占卜的問題喔！");
        return;
    }

    // 1. 檢查登入與扣款邏輯 (使用 main.js 提供的核心函數)
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (!currentUser) {
        alert("請先登入才能進行雷諾曼占卜！");
        window.location.href = '/auth'; // 真實網址跳轉至登入註冊頁
        return;
    }

    if (currentUser.balance < 20) {
        alert("餘額不足！需要 20 元智幣，請先去迷宮尋寶賺取金幣！");
        return;
    }

    // 確定扣款
    currentUser.balance -= 20;
    
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

    // 鎖定輸入框，隱藏按鈕
    document.getElementById("lenormandQuestion").disabled = true;
    document.getElementById("drawLenormandBtn").style.display = "none";

    // 洗牌與預抽 3 張牌 (先藏在背面)
    let deck = [...lenormandDeck].sort(() => Math.random() - 0.5);
    lenormandDrawnCards = [deck[0], deck[1], deck[2]];
    lenormandFlippedCount = 0;

    // 建立 3 張蓋著的牌
    const cardsArea = document.getElementById("lenormandCardsArea");
    cardsArea.innerHTML = "";
    cardsArea.style.display = "flex";

    lenormandDrawnCards.forEach((card, index) => {
        const cardContainer = document.createElement("div");
        cardContainer.className = "lenormand-card-container";
        cardContainer.onclick = function () { flipLenormandCard(this, index); };

        cardContainer.innerHTML = `
            <div class="lenormand-card-inner">
                <div class="lenormand-card-front">✨</div>
                <div class="lenormand-card-back">
                    <span>${card.icon}</span>${card.name}
                </div>
            </div>
        `;
        cardsArea.appendChild(cardContainer);
    });

    const progressText = document.getElementById("lenormandProgressText");
    progressText.style.display = "block";
    progressText.innerText = `請依序點擊翻開 3 張牌 (0/3)`;
}

function flipLenormandCard(cardElement, index) {
    // 避免重複點擊同一張牌
    if (cardElement.classList.contains("flipped")) return;

    // 翻牌動畫
    cardElement.classList.add("flipped");
    lenormandFlippedCount++;

    document.getElementById("lenormandProgressText").innerText = `請依序點擊翻開 3 張牌 (${lenormandFlippedCount}/3)`;

    // 如果 3 張都翻完了，自動觸發解牌 API
    if (lenormandFlippedCount === 3) {
        document.getElementById("lenormandProgressText").style.display = "none";

        // 稍微延遲一下，讓玩家看清楚最後一張牌，再開始 Loading
        setTimeout(() => {
            fetchLenormandAPI();
        }, 800);
    }
}

async function fetchLenormandAPI() {
    document.getElementById("lenormandLoading").style.display = "block";

    try {
        const cardNames = lenormandDrawnCards.map(c => c.name);
        const response = await fetch('/api/lenormand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: currentLenormandQuestion, cards: cardNames })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        document.getElementById("lenormandLoading").style.display = "none";
        const resultDiv = document.getElementById("lenormandResult");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = data.text.replace(/\n/g, '<br>');

        // 顯示直接進行下一場的按鈕
        document.getElementById("resetLenormandBtn").style.display = "inline-block";

    } catch (error) {
        document.getElementById("lenormandLoading").style.display = "none";
        const resultDiv = document.getElementById("lenormandResult");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "<span style='color: #ff6464;'>牌陣訊號受到干擾，請稍後再試。</span>";
        document.getElementById("resetLenormandBtn").style.display = "inline-block";
    }
}
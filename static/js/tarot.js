/* ===================== */
/* tarot.js - 塔羅占卜專屬邏輯 */
/* ===================== */

const tarotDeck = ["愚者", "魔術師", "女祭司", "皇后", "皇帝", "教皇", "戀人", "戰車", "力量", "隱者", "命運之輪", "正義", "倒吊人", "死神", "節制", "惡魔", "高塔", "星星", "月亮", "太陽", "審判", "世界"];
const tarotImages = {
    "愚者": "static/images/00_fool.png",
    "魔術師": "static/images/01_magician.png",
    "女祭司": "static/images/02_high_priestess.png",
    "皇后": "static/images/03_empress.png",
    "皇帝": "static/images/04_emperor.png",
    "教皇": "static/images/05_pope.png",
    "戀人": "static/images/06_lovers.png",
    "戰車": "static/images/07_chariot.png",
    "力量": "static/images/08_strength.png",
    "隱者": "static/images/09_hermit.png",
    "命運之輪": "static/images/10_wheel_of_fortune.png",
    "正義": "static/images/11_justice.png",
    "倒吊人": "static/images/12_hanged_man.png",
    "死神": "static/images/13_death.png",
    "節制": "static/images/14_temperance.png",
    "惡魔": "static/images/15_devil.png",
    "高塔": "static/images/16_tower.png",
    "星星": "static/images/17_star.png",
    "月亮": "static/images/18_moon.png",
    "太陽": "static/images/19_sun.png",
    "審判": "static/images/20_judgment.png",
    "世界": "static/images/21_world.png",
};

// 統一的牌背圖片路徑
const cardBackImageUrl = "static/images/card-back.jpg";
let currentQuestionType = "";
let drawnCards = [];

// 1. 開始占卜：洗牌並攤開扇形牌陣
function startDrawing(type) {
    currentQuestionType = type === 'love' ? '感情' : '事業';
    drawnCards = [];
    
    document.getElementById('questionTypeArea').style.display = 'none';
    document.getElementById('tarotDrawArea').style.display = 'flex';
    document.getElementById('tarotInstruction').innerText = `正在為你的【${currentQuestionType}】占卜...`;
    document.getElementById('selectionProgress').innerText = "請從下方牌陣憑直覺選出 3 張牌 (0/3)";

    const fanArea = document.getElementById('tarotFanArea');
    fanArea.innerHTML = ''; // 清空上一局的牌陣

    // 先將 22 張牌隨機洗牌
    let shuffledDeck = [...tarotDeck].sort(() => Math.random() - 0.5);

    const totalCards = shuffledDeck.length; // 22張
    const maxSpreadAngle = 65; // 扇形左右最大張開角度

    // 動態生成 22 張背面朝上的牌
    for (let i = 0; i < totalCards; i++) {
        let cardEl = document.createElement('div');
        cardEl.className = 'fan-card';
        
        // 計算這張牌在扇形中的角度
        let angle = -maxSpreadAngle + ((maxSpreadAngle * 2) / (totalCards - 1)) * i;
        
        cardEl.style.setProperty('--rot', `${angle}deg`);
        cardEl.style.zIndex = i + 1;
        
        // 把洗好的牌名藏在 dataset 裡面
        cardEl.dataset.cardName = shuffledDeck[i];
        
        // 綁定點擊事件
        cardEl.onclick = function() {
            selectCardFromFan(this);
        };
        
        fanArea.appendChild(cardEl);
    }
}

// 2. 玩家點擊扇形牌陣中的某張牌
function selectCardFromFan(cardElement) {
    if (drawnCards.length >= 3) return;
    if (cardElement.classList.contains('picked')) return;

    cardElement.classList.add('picked');
    
    const selectedCardName = cardElement.dataset.cardName;
    drawnCards.push(selectedCardName);
    
    const index = drawnCards.length - 1;
    
    const slotElement = document.getElementById(`slot-${index}`);
    const imageUrl = tarotImages[selectedCardName];
    slotElement.style.backgroundImage = `url('${imageUrl}')`;
    
    // 加上半透明黑底金字的牌名標籤
    slotElement.innerHTML = `
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0, 0, 0, 0.75); color: #ffd700; padding: 8px 0; font-size: 16px; font-weight: bold; text-align: center; border-top: 1px solid rgba(170, 120, 255, 0.5);">
            ${selectedCardName}
        </div>
    `;
    
    // 觸發 3D 翻轉動畫
    document.getElementById(`card-${index}`).classList.add('flipped');
    
    document.getElementById('selectionProgress').innerText = `請從下方牌陣憑直覺選出 3 張牌 (${drawnCards.length}/3)`;

    if (drawnCards.length === 3) {
        document.getElementById('tarotFanArea').style.pointerEvents = 'none';
        
        setTimeout(() => {
            document.getElementById('tarotFanArea').style.display = 'none';
            document.getElementById('selectionProgress').style.display = 'none';
            triggerAIInterpretation();
        }, 800); 
    }
}

// 3. 重置占卜
function resetTarot() {
    currentQuestionType = "";
    drawnCards = [];
    
    document.getElementById('questionTypeArea').style.display = 'flex';
    document.getElementById('tarotDrawArea').style.display = 'none';
    document.getElementById('tarotResultArea').style.display = 'none';
    document.getElementById('tarotFanArea').style.display = 'flex';
    document.getElementById('selectionProgress').style.display = 'block';
    document.getElementById('tarotFanArea').style.pointerEvents = 'auto'; 
    document.getElementById('tarotInstruction').innerText = "請選擇你想占卜的問題方向";
    
    const cards = [document.getElementById('card-0'), document.getElementById('card-1'), document.getElementById('card-2')];
    cards.forEach(card => card.classList.remove('flipped'));
}

// 4. 連線後端 AI 解牌
async function triggerAIInterpretation() {
    const currentUserStr = localStorage.getItem('destinyCurrentUser');
    
    if (!currentUserStr) {
        alert("請先登入才能進行塔羅占卜喔！");
        return;
    }

    let currentUser = JSON.parse(currentUserStr);

    if (currentUser.balance < 20) {
        alert("餘額不足！塔羅占卜需要 20 元智幣，請先去迷宮尋寶賺取金幣！");
        return;
    }

    currentUser.balance -= 20;
    localStorage.setItem('destinyCurrentUser', JSON.stringify(currentUser));

    let allUsers = JSON.parse(localStorage.getItem('destinyUsers')) || [];
    let userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].balance = currentUser.balance;
        localStorage.setItem('destinyUsers', JSON.stringify(allUsers));
    }

    if (document.getElementById('dropdownUserBalance')) {
        document.getElementById('dropdownUserBalance').innerText = currentUser.balance;
    }
    if (document.getElementById('modalUserBalance')) {
        document.getElementById('modalUserBalance').innerText = currentUser.balance;
    }

    document.getElementById('tarotInstruction').innerText = "牌陣已確認 (已扣除 20 元智幣)";
    document.getElementById('tarotResultArea').style.display = 'flex';
    document.getElementById('aiLoading').style.display = 'block';
    document.getElementById('aiExplanation').style.display = 'none';

    try {
        const response = await fetch('/api/tarot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question_type: currentQuestionType,
                cards: drawnCards 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "後端處理失敗");
        }

        document.getElementById('aiLoading').style.display = 'none';
        document.getElementById('aiExplanation').style.display = 'block';
        document.getElementById('aiExplanation').innerHTML = data.text.replace(/\n/g, '<br>');

    } catch (error) {
        console.error("占卜連線失敗:", error);
        document.getElementById('aiLoading').style.display = 'none';
        document.getElementById('aiExplanation').style.display = 'block';
        document.getElementById('aiExplanation').innerHTML = "星象似乎受到強烈干擾，無法順利解讀。請稍後再試一次。";
    }
}
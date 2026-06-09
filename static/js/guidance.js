/* ===================== */
/* guidance.js - 星光指引專屬邏輯 (5題完整版) */
/* ===================== */

// 所有測驗的資料庫
const allQuizData = {
    "self": {
        questions: [
            { question: "想像你正漫步在無垠的星空中，突然眼前出現了一顆閃閃發光的星星，它的顏色是？", options: [{ text: "溫暖耀眼的橘紅色", type: "A" }, { text: "靜謐深邃的幽藍色", type: "B" }, { text: "柔和包容的珍珠白", type: "C" }, { text: "神秘變幻的紫金色", type: "D" }] },
            { question: "這顆星星突然化作一陣光雨降落，你下意識的動作是？", options: [{ text: "伸出雙手，興奮地去迎接光芒", type: "A" }, { text: "靜靜站在原地，感受光雨落在身上的溫度", type: "B" }, { text: "閉上眼睛，在心中默默許下一個願望", type: "C" }, { text: "試圖用口袋或雙手將光芒收集起來", type: "D" }] },
            { question: "繼續往前走，你看到宇宙中漂浮著一面鏡子。當你望向鏡面，倒影呈現出什麼模樣？", options: [{ text: "長出雙翼、準備展翅高飛的自己", type: "A" }, { text: "被一層溫暖光罩溫柔包覆著的自己", type: "B" }, { text: "如同水波般自由變換各種型態的倒影", type: "C" }, { text: "一片深邃無垠、看不清具體輪廓的星系", type: "D" }] },
            { question: "當光芒散去後，星空給了你一把鑰匙。你覺得這把鑰匙能打開什麼？", options: [{ text: "一扇通往未知世界的冒險之門", type: "A" }, { text: "一個裝滿過去珍貴回憶的寶箱", type: "B" }, { text: "一座只屬於你自己的寧靜秘密花園", type: "C" }, { text: "一本記載著未來所有解答的無字天書", type: "D" }] },
            { question: "準備離開這片星空前，一個溫柔的聲音問你想帶走什麼。你的選擇是？", options: [{ text: "一簇永不熄滅的勇氣之火", type: "A" }, { text: "一顆散發寧靜氣息的發光原石", type: "B" }, { text: "一瓶能帶來美好夢境的星塵", type: "C" }, { text: "一只指引未知真相的神秘懷錶", type: "D" }] }
        ],
        results: {
            "A": { icon: "🔥", title: "恆星之炎", desc: "你目前的靈魂狀態充滿了能量與渴望。你不想被現狀束縛，有一股想要突破的衝動，擁有很強的行動力。", advice: "大膽邁出那一步，哪怕是逆風局，你也有翻盤的能力。將大目標拆解成微小的一步，開始行動吧！" },
            "B": { icon: "🛡️", title: "行星之盾", desc: "你現在的狀態偏向內斂與沉穩。你重視安全感，對於身邊的人事物有著強烈的責任心，試圖維持某種平衡。", advice: "允許自己有脆弱的時刻。不要對自己太嚴苛，退一步，給自己一點喘息的空間，答案自然會浮現。" },
            "C": { icon: "🕊️", title: "彗星之光", desc: "你擁有非常敏銳的情感與想像力。你容易被事物的美好感動，嚮往身心靈的自由，不喜歡被死板的規則束縛。", advice: "順著你的直覺走。想哭時就流淚，順應內心的流動也是一種勇敢。一閃而過的念頭，往往是宇宙的最佳提示。" },
            "D": { icon: "🔮", title: "星雲之謎", desc: "你正處於尋找深層意義的階段。你不只看表面，更喜歡探究背後的邏輯，有著極強的直覺與洞察力。", advice: "換個角度，放下執著。把能量收回到自己身上。失去或停滯有時是為了騰出空間，迎接更適合你的事物。" }
        }
    },
    "love": {
        questions: [
            { question: "在星空下的花園裡，你發現了一朵散發微光的花朵，它的狀態是？", options: [{ text: "熱烈且毫不保留地盛開著", type: "A" }, { text: "靜靜地含苞待放，等待時機", type: "B" }, { text: "周圍長滿了防禦的荊棘", type: "C" }, { text: "隨著微風飄散著發光的孢子", type: "D" }] },
            { question: "天際劃過兩道流星，你覺得它們的軌跡會如何交會？", options: [{ text: "激烈碰撞，綻放出無比絢爛的火花", type: "A" }, { text: "並肩飛行，保持著穩定且溫暖的距離", type: "B" }, { text: "短暫交會後，各自繼續探索廣闊的宇宙", type: "C" }, { text: "互相吸引環繞，跳著複雜而迷人的雙星之舞", type: "D" }] },
            { question: "突然一陣夜風吹來，此刻你最想和誰分享這片星空？", options: [{ text: "一個能與我熱烈討論未來的人", type: "A" }, { text: "一個即使不說話也覺得安心的人", type: "B" }, { text: "比起分享，我更想先獨自享受這份平靜", type: "C" }, { text: "一個剛認識不久、充滿未知與神秘感的人", type: "D" }] },
            { question: "你在花園深處找到一個古老的音樂盒，轉動發條後，傳出的旋律讓你感到？", options: [{ text: "心跳加速，充滿對未來的期待與熱情", type: "A" }, { text: "無比放鬆，彷彿被一條溫暖的毛毯包裹", type: "B" }, { text: "享受與自己獨處的寧靜，感到自由自在", type: "C" }, { text: "一股強烈的熟悉感，彷彿靈魂深處曾聽過", type: "D" }] },
            { question: "星光指引你走到一池泉水前，水面上的倒影呈現出什麼畫面？", options: [{ text: "兩個發光的剪影攜手奔跑", type: "A" }, { text: "一盞溫暖且持續燃燒的燈籠", type: "B" }, { text: "一個平靜且自信的自己", type: "C" }, { text: "兩道交織卻又各自獨立的星軌", type: "D" }] }
        ],
        results: {
            "A": { icon: "💫", title: "耀眼雙星", desc: "在感情中，你渴望直率與熱烈。你喜歡能和你並肩作戰、共同成長的夥伴，期待一段充滿動力與火花的關係。", advice: "展現你真實的熱情吧！主動表達你的感受，不需要過度掩飾，那個能接住你光芒的人正在靠近。" },
            "B": { icon: "🌙", title: "靜謐伴月", desc: "你嚮往細水長流的陪伴。比起轟轟烈烈的浪漫，你更看重長久的默契與安心感，願意花時間慢慢去了解一個人。", advice: "你的溫柔與耐心是你最大的魅力。不要因為周遭的節奏而焦慮，最好的緣分會在最適當的時機自然成熟。" },
            "C": { icon: "✨", title: "獨自閃耀", desc: "目前的你，重心更多放在自己身上。你非常珍視自己的獨立空間，認為先把自己照顧好，才能迎接健康的關係。", advice: "你現在的狀態非常棒！享受這段充實自我的時光，當你自身的光芒足夠耀眼，自然會吸引頻率相同的人。" },
            "D": { icon: "🌀", title: "靈魂共振", desc: "你對靈魂契合度有極高的要求。你不在乎世俗的條件，只尋求那個能瞬間理解你腦海中奇思妙想的靈魂。", advice: "保持你的獨特性。別為了迎合他人而改變自己的頻率，真正懂你的人，會愛上你原本的靈魂樣貌。" }
        }
    },
    "career": {
        questions: [
            { question: "你正駕駛一艘星際飛船，雷達顯示前方有未知星系，你的決定是？", options: [{ text: "調整推進器，加速前進搶先探索", type: "A" }, { text: "停留在軌道邊緣，先收集周邊數據", type: "B" }, { text: "開啟防護罩，尋找最安全的航線緩慢推進", type: "C" }, { text: "向星系發送友善訊號，等待回應後再行動", type: "D" }] },
            { question: "飛船的控制面板提示你需要升級一項裝備，你會優先選擇？", options: [{ text: "超光速引擎（提升效率與爆發力）", type: "A" }, { text: "萬能解析儀（提升知識與專業技能）", type: "B" }, { text: "絕對防護罩（提升穩定性與容錯率）", type: "C" }, { text: "隱形偽裝網（提升靈活度與適應力）", type: "D" }] },
            { question: "一場突如其來的隕石雨損壞了通訊系統，你的第一反應是？", options: [{ text: "立刻穿上太空衣，親自出艙進行極限搶修", type: "A" }, { text: "仔細分析錯誤代碼，找出最根本的故障原因", type: "B" }, { text: "冷靜啟動備用系統，並按照標準應急手冊處理", type: "C" }, { text: "靈活調度其他系統的能源，建立暫時的替代方案", type: "D" }] },
            { question: "抵達新星球後，你最希望在這裡達成的成就是什麼？", options: [{ text: "建立屬於自己的領地與規則", type: "A" }, { text: "解開這個星球隱藏的遠古謎團", type: "B" }, { text: "尋找並囤積珍貴的稀有資源", type: "C" }, { text: "繪製出完整的星系地圖與航線", type: "D" }] },
            { question: "任務結束準備離開前，你必須留下一個時光膠囊。你會放進去什麼？", options: [{ text: "象徵你克服萬難、插下勝利旗幟的紀錄影像", type: "A" }, { text: "裝滿你在這趟旅程中解析出的珍貴數據與研究成果", type: "B" }, { text: "詳細記錄你每日行程、資源分配與航行計畫的日誌", type: "C" }, { text: "一份你重新繪製、標註了全新捷徑與航線的特製星圖", type: "D" }] }
        ],
        results: {
            "A": { icon: "🚀", title: "破風前行", desc: "面對學習或目標，你是個標準的開創者。你有很強的企圖心與競爭意識，喜歡挑戰高難度，享受克服困難後的成就感。", advice: "保持你的衝勁，但記得偶爾停下來檢視方向。有時候「慢即是快」，確立好戰略再衝刺，會讓你事半功倍。" },
            "B": { icon: "🔭", title: "深淵探索", desc: "你是個充滿求知慾的探索者。比起表面的成績，你更在乎是否真正理解了背後的邏輯與底層知識，具備深耕專業的潛力。", advice: "你的專注力是極大的優勢。遇到卡關時，不妨暫時跳出原本的思維框架，與不同領域的人交流，會激發意想不到的靈感。" },
            "C": { icon: "🏰", title: "穩健築塔", desc: "你偏好步步為營的策略。你喜歡把基礎打得非常扎實，按照計畫按部就班地前進，不喜歡充滿不確定性的突發狀況。", advice: "你的自律與穩定令人安心。不過，未來充滿變數，試著在計畫中留一點彈性空間，容許自己犯點小錯，這是成長的必經之路。" },
            "D": { icon: "🧭", title: "星圖繪製", desc: "你擁有優秀的大局觀與靈活度。你很擅長整合資訊、規劃路線，能夠快速適應新環境，並找出最有效率的解決方案。", advice: "你的策略性思考很強大。目前的指引是：大膽跨出舒適圈，去接觸你未曾涉獵的跨領域知識，這會將你的視野提升到全新的高度。" }
        }
    }
};

let currentCategory = "";
let currentQIndex = 0;
let userScores = { "A": 0, "B": 0, "C": 0, "D": 0 };

function startGuidanceQuiz(category) {
    const quizCost = 10; // 這裡可以自由設定每次測驗要扣多少錢
    const currentUserStr = localStorage.getItem('destinyCurrentUser');
    
    if (!currentUserStr) {
        alert("請先登入才能進行星光指引喔！");
        return; // 未登入則攔截，不進入下一題
    }

    let currentUser = JSON.parse(currentUserStr);

    // 檢查元智幣是否足夠
    if (currentUser.balance < quizCost) {
        alert(`餘額不足！星光指引需要 ${quizCost} 元智幣，請先去迷宮尋寶賺取金幣！`);
        return; // 錢不夠則攔截
    }

    // 確定有錢，執行扣款
    currentUser.balance -= quizCost;
    
    // 將扣完錢的新資料存回當前使用者快取
    localStorage.setItem('destinyCurrentUser', JSON.stringify(currentUser));

    // 同步更新總資料庫 (destinyUsers) 裡的餘額
    let allUsers = JSON.parse(localStorage.getItem('destinyUsers')) || [];
    let userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].balance = currentUser.balance;
        localStorage.setItem('destinyUsers', JSON.stringify(allUsers));
    }

    // 更新網頁右上角與資訊欄的數字顯示
    if (document.getElementById('dropdownUserBalance')) {
        document.getElementById('dropdownUserBalance').innerText = currentUser.balance;
    }
    if (document.getElementById('modalUserBalance')) {
        document.getElementById('modalUserBalance').innerText = currentUser.balance;
    }
    
    currentCategory = category;
    currentQIndex = 0;
    userScores = { "A": 0, "B": 0, "C": 0, "D": 0 };
    
    document.getElementById('quizStartArea').style.display = 'none';
    document.getElementById('quizQuestionArea').style.display = 'flex';
    
    renderQuestion();
}

function renderQuestion() {
    const qData = allQuizData[currentCategory].questions[currentQIndex];
    document.getElementById('quizProgress').innerText = `${currentQIndex + 1} / ${allQuizData[currentCategory].questions.length}`;
    document.getElementById('quizQuestionText').innerText = qData.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    qData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.style.cssText = "background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(170, 120, 255, 0.4); color: rgba(255,255,255,0.9); padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; text-align: left; transition: 0.3s; width: 100%; font-family: inherit;";
        
        btn.onmouseover = function() { this.style.background = "rgba(170, 120, 255, 0.2)"; };
        btn.onmouseout = function() { this.style.background = "rgba(255, 255, 255, 0.05)"; };
        
        btn.onclick = () => selectOption(opt.type);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(type) {
    userScores[type]++;
    currentQIndex++;
    
    if (currentQIndex < allQuizData[currentCategory].questions.length) {
        renderQuestion();
    } else {
        calculateResult();
    }
}

// 注意這裡加上了 async
async function calculateResult() {
    document.getElementById('quizQuestionArea').style.display = 'none';
    document.getElementById('quizResultArea').style.display = 'flex';
    document.getElementById('quizLoading').style.display = 'block';
    document.getElementById('quizFinalContent').style.display = 'none';
    
    // 初始化花語區塊狀態
    document.getElementById('flowerLoading').style.display = 'block';
    document.getElementById('flowerMessage').style.display = 'none';
    
    let highestType = "A";
    let maxScore = 0;
    for (let type in userScores) {
        if (userScores[type] > maxScore) {
            maxScore = userScores[type];
            highestType = type;
        }
    }
    
    const resultData = allQuizData[currentCategory].results[highestType];
    
    // 模擬 1.5 秒的星象解讀時間
    setTimeout(async () => {
        document.getElementById('quizLoading').style.display = 'none';
        
        document.getElementById('resultIcon').innerText = resultData.icon;
        document.getElementById('resultTitle').innerText = resultData.title;
        document.getElementById('resultDesc').innerText = resultData.desc;
        document.getElementById('resultAdvice').innerText = resultData.advice;
        
        document.getElementById('quizFinalContent').style.display = 'block';
        
        // 結果卡片淡入動畫
        document.getElementById('quizFinalContent').animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 600, fill: 'forwards', easing: 'ease-out' });

        // 🌟 結果顯示後，立刻向後端請求 AI 專屬花語 🌟
        try {
            const response = await fetch('/api/guidance_flower', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: currentCategory, 
                    title: resultData.title,
                    desc: resultData.desc
                })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error);

            // 成功取得花語，隱藏 Loading，顯示文字
            document.getElementById('flowerLoading').style.display = 'none';
            document.getElementById('flowerMessage').style.display = 'block';
            document.getElementById('flowerMessage').innerHTML = `<strong>🌺 贈與你的專屬花語：</strong><br>${data.flower_text.replace(/\n/g, '<br>')}`;

        } catch (error) {
            console.error("AI 花語生成失敗:", error);
            // 如果連線失敗，給一個預設的浪漫回覆，不讓畫面壞掉
            document.getElementById('flowerLoading').style.display = 'none';
            document.getElementById('flowerMessage').style.display = 'block';
            document.getElementById('flowerMessage').innerHTML = "🌺 雖然宇宙的訊號微弱，但請相信，總有一朵花為你盛開。";
        }

    }, 1500);
}

function resetGuidanceQuiz() {
    document.getElementById('quizResultArea').style.display = 'none';
    document.getElementById('quizStartArea').style.display = 'block';
}
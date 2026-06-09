// ==========================================
// 🌟 祈福擲筊 - 獨立功能腳本
// ==========================================

// 1. 神明資料
const godDatabase = {
    "愛情": { name: "月下老人", img: "/static/images/love.png" },
    "學業": { name: "文昌帝君", img: "/static/images/study.png" },
    "事業": { name: "關聖帝君", img: "/static/images/work.png" },
    "財運": { name: "五路財神", img: "/static/images/money.png" }
};

// 2. 三個筊杯結果的陣列 
const jiaoChoices = ["聖筊", "沒筊", "笑筊"];
const jiaoImageMap = {
    "聖筊": "/static/images/sheng.png",
    "沒筊": "/static/images/mei.png",
    "笑筊": "/static/images/xiao.png"
};

// 3. 頁面載入時綁定所有事件
document.addEventListener("DOMContentLoaded", () => {
    
    // (A) 綁定下拉選單：選擇祈求項目時，顯示對應神明
    const jiaoSelect = document.getElementById("jiaoTypeSelector");
    if (jiaoSelect) {
        jiaoSelect.addEventListener("change", function () {
            const type = this.value;
            const godDisplay = document.getElementById("godDisplay");
            const godImg = document.getElementById("godImg");

            if (type && godDatabase[type]) {
                godDisplay.innerHTML = `守護神明：${godDatabase[type].name}`;
                godImg.src = godDatabase[type].img;
                godImg.style.display = "inline-block";
            } else {
                resetJiaoState();
            }
        });
    }

    // (B) 綁定按鈕：點擊開始擲筊
    const btnThrow = document.getElementById("btnThrowJiao");
    if (btnThrow) {
        btnThrow.addEventListener("click", triggerJiaoThrow);
    }
});

// 重置擲筊狀態
function resetJiaoState() {
    const jiaoSelect = document.getElementById("jiaoTypeSelector");
    if (jiaoSelect) jiaoSelect.value = "";
    
    if (document.getElementById("godDisplay")) document.getElementById("godDisplay").innerHTML = "";
    if (document.getElementById("godImg")) document.getElementById("godImg").style.display = "none";
    if (document.getElementById("jiaoImgDisplay")) document.getElementById("jiaoImgDisplay").style.display = "none";
    if (document.getElementById("jiaoResultText")) document.getElementById("jiaoResultText").innerHTML = "";
}

// 執行擲筊動畫與結果
function triggerJiaoThrow() {
    const jiaoSelect = document.getElementById("jiaoTypeSelector");
    
    // 防呆：如果沒選神明就按按鈕
    if (!jiaoSelect || !jiaoSelect.value) {
        alert("請先選擇你想祈求的項目喔！");
        return;
    }

    const btnThrow = document.getElementById("btnThrowJiao");
    const resultText = document.getElementById("jiaoResultText");
    const jiaoImg = document.getElementById("jiaoImgDisplay");

    if (!btnThrow || !resultText || !jiaoImg) return;

    // 播放動畫中的文字提示
    resultText.innerHTML = " 筊杯空中翻轉中... ";
    resultText.style.color = "white"; 
    btnThrow.disabled = true;

    // 隨機抽取結果
    const randomIndex = Math.floor(Math.random() * jiaoChoices.length);
    const finalResult = jiaoChoices[randomIndex];

    // 延遲 0.5 秒後顯示結果 (模擬擲筊時間)
    setTimeout(() => {
        jiaoImg.src = jiaoImageMap[finalResult];
        jiaoImg.style.display = "block";
        resultText.innerHTML = `結果：${finalResult}`;

        // 根據結果換顏色
        if (finalResult === "聖筊") {
            resultText.style.color = "#64ff64";
        } else {
            resultText.style.color = "#ff6464";
        }

        btnThrow.disabled = false;
    }, 500);
}
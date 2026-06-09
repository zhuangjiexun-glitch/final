// =====================
// 每日運勢
// =====================
const fortunePool = [
    { level: "大吉", score: 100, text: "今天適合做重大決定。" },
    { level: "大吉", score: 95, text: "你可能會遇見重要的人。" },
    { level: "小吉", score: 80, text: "今天財運不錯。" },
    { level: "小吉", score: 75, text: "最近的努力即將得到回報。" },
    { level: "普通", score: 50, text: "今天適合休息與放鬆。" },
    { level: "普通", score: 45, text: "有些事情不要太急。" },
    { level: "小凶", score: 30, text: "今天容易想太多。" },
    { level: "小凶", score: 25, text: "最近壓力有點大，記得休息。" },
    { level: "大凶", score: 10, text: "今天建議低調行事。" },
    { level: "大凶", score: 5, text: "避免做重大決策。" }
];

const iconMap = {
    "大吉": "🟢",
    "小吉": "🟡",
    "普通": "⚪",
    "小凶": "🟠",
    "大凶": "🔴"
};

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function initTodayFortune() {
    // 【加入防呆】先檢查這個畫面有沒有抽籤的結果區塊
    const resultDiv = document.getElementById("fortuneResult");
    if (!resultDiv) return;

    const todayKey = getTodayKey();
    const fortuneData = JSON.parse(localStorage.getItem("todayFortuneData"));

    if (
        fortuneData &&
        fortuneData.date === todayKey
    ) {
        const fortune = fortuneData.fortune;

        resultDiv.innerHTML = `
            <div style="font-size:60px;margin-bottom:10px;">
                ${iconMap[fortune.level]}
            </div>

            <h2 style="margin:10px 0;color:#ffd700;">
                ${fortune.level}
            </h2>

            <p style="font-size:18px;line-height:1.8;">
                ${fortune.text}
            </p>

            <div style="
                margin-top:15px;
                color:#64c8ff;
                font-size:14px;
            ">
                運勢分數：${fortune.score}
            </div>
        `;
    }
}

function getFortune() {
    // 【加入防呆】先檢查這個畫面有沒有抽籤的結果區塊
    const resultDiv = document.getElementById("fortuneResult");
    if (!resultDiv) return;

    const todayKey = getTodayKey();
    let fortuneData = JSON.parse(localStorage.getItem("todayFortuneData"));

    // 今天已抽過
    if (
        fortuneData &&
        fortuneData.date === todayKey
    ) {
        const fortune = fortuneData.fortune;

        resultDiv.innerHTML = `
            <div style="font-size:60px;margin-bottom:10px;">
                ${iconMap[fortune.level]}
            </div>

            <h2 style="margin:10px 0;color:#ffd700;">
                ${fortune.level}
            </h2>

            <p style="font-size:18px;line-height:1.8;">
                ${fortune.text}
            </p>

            <div style="
                margin-top:15px;
                color:#64c8ff;
                font-size:14px;
            ">
                運勢分數：${fortune.score}
            </div>
        `;

        generateFortuneCalendar();
        drawFortuneRadar();

        return;
    }

    // 今天第一次抽
    const fortune =
        fortunePool[
            Math.floor(
                Math.random() * fortunePool.length
            )
        ];

    fortuneData = {
        date: todayKey,
        fortune
    };

    localStorage.setItem(
        "todayFortuneData",
        JSON.stringify(fortuneData)
    );

    let history =
        JSON.parse(
            localStorage.getItem("fortuneHistory")
        ) || {};

    history[todayKey] = fortune.level;

    localStorage.setItem(
        "fortuneHistory",
        JSON.stringify(history)
    );

    resultDiv.innerHTML = `
        <div style="font-size:60px;margin-bottom:10px;">
            ${iconMap[fortune.level]}
        </div>

        <h2 style="margin:10px 0;color:#ffd700;">
            ${fortune.level}
        </h2>

        <p style="font-size:18px;line-height:1.8;">
            ${fortune.text}
        </p>

        <div style="
            margin-top:15px;
            color:#64c8ff;
            font-size:14px;
        ">
            運勢分數：${fortune.score}
        </div>
    `;

    generateFortuneCalendar();
    drawFortuneRadar();
}

// =====================
// 月曆運勢紀錄
// =====================

function generateFortuneCalendar() {
    console.log("generateFortuneCalendar");

    const calendar = document.getElementById("userFortuneCalendar");
    console.log("calendar =", calendar);

    // 【加入防呆】如果這頁找不到月曆元素，就直接退出，不要往下執行導致當機
    if (!calendar) return;

    const history =
        JSON.parse(
            localStorage.getItem("fortuneHistory")
        ) || {};

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    let html = `
    <div style="
        display:grid;
        grid-template-columns:repeat(7,1fr);
        gap:4px;
        font-size:11px;
    ">
    `;

    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const level =
            history[dateKey];

        html += `
        <div style="
            padding:4px;
            border-radius:6px;
            background:rgba(255,255,255,0.05);
            text-align:center;
            min-height:42px;
        ">
            <div>${day}</div>

            <div style="
                margin-top:2px;
                font-size:14px;
            ">
                ${level ? iconMap[level] : ""}
            </div>
        </div>
        `;
    }

    html += "</div>";

    calendar.innerHTML = html;
}

// =====================
// 雷達圖
// =====================

function drawFortuneRadar() {
    const radarElement = document.getElementById("fortuneRadar");
    
    // 【加入防呆】必須要有雷達圖的 HTML 元素，且有載入 Plotly 才能畫圖
    if (!radarElement || typeof Plotly === 'undefined') return;

    const fortuneData =
        JSON.parse(
            localStorage.getItem("todayFortuneData")
        );

    if (!fortuneData) return;

    const level =
        fortuneData.fortune.level;

    let values;

    switch (level) {

        case "大吉":
            values = [95, 90, 95, 90];
            break;

        case "小吉":
            values = [80, 75, 85, 80];
            break;

        case "普通":
            values = [60, 60, 60, 60];
            break;

        case "小凶":
            values = [40, 45, 35, 40];
            break;

        case "大凶":
            values = [20, 25, 15, 20];
            break;

        default:
            values = [50, 50, 50, 50];
    }

    Plotly.newPlot(
        "fortuneRadar",
        [{
            type: "scatterpolar",

            r: values,

            theta: [
                "愛情",
                "學業",
                "財運",
                "人際"
            ],

            fill: "toself"
        }],
        {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",

            polar: {
                domain: {
                    x: [0.0, 0.80],
                    y: [0.05, 0.95]
                },
                radialaxis: {
                    visible: true,
                    range: [0, 100],
                    showticklabels: false
                }
            },

            margin: {
                l: 40,
                r: 40,
                t: 20,
                b: 20
            },

            showlegend: false
        },
        {
            displayModeBar: false,
            responsive: true
        }
    );
}

// =====================
// 初始化
// =====================
document.addEventListener("DOMContentLoaded", () => {

    initTodayFortune();

    generateFortuneCalendar();

    const fortuneData =
        JSON.parse(
            localStorage.getItem("todayFortuneData")
        );

    if (
        fortuneData &&
        fortuneData.date === getTodayKey()
    ) {
        drawFortuneRadar();
    }
});
// =====================
// 迷宮RPG遊戲邏輯
// =====================

// 當進入 /rpg 頁面時，自動檢查登入狀態並啟動遊戲
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    
    // 防呆：只有在擁有 gameCanvas 的頁面 (rpg.html) 才執行
    if (canvas) {
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        
        if (!currentUser) {
            alert("請先登入才能前往看廣告拿幣喔！");
            window.location.href = '/auth'; // 沒登入踢回登入頁
            return;
        }

        // 確保畫布有抓到後，稍微延遲一下讓畫面渲染好再開始
        setTimeout(() => {
            initializeRpgGame(currentUser);
        }, 100);
    }
});

class MazeRpgGame {
    constructor(canvas, currentUser) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d"); // 取得 2D 繪圖環境
        this.width = canvas.width;
        this.height = canvas.height;
        this.currentUser = currentUser;
        
        // 遊戲狀態與數據
        this.earnedCoins = 0;      // 本局賺取的金幣
        this.gameRunning = true;   // 控制遊戲迴圈是否繼續執行
        this.showingQuiz = false;  // 是否正在顯示數學問答 (暫停玩家移動)
        this.mouthPhase = 0;       // 用於繪製角色 (類似小精靈) 的嘴巴開合動畫數值
        
        // 網格系統設定
        this.tileSize = 40;        // 每個地圖方塊的大小 (40x40 px)
        this.cols = Math.floor(this.width / this.tileSize);
        this.rows = Math.floor(this.height / this.tileSize);
        
        // 初始化各項系統
        this.initializeMaze();
        this.initializePlayer();
        this.initializeChests();
        this.setupControls();
        this.startGameLoop(); // 啟動畫面更新迴圈
    }

    initializeMaze() {
         // 迷宮牆壁矩陣（1代表牆壁，0代表通路）
        this.maze = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }

    initializePlayer() {
        this.player = {
            gridX: 1, gridY: 1, // 網格座標
            x: 1 * this.tileSize, y: 1 * this.tileSize, // 實際像素座標
            width: this.tileSize - 4, height: this.tileSize - 4, // 略小於方塊，避免卡牆
            speed: 2, direction: "right", // 移動速度與初始面向
        };
    }

    initializeChests() {
        this.chests = [];
        const emptyCells = [];
        
        // 找出地圖中所有可以通行的空地 (0)
        for (let row = 1; row < this.maze.length - 1; row++) {
            for (let col = 1; col < this.maze[row].length - 1; col++) {
                if (this.maze[row][col] === 0) {
                    if (row === 1 && col === 1) continue; // 避開玩家的出生點
                    emptyCells.push({ gridX: col, gridY: row });
                }
            }
        }
        
        // 將空地陣列打亂，實現隨機性
        emptyCells.sort(() => Math.random() - 0.5);
        // 最多生成 7 個寶箱
        const chestCount = Math.min(7, emptyCells.length);
        
        for (let index = 0; index < chestCount; index++) {
            const pos = emptyCells[index];
            this.chests.push({
                gridX: pos.gridX, gridY: pos.gridY,
                x: pos.gridX * this.tileSize, y: pos.gridY * this.tileSize,
                width: this.tileSize - 4, height: this.tileSize - 4,
                requiresQuiz: true, // 開啟寶箱需要答題
                reward: 15,         // 獎勵金幣數量
                opened: false,      // 是否已開啟
                id: index,
            });
        }
    }

    setupControls() {
        this.keys = {}; // 紀錄目前被按下的按鍵
        
        this.keydownHandler = (e) => {
            if (!this.gameRunning) return;
            this.keys[e.key] = true;
            // 按下 E 鍵時，嘗試開啟附近寶箱
            if (e.key === "e" || e.key === "E") this.tryOpenChest();
        };
        
        this.keyupHandler = (e) => { this.keys[e.key] = false; };
        
        document.addEventListener("keydown", this.keydownHandler);
        document.addEventListener("keyup", this.keyupHandler);
    }

    // 移除鍵盤監聽，避免記憶體外洩或重複觸發
    removeControls() {
        if (this.keydownHandler) document.removeEventListener("keydown", this.keydownHandler);
        if (this.keyupHandler) document.removeEventListener("keyup", this.keyupHandler);
    }

    tryOpenChest() {
        for (let chest of this.chests) {
            if (chest.opened) continue; // 已開啟的跳過
            
            // 計算玩家中心點與寶箱中心點的距離 (勾股定理)
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (chest.x + chest.width / 2),
                this.player.y + this.player.height / 2 - (chest.y + chest.height / 2)
            );
            
            // 如果距離小於 80 像素，判定為可互動範圍
            if (dist < 80) {
                chest.opened = true;
                if (chest.requiresQuiz) {
                    this.showMathQuiz(chest); // 彈出數學題
                } else {
                    this.earnCoins(chest.reward); // 直接給獎勵
                }
                return; // 一次只能開一個，開完直接中斷迴圈
            }
        }
    }

    showMathQuiz(chest) {
        this.showingQuiz = true; // 鎖定玩家移動
        this.currentQuizChest = chest; // 紀錄目前正在解鎖的寶箱
        
        // 隨機產生兩個 1~20 的數字與運算符號
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operators = ["+", "-", "*"];
        const operator = operators[Math.floor(Math.random() * operators.length)];

        // 計算正確答案
        let correctAnswer;
        if (operator === "+") correctAnswer = num1 + num2;
        else if (operator === "-") correctAnswer = num1 - num2;
        else correctAnswer = num1 * num2;

        // 生成選項 (包含正確答案與三個錯誤答案)
        const options = [correctAnswer];
        while (options.length < 4) {
            // 在正確答案周圍產生隨機誤差，並確保選項不重複且大於 0
            const wrongAnswer = correctAnswer + (Math.floor(Math.random() * 20) - 10);
            if (!options.includes(wrongAnswer) && wrongAnswer > 0) options.push(wrongAnswer);
        }
        options.sort(() => Math.random() - 0.5); // 將選項順序打亂

        // 將題目資料存入物件並呼叫 UI 顯示
        this.mathQuiz = {
            question: `${num1} ${operator} ${num2} = ?`,
            options: options, correctAnswer: correctAnswer,
        };
        this.displayMathModal();
    }

    displayMathModal() {
        const modal = document.getElementById("mathQuizModal");
        const questionEl = document.getElementById("mathQuestion");
        const optionsEl = document.getElementById("mathOptions");
        if (!modal) return;

        questionEl.textContent = this.mathQuiz.question;
        optionsEl.innerHTML = ""; // 清空舊選項

        // 動態生成按鈕
        this.mathQuiz.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.textContent = option;
            
            // 按鈕的 CSS 樣式設定
            btn.style.padding = "10px";
            btn.style.background = "linear-gradient(135deg, #9b5cff, #6f3cff)";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.borderRadius = "8px";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "bold";
            btn.style.transition = "all 0.2s ease";

            // 點擊選項的檢查邏輯
            btn.onclick = () => {
                if (option === this.mathQuiz.correctAnswer) {
                    this.earnCoins(this.currentQuizChest.reward);
                    alert("回答正確！獲得 " + this.currentQuizChest.reward + " 元智幣！");
                } else {
                    alert("回答錯誤，遺憾地未能獲得寶箱獎勵。"); // 答錯就沒獎勵了
                }
                modal.style.display = "none";
                this.showingQuiz = false; // 解除玩家移動鎖定
            };
            optionsEl.appendChild(btn);
        });
        modal.style.display = "flex";
    }

    // 更新左上角的分數顯示
    earnCoins(amount) {
        this.earnedCoins += amount;
        const balanceEl = document.getElementById("gameBalance");
        if (balanceEl) balanceEl.textContent = this.earnedCoins;
    }

    update() {
        if (this.showingQuiz) return; // 答題時不允許移動
        let dx = 0, dy = 0;

        // 偵測按鍵並改變期望位移 (dx, dy) 與面向
        if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) { dy -= this.player.speed; this.player.direction = "up"; }
        if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) { dy += this.player.speed; this.player.direction = "down"; }
        if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) { dx -= this.player.speed; this.player.direction = "left"; }
        if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) { dx += this.player.speed; this.player.direction = "right"; }

        // 獨立判斷 X 軸與 Y 軸，達成「滑牆」效果 (撞到牆還是可以沿著牆邊移動)
        if (dx !== 0 && this.canMove(this.player.x + dx, this.player.y)) this.player.x += dx;
        if (dy !== 0 && this.canMove(this.player.x, this.player.y + dy)) this.player.y += dy;

        // 更新網格座標
        this.player.gridX = Math.round(this.player.x / this.tileSize);
        this.player.gridY = Math.round(this.player.y / this.tileSize);
    }

    canMove(x, y) {
        const margin = 4; // 碰撞邊界縮減 (容錯率)，讓轉彎更滑順
        
        // 算出玩家四個角落所在的網格座標
        const left = Math.floor((x + margin) / this.tileSize);
        const right = Math.floor((x + this.player.width - margin - 1) / this.tileSize);
        const top = Math.floor((y + margin) / this.tileSize);
        const bottom = Math.floor((y + this.player.height - margin - 1) / this.tileSize);

        // 檢查是否超出地圖邊界
        if (x < 0 || x + this.player.width > this.width) return false;
        if (y < 0 || y + this.player.height > this.height) return false;

        // 檢查四個角落是否有碰到地圖中的 '1' (牆壁)
        if (this.maze[top] && this.maze[top][left] === 1) return false;
        if (this.maze[top] && this.maze[top][right] === 1) return false;
        if (this.maze[bottom] && this.maze[bottom][left] === 1) return false;
        if (this.maze[bottom] && this.maze[bottom][right] === 1) return false;

        return true;
    }

    draw() {
        // 畫背景顏色
        this.ctx.fillStyle = "rgba(20, 20, 40, 1)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 依序畫出迷宮、寶箱、玩家、提示文字
        this.drawMaze();
        this.drawChests();
        this.drawPlayer();
        this.drawHints();
    }

    // 繪製地圖牆壁
    drawMaze() {
        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                if (this.maze[row][col] === 1) {
                    this.ctx.fillStyle = "rgba(170, 120, 255, 0.5)"; // 填充紫色半透明
                    this.ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = "rgba(170, 120, 255, 0.8)"; // 繪製牆壁邊框
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }

    // 繪製寶箱
    drawChests() {
        this.chests.forEach((chest) => {
            // 如果已開啟就變成灰色，未開啟則是金色
            if (chest.opened) this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
            else this.ctx.fillStyle = "rgba(255, 215, 0, 0.7)";
            this.ctx.fillRect(chest.x + 2, chest.y + 2, chest.width, chest.height);
            
            this.ctx.strokeStyle = chest.opened ? "rgba(100, 100, 100, 0.8)" : "rgba(255, 215, 0, 1)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(chest.x + 2, chest.y + 2, chest.width, chest.height);
            
            // 繪製寶箱上的文字 (圖示)
            this.ctx.fillStyle = chest.opened ? "rgba(100, 100, 100, 1)" : "rgba(255, 200, 0, 1)";
            this.ctx.font = "20px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(chest.opened ? "✓" : "💰", chest.x + chest.width / 2, chest.y + chest.height / 2);
        });
    }

    // 繪製玩家 (類似小精靈的開口圓形)
    drawPlayer() {
        this.mouthPhase += 0.2; // 改變相位，讓嘴巴隨時間變動
        const mouthAngle = 0.2 + Math.sin(this.mouthPhase) * 0.15; // 使用 sin 函數計算嘴巴開合角度
        
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        const radius = this.player.width / 2 - 2;

        let startAngle = mouthAngle;
        let endAngle = Math.PI * 2 - mouthAngle;
        let eyeX = centerX + radius * 0.2;
        let eyeY = centerY - radius * 0.35;

        // 根據面向方向，旋轉開口的角度與眼睛的位置
        if (this.player.direction === "left") {
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI * 3 - mouthAngle;
            eyeX = centerX - radius * 0.2;
            eyeY = centerY - radius * 0.35;
        } else if (this.player.direction === "up") {
            startAngle = -Math.PI / 2 + mouthAngle;
            endAngle = Math.PI * 1.5 - mouthAngle;
            eyeX = centerX + radius * 0.2;
            eyeY = centerY - radius * 0.2;
        } else if (this.player.direction === "down") {
            startAngle = Math.PI / 2 + mouthAngle;
            endAngle = Math.PI * 2.5 - mouthAngle;
            eyeX = centerX + radius * 0.2;
            eyeY = centerY + radius * 0.2;
        }

        // 畫身體
        this.ctx.fillStyle = "rgba(100, 150, 255, 0.95)";
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.closePath();
        this.ctx.fill();

        // 畫眼白
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.beginPath();
        this.ctx.arc(eyeX, eyeY, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();

        // 畫瞳孔
        this.ctx.fillStyle = "rgba(12, 8, 30, 0.95)";
        this.ctx.beginPath();
        this.ctx.arc(eyeX, eyeY, radius * 0.07, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 在畫面上方顯示操作提示
    drawHints() {
        let nearbyChest = null;
        for (let chest of this.chests) {
            if (chest.opened) continue;
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (chest.x + chest.width / 2),
                this.player.y + this.player.height / 2 - (chest.y + chest.height / 2)
            );
            // 如果玩家非常靠近未開的寶箱，將其紀錄起來
            if (dist < 80) { nearbyChest = chest; break; }
        }
        
        // 若有靠近寶箱，在畫面正上方顯示提示文字
        if (nearbyChest) {
            this.ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
            this.ctx.font = "14px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("靠近寶箱！按 E 打開", this.width / 2, 30);
        }
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update(); // 處理座標移動、數值改變
            this.draw();   // 根據新數值畫出畫面
            if (this.gameRunning) requestAnimationFrame(gameLoop); // 不斷呼叫自己
        };
        gameLoop();
    }
}

// 存放當前遊戲實例的全域變數
let currentGame = null;

function initializeRpgGame(currentUser) {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // 如果畫面上已經有舊的遊戲，將其停用並移除按鍵監聽，防止疊加運算
    if (currentGame) {
        currentGame.gameRunning = false;
        currentGame.removeControls();
    }
    
    // 實例化新的遊戲
    try {
        currentGame = new MazeRpgGame(canvas, currentUser);
    } catch (error) {
        console.error("❌ 遊戲初始化失敗:", error);
    }
}

function endRpgGame() {
    if (currentGame) {
        const currentUser = getCurrentUser();
        // 結算金幣並存入使用者帳戶
        if (currentUser && currentGame.earnedCoins > 0) {
            currentUser.balance = (typeof currentUser.balance === "number" ? currentUser.balance : 0) + currentGame.earnedCoins;
            persistCurrentUser(currentUser);
            if(typeof updateAvatarDropdownInfo === 'function') updateAvatarDropdownInfo(currentUser);
        }
        
        // 清理遊戲實例
        currentGame.gameRunning = false;
        currentGame.removeControls();
        currentGame = null;
    }
    
    // 確保如果離開時數學題視窗還開著，將它強制關閉
    const mathModal = document.getElementById("mathQuizModal");
    if (mathModal) {
        mathModal.style.display = "none";
    }
    
    // 退回大廳
    window.location.href = '/';
}
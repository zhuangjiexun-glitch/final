// =====================
// 星空生成
// =====================

const starsContainer = document.getElementById("stars");
if (starsContainer) {
    for (let i = 0; i < 180; i++) {
        const star = document.createElement("div");
        star.classList.add("star");

        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";

        star.style.animationDuration = (Math.random() * 3 + 2) + "s";

        star.style.opacity = Math.random();

        starsContainer.appendChild(star);
    }
}

// =====================
// 頁面切換核心
// 負責控制各個功能的顯示與隱藏，類似單頁應用程式 (SPA) 的路由概念
// =====================

function goTo(type) {
    if (type === "fortune") {
        showPage("fortunePage");
    } else if (type === "register") {
        showPage("authPage");
        if (typeof setAuthMode === 'function') setAuthMode("register");
    } else if (type === "login") {
        showPage("authPage");
        if (typeof setAuthMode === 'function') setAuthMode("login");
    } else if (type === "rpg") {
        // RPG 遊戲可能有獨立的開啟邏輯
        if (typeof openRpgPage === 'function') openRpgPage();
    } else if (type === "tarot") {
        showPage("tarotScreen");
        document.getElementById('tarotScreen').style.display = 'flex';
        if (typeof resetTarot === 'function') resetTarot();
    } else if (type === "ai") {
        showPage("geniePage");
        document.getElementById('geniePage').style.display = 'flex';
        if (typeof resetGenieGame === 'function') resetGenieGame();
    } else if (type === "jiao") {
        showPage("jiaoPage");
        document.getElementById("jiaoPage").style.display = "flex";
        if (typeof resetJiaoState === 'function') resetJiaoState();
    } else {
        showPage("lobbyPage");
    }
}

// 快速回到大廳的簡便函式
function backLobby() {
    showPage("lobbyPage");
}

let showPage = function (pageId) {
    const pages = ["lobbyPage", "fortunePage", "rpgPage", "authPage", "tarotScreen", "geniePage", "jiaoPage"];
    pages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === pageId ? "flex" : "none";
        }
    });
};

// =====================
// 使用者全域資料與狀態
// 負責處理登入狀態、資料儲存與相關 UI 更新
// =====================

function persistCurrentUser(user) {
    if (!user) return;
    localStorage.setItem("destinyCurrentUser", JSON.stringify(user)); // 存入本機儲存空間
    
    // 如果有外部定義的資料庫模組 (userDataStore)，同步更新裡面的使用者餘額
    if (window.userDataStore) {
        const users = userDataStore.getUsers();
        // 尋找相同 Email 的使用者
        const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (index !== -1) {
            // 更新該使用者的餘額資料並回存
            users[index] = { ...users[index], balance: user.balance };
            localStorage.setItem(userDataStore.STORAGE_KEY, JSON.stringify(users));
        }
    }
}

function getCurrentUser() {
    const raw = localStorage.getItem("destinyCurrentUser");
    try {
        return raw ? JSON.parse(raw) : null; // 將字串解析回 JSON 物件
    } catch (error) {
        return null; // 若解析失敗則視為未登入
    }
}

function loginUser(user) {
    persistCurrentUser(user);
    updateModalUser(user);          // 更新個人資訊彈出視窗
    updateAvatarDropdownInfo(user); // 更新右上角頭像下拉選單資訊
}

function logout() {
    localStorage.removeItem("destinyCurrentUser");
    hideUserModal();
    hideAvatarMenu();
    updateAuthButtons();
    showPage("lobbyPage");
}

function updateModalUser(user) {
    const modalName = document.getElementById("modalUserName");
    const modalEmail = document.getElementById("modalUserEmail");
    const modalRegistered = document.getElementById("modalUserRegistered");
    const modalBalance = document.getElementById("modalUserBalance");

    if (modalName) modalName.textContent = user.name || "-";
    if (modalEmail) modalEmail.textContent = user.email || "-";
    // 將註冊時間的時間戳記轉換為當地時間格式
    if (modalRegistered) modalRegistered.textContent = new Date(user.registeredAt).toLocaleString();
    // 確保餘額顯示為數字
    if (modalBalance) modalBalance.textContent = (typeof user.balance === "number" ? user.balance : 0) + " 元智幣";
}

// 切換個人資訊彈出視窗的顯示狀態
function toggleUserModal() {
    const modal = document.getElementById("userModal");
    if (!modal) return;
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

// 隱藏個人資訊彈出視窗
function hideUserModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.style.display = "none";
}

function updateAuthButtons() {
    const currentUser = getCurrentUser();
    const loginButton = document.getElementById("loginTopBtn");
    const registerButton = document.getElementById("registerTopBtn");
    const avatarDropdown = document.getElementById("avatarDropdown");
    const welcomeText = document.getElementById("welcomeText");

    if (currentUser) {
        // 已登入：隱藏登入註冊按鈕，顯示頭像與歡迎詞
        if (loginButton) loginButton.style.display = "none";
        if (registerButton) registerButton.style.display = "none";
        if (avatarDropdown) {
            avatarDropdown.style.display = "inline-block";
            updateAvatarDropdownInfo(currentUser);
        }
        if (welcomeText) welcomeText.textContent = "歡迎，" + currentUser.name + "";
    } else {
        // 未登入：顯示登入註冊按鈕，隱藏頭像與歡迎詞
        if (loginButton) loginButton.style.display = "inline-flex";
        if (registerButton) registerButton.style.display = "inline-flex";
        if (avatarDropdown) avatarDropdown.style.display = "none";
        if (welcomeText) welcomeText.textContent = "";
    }
}

// =====================
// 頭像相關功能
// =====================

function updateAvatarDropdownInfo(user) {
    const nameEl = document.getElementById("dropdownUserName");
    if (nameEl) nameEl.textContent = user.name || "-";
    const emailEl = document.getElementById("dropdownUserEmail");
    if (emailEl) emailEl.textContent = user.email || "-";
    const registeredEl = document.getElementById("dropdownUserRegistered");
    if (registeredEl) registeredEl.textContent = new Date(user.registeredAt).toLocaleString();
    const balanceEl = document.getElementById("dropdownUserBalance");
    
    if (balanceEl) {
        const balance = typeof user.balance === "number" ? user.balance : 0;
        balanceEl.textContent = balance + " 元智幣";
    }
    
    // 若使用者有設定頭像圖片(通常是 base64 字串)，則更新 <img> 來源
    if (user.avatar) {
        const avatarImg = document.getElementById("avatarImg");
        if (avatarImg) avatarImg.src = user.avatar;
    }
}

function toggleAvatarMenu() {
    const menu = document.getElementById("avatarMenu");
    const btn = document.querySelector(".avatar-btn");
    if (!menu) return;
    
    if (menu.style.display === "flex" || menu.style.display === "") {
        menu.style.display = "none"; // 關閉選單
        if (btn) btn.classList.remove("active");
    } else {
        menu.style.display = "flex"; // 開啟選單
        if (btn) btn.classList.add("active");
        menu.style.flexDirection = "column"; // 確保選單內容垂直排列
    }
}

function hideAvatarMenu() {
    const menu = document.getElementById("avatarMenu");
    const btn = document.querySelector(".avatar-btn");
    if (menu) {
        menu.style.display = "none";
        if (btn) btn.classList.remove("active");
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0]; // 取得選擇的檔案
    if (!file) return;
    
    // 檢查檔案類型是否為圖片
    if (!file.type.startsWith("image/")) {
        alert("請選擇圖片檔案！");
        return;
    }
    
    // 限制圖片大小不可超過 2MB (2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("圖片檔案過大，請選擇小於2MB的圖片！");
        return;
    }
    
    // 使用 FileReader 將圖片轉換為 Base64 格式 (DataURL)
    const reader = new FileReader();
    reader.onload = function (e) {
        const avatarData = e.target.result; // 轉換後的圖片字串
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        // 更新使用者物件並存回 localStorage
        currentUser.avatar = avatarData;
        persistCurrentUser(currentUser);
        
        // 即時更新畫面上的頭像圖片
        const avatarImg = document.getElementById("avatarImg");
        if (avatarImg) avatarImg.src = avatarData;
        alert("頭像已更新！");
    };
    reader.readAsDataURL(file); // 啟動讀取動作
}

// 點擊頁面其他位置時，自動關閉頭像下拉選單
document.addEventListener("click", (event) => {
    const avatarDropdown = document.getElementById("avatarDropdown");
    const avatarMenu = document.getElementById("avatarMenu");
    // 如果點擊的目標不在 avatarDropdown 容器內，且選單是開啟的，就關閉它
    if (avatarDropdown && avatarMenu && !avatarDropdown.contains(event.target)) {
        if (avatarMenu.style.display === "flex") {
            hideAvatarMenu();
        }
    }
});

// 當頁面切換時，覆寫 (Monkey Patch) 原本的 showPage 函式，確保跳頁時隱藏下拉選單
const originalShowPage = showPage;
showPage = function (pageId) {
    originalShowPage(pageId); // 執行原本的切換邏輯
    hideAvatarMenu();         // 附加關閉選單的動作
};

// =====================
// 全域事件初始化
// 當網頁 HTML 載入完成後執行
// =====================
document.addEventListener("DOMContentLoaded", () => {
    updateAuthButtons(); // 根據登入狀態初始化上方按鈕
    
    // 如果已有登入狀態，預先填入使用者資料到畫面中
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateModalUser(currentUser);
        updateAvatarDropdownInfo(currentUser);
    }
    
    // 點擊使用者資訊彈出視窗 (Modal) 的半透明背景時，自動關閉視窗
    const modal = document.getElementById("userModal");
    if (modal) {
        modal.addEventListener("click", event => {
            // 確認點擊的是背景本身，而非裡面的內容框
            if (event.target === modal) hideUserModal();
        });
    }
});
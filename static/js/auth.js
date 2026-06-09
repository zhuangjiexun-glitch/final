// =====================
// 登入與註冊介面切換
// 負責根據傳入的模式 (login 或 register) 切換對應的表單與標題
// =====================
function setAuthMode(mode) {
    // 取得畫面上與登入/註冊相關的所有 DOM 元素
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const registerMeta = document.getElementById("registerMeta"); // 註冊額外資訊 (例如：已註冊人數)
    const authTabRegister = document.getElementById("authTabRegister"); // 註冊頁籤按鈕
    const authTabLogin = document.getElementById("authTabLogin");       // 登入頁籤按鈕
    const registerAlert = document.getElementById("registerAlert");     // 註冊提示訊息框
    const loginAlert = document.getElementById("loginAlert");           // 登入提示訊息框

    // 切換模式時，先隱藏所有先前的提示訊息
    if (registerAlert) registerAlert.style.display = "none";
    if (loginAlert) loginAlert.style.display = "none";
    if (!authTitle) return; // 防錯機制：如果找不到標題元素，代表不在該頁面，直接中斷執行

    if (mode === "login") {
        // --- 設定為「登入」模式 ---
        authTitle.textContent = "🔐 使用者登入";
        authSubtitle.textContent = "請輸入已註冊的電子郵件與密碼。";
        registerForm.style.display = "none";  // 隱藏註冊表單
        loginForm.style.display = "flex";     // 顯示登入表單
        registerMeta.style.display = "none";  // 隱藏註冊額外資訊
        
        // 切換頁籤的視覺狀態 (CSS class)
        authTabRegister.classList.remove("auth-active");
        authTabLogin.classList.add("auth-active");
    } else {
        // --- 設定為「註冊」模式 ---
        authTitle.textContent = "📝 會員註冊";
        authSubtitle.textContent = "留下姓名與信箱。";
        registerForm.style.display = "flex";  // 顯示註冊表單
        loginForm.style.display = "none";     // 隱藏登入表單
        registerMeta.style.display = "block"; // 顯示註冊額外資訊
        
        // 切換頁籤的視覺狀態 (CSS class)
        authTabRegister.classList.add("auth-active");
        authTabLogin.classList.remove("auth-active");
    }
}

// =====================
// 註冊人數更新
// 讀取資料庫中的使用者總數並更新到畫面上
// =====================
function updateRegisteredCount() {
    const countElement = document.getElementById("registeredCount");
    // 確保元素存在，且有掛載自訂的資料庫模組 userDataStore
    if (countElement && window.userDataStore) {
        countElement.innerText = userDataStore.getUsers().length; // 取得陣列長度即為總人數
    }
}

// =====================
// 提示訊息功能
// 負責顯示成功或失敗的文字提示
// =====================

function showRegisterAlert(message, isError = false) {
    const alert = document.getElementById("registerAlert");
    if (!alert) return;
    alert.textContent = message; // 設定提示文字
    alert.className = "register-alert" + (isError ? " error" : " success"); // 動態切換 CSS 類別
    alert.style.display = "block"; // 顯示訊息框
}

function showLoginAlert(message, isError = false) {
    const alert = document.getElementById("loginAlert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = "register-alert" + (isError ? " error" : " success");
    alert.style.display = "block";
}

// =====================
// 表單送出與事件初始化
// 網頁載入完成後綁定按鈕與表單動作
// =====================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. 綁定註冊表單的送出事件 ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", event => {
            event.preventDefault(); // 阻止表單預設的重新整理行為

            // 取得使用者輸入的值，並用 trim() 去除前後多餘的空白
            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value; // 密碼通常不去空白

            // 基本的防呆檢查：確認所有欄位都有填寫
            if (!name || !email || !password) {
                showRegisterAlert("請完整填寫所有欄位。", true);
                return;
            }

            // 呼叫外部的 userDataStore 模組來儲存使用者資料
            const result = userDataStore.saveUser({ name, email, password });

            // 若儲存失敗 (例如 Email 已被註冊)，顯示錯誤訊息
            if (!result.success) {
                showRegisterAlert(result.error, true);
                return;
            }

            // 註冊成功後的處理流程
            showRegisterAlert("註冊成功！已儲存你的會員資料。", false);
            updateRegisteredCount(); // 更新畫面的註冊人數
            registerForm.reset();    // 清空表單欄位
        });
    }

    // --- 2. 綁定登入表單的送出事件 ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault(); // 阻止表單預設的重新整理行為

            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            // 防呆檢查
            if (!email || !password) {
                showLoginAlert("請完整填寫所有欄位。", true);
                return;
            }

            // 呼叫外部的 userDataStore 模組來驗證帳號密碼
            const result = userDataStore.authenticate(email, password);
            
            // 驗證失敗 (例如密碼錯誤或找不到帳號)
            if (!result.success) {
                showLoginAlert(result.error, true);
                return;
            }

            // 驗證成功後的處理流程
            loginUser(result.user);
            showLoginAlert("登入成功！歡迎回來，" + result.user.name + "。", false);

            setTimeout(() => {
                showPage("lobbyPage");
                updateAuthButtons(); // 更新上方導覽列的登入狀態按鈕
            }, 800);
        });
    }

    // --- 3. 初始畫面設定 ---
    updateRegisteredCount(); // 剛進頁面時，先載入一次目前的註冊人數
    if (document.getElementById("authTitle")) {
        setAuthMode("register"); // 預設顯示「註冊」表單
    }
});
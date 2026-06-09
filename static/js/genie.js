// =====================
// 神燈精靈 - 遊戲函數
// =====================

// 重置神燈精靈遊戲
window.resetGenieGame = function() {
    document.getElementById('genieStartArea').style.display = 'flex';
    document.getElementById('genieGameArea').style.display = 'none';
    document.getElementById('genieResultArea').style.display = 'none';
    document.getElementById('genieLoading').style.display = 'none';
    document.getElementById('genieSubtitle').innerText = '請心想一個人物，我會試著猜出你想的是誰';
};

// 開始神燈精靈遊戲
window.startGenieGame = async function() {
    const currentUserStr = localStorage.getItem('destinyCurrentUser');

    if (!currentUserStr) {
        alert("請先登入才能招喚神燈精靈喔！");
        return;
    }

    let currentUser = JSON.parse(currentUserStr);

    if (currentUser.balance < 15) {
        alert("餘額不足！召喚神燈精靈需要 15 元智幣，請先去迷宮尋寶賺取金幣！");
        return;
    }
    try {
        const oldAlerts = document.querySelectorAll('.genie-error-alert, .genie-quota-alert');
        oldAlerts.forEach(alert => alert.remove());

        document.getElementById('genieStartArea').style.display = 'none';
        document.getElementById('genieGameArea').style.display = 'flex';
        document.getElementById('genieLoading').style.display = 'block';
        document.getElementById('genieCurrentQuestion').innerText = '正在初始化...';
        document.getElementById('genieYesBtn').disabled = true;
        document.getElementById('genieNoBtn').disabled = true;

        // 調用後端 API 初始化遊戲
        const response = await fetch('/api/genie/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();


        if (response.status === 429 || data.error_code === 'QUOTA_EXCEEDED') {
            throw new Error(data.error || '神燈精靈忙碌中，請稍後再試');
        }

        if (!response.ok) {
            throw new Error(data.error || '遊戲初始化失敗');
        }
        currentUser.balance -= 15;

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







        // 隱藏 Loading，顯示第一個問題
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieCurrentQuestion').innerText = data.question;
        document.getElementById('genieQuestionCount').innerText = data.question_count;
        document.getElementById('genieMaxQuestions').innerText = data.max_questions;
        document.getElementById('genieYesBtn').disabled = false;
        document.getElementById('genieNoBtn').disabled = false;

    } catch (error) {
        console.error('神燈精靈初始化錯誤:', error);
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieGameArea').style.display = 'none';
        document.getElementById('genieStartArea').style.display = 'flex';

        // 顯示錯誤提示
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
        alertDiv.innerHTML = `${error.message}`;
        alertDiv.className = 'genie-error-alert';
        document.getElementById('genieStartArea').appendChild(alertDiv);
    }
};

// 回答神燈精靈的問題
window.answerGenie = async function(answer) {
    try {
        // 【修複】強制刪除所有舊的配額和錯誤提示
        const allAlerts = document.querySelectorAll('.genie-quota-alert, .genie-error-alert');
        allAlerts.forEach(alert => alert.remove());

        document.getElementById('genieLoading').style.display = 'block';
        document.getElementById('genieYesBtn').disabled = true;
        document.getElementById('genieNoBtn').disabled = true;

        // 調用後端 API 處理回答
        const response = await fetch('/api/genie/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answer: answer
            })
        });

        const data = await response.json();

        // 檢查是否配額超限
        if (response.status === 429 || data.error_code === 'QUOTA_EXCEEDED') {
            document.getElementById('genieLoading').style.display = 'none';
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;

            // 顯示配額超限提示
            const newQuotaAlert = document.createElement('div');
            newQuotaAlert.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
            newQuotaAlert.innerHTML = `${data.error}`;
            newQuotaAlert.className = 'genie-quota-alert';

            document.getElementById('genieGameArea').appendChild(newQuotaAlert);

            return;
        }

        if (!response.ok) {
            throw new Error(data.error || '答題失敗');
        }

        document.getElementById('genieLoading').style.display = 'none';

        // 檢查遊戲狀態
        if (data.status === 'guessing') {
            // 精靈在猜測 - 詢問玩家確認
            document.getElementById('genieCurrentQuestion').innerText = data.question;
            document.getElementById('genieQuestionCount').innerText = data.question_count;
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;
        } else if (data.status === 'correct') {
            // 精靈猜對了
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">🎉 恭喜！🎉</div>
                <p style="color: #64ff64; font-weight: bold; font-size: 18px; margin-bottom: 10px;">${data.message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我用了 ${data.question_count} 個問題就猜出來了！</p>
            `;
        } else if (data.status === 'give_up') {
            // 精靈放棄了
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">😅 我認輸了</div>
                <p>${data.message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我問了 ${data.question_count} 個問題還是沒有猜出來。</p>
            `;
        } else if (data.status === 'game_over') {
            // 達到問題上限
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">我認輸了</div>
                <p>${data.final_message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我已經用完了所有 20 個問題。</p>
            `;
        } else {
            // 繼續遊戲（正常問題）
            document.getElementById('genieCurrentQuestion').innerText = data.question;
            document.getElementById('genieQuestionCount').innerText = data.question_count;
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;
        }

    } catch (error) {
        console.error('神燈精靈答題錯誤:', error);
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieYesBtn').disabled = false;
        document.getElementById('genieNoBtn').disabled = false;

        // 顯示錯誤提示
        const errorAlert = document.createElement('div');
        errorAlert.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
        errorAlert.innerHTML = `⏳ ${error.message}`;
        errorAlert.className = 'genie-error-alert';

        document.getElementById('genieGameArea').appendChild(errorAlert);
    }
};
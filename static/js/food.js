/* ===================== */
/* food.js - 今天吃什麼 (jQuery 雙模式版) */
/* ===================== */

const moodFoodDictionaries = {
    "joy": "頂級和牛燒肉, 豪華綜合生魚片, 黑松露義大利麵, 威靈頓牛排, 法式龍蝦濃湯, 頂級壽喜燒, 碳烤鰻魚飯, 草莓千層蛋糕, 烤松阪豬, 魚子醬精緻點心, 鮑魚燉雞湯, 義式提拉米蘇, 帝王蟹腳, 香檳或氣泡酒, 港式飲茶拼盤, 法式舒芙蕾, 極品佛跳牆, 迷迭香烤羊排, 炙燒烏魚子, 頂級干貝漢堡, 燕窩甜湯, 紅酒燉牛肉, 威士忌生巧克力, 瑞士起司火鍋, 海膽手卷, 清蒸石斑魚, 蒜香烤大蝦, 脆皮蜜汁烤鴨, 伊比利豬排, 藍莓乳酪塔, 手工高檔冰淇淋, 金箔巧克力蛋糕, 奢華三層下午茶, 焗烤生蠔, 乾式熟成牛排, 感恩節烤火雞, 抹茶生乳捲, 北海道大干貝, 法式馬賽海鮮湯, 傳統魚翅羹, 居酒屋精緻串燒, 黑鮪魚大腹肉, 焗烤法式田螺, 高檔無菜單鐵板燒, 明太子烤山藥, 烤酥皮濃湯, 特製龍蝦沙拉, 脆皮烤乳豬, 精品藝伎咖啡, 法式千層酥",
    "anger": "重慶麻辣鍋, 韓式辣味炸雞, 勁辣雞腿堡, 蒜香鹽酥雞, 泰式冬蔭功湯, 辣炒年糕, 麻辣小龍蝦, 墨西哥爆辣玉米片, 脆皮麻辣臭豆腐, 湖南剁椒魚頭, 街邊麻辣燙, 黑胡椒鐵板牛排, 嗆辣芥末章魚, 大蒜香草烤麵包, 韓式春川辣炒雞, 重鹹脆皮燒肉, 濃郁咖哩豬排飯, 水牛城辣味雞翅, 重慶酸辣粉, 泡椒田雞, 香脆排骨酥, 辣味卡拉脆雞, 孜然羊肉串, 爆炒麻辣牛肚, 辣味厚切洋芋片, 蒜味芥末花生, 碳烤醬汁魷魚, 90%極黑巧克力, 辣味炭烤牛肉乾, 爆炒麻辣香鍋, 泰式打拋豬肉飯, 重度烘焙黑咖啡, 辣炒塔香蛤蜊, 超大塊脆皮雞排, 墨西哥辣椒漢堡, 辣炒沙茶螺肉, 香辣調味炸薯條, 辣味泰式涼拌海鮮, 韓式泡菜豆腐鍋, 清炒蒜香義大利麵, 宮保辣子雞丁, 美式碳烤豬肋排, 酥炸椒鹽皮蛋, 蔥爆沙茶牛肉, 麻辣鴨血豆腐鍋, 雙層純牛起司堡, 川味麻辣涼麵, 粗粒黑胡椒豬排, 辣味肉醬義大利麵, 嗆辣芥末生魚片",
    "sorrow": "特濃熱巧克力, 香草冰淇淋, 香菇燉雞湯, 廣東皮蛋瘦肉粥, 焦糖手烤布丁, 溫熱鮮牛奶, 蜂蜜楓糖鬆餅, 手工蘋果派, 熔岩巧克力蛋糕, 熱呼呼的烤地瓜, 奶油蘑菇濃湯, 經典重乳酪蛋糕, 溫潤紅豆湯, 芝麻花生湯圓, 芋頭西米露, 日式番茄蛋包飯, 鬆軟奶油麵包, 柴魚昆布烏龍麵, 黑糖軟Ｑ麻糬, 鍋煮熱奶茶, 藥燉排骨湯, 古早味花生豆花, 熱巧克力碎片飲, 濃郁芝麻糊, 蛤蜊清湯冬粉, 溫暖燕麥粥, 舒芙蕾厚鬆餅, 伯爵茶戚風蛋糕, 暖胃豬血湯, 蜂蜜長崎蛋糕, 溫熱紅酒香料飲, 綿密馬鈴薯泥, 清燉牛肉湯, 台式滷肉飯, 楓糖法式吐司, 豐富鍋燒意麵, 桂圓紅棗茶, 熱水瓶現泡泡麵, 濃郁抹茶拿鐵, 肉桂蜜烤蘋果, 剛出爐的葡式蛋撻, 鮮奶卡士達雞蛋糕, 奶油白菜燉菜, 法式栗子蒙布朗, 奶油紅豆鯛魚燒, 杏仁豆腐甜湯, 焦糖核桃肉桂捲, 溫熱的純蘋果汁, 鮮熬清魚湯, 紫米紅豆甜粥",
    "fun": "奶油爆米花, 經典窯烤披薩, 綜合鹽酥雞, 日式章魚燒, 碳烤肉串拼盤, 冰鎮啤酒, 派對炸物拼盤, 手搖珍珠奶茶, 酥炸洋蔥圈, 夜市熱狗堡, 綜合水果塔, 雞塊與現炸薯條, 多彩馬卡龍, 甜脆糖葫蘆, 冰火菠蘿油, 義式冰淇淋 (Gelato), 碳烤玉米, 手工雞蛋糕, 泰式海鮮蝦餅, 造型銅鑼燒, 牽絲起司球, 炸蝦天婦羅, 墨西哥捲餅, 日式散壽司, 迷你小漢堡, 烤彩色棉花糖, 法式軟可麗餅, Ｑ彈炸地瓜球, 脆皮生煎包, 碳烤日式麻糬, 涼麵佐胡麻醬, 甜鹹夾心餅乾, Ｑ彈水果果凍, 派對特調雞尾酒, 蒜味香草毛豆, 酥脆蝴蝶餅, 起司熱壓吐司, 蔥鹽蘇打餅乾, 香酥吉拿棒, 爆汁小籠包, 古早味麻花捲, 鮮甜芒果冰沙, 炭烤台式香腸, 現炸花枝丸, 涮嘴可樂果, 烤棉花糖餅乾 (S'mores), 美式炸玉米狗, 甘梅地瓜條, 爆漿起司餐包, 歡樂三明治拼盤"
};

let foodInterval;
let isFoodRolling = false;

$(document).ready(function() {
    
    // --- 頁籤切換邏輯 ---
    $('.food-tab-btn').on('click', function() {
        if (isFoodRolling) return; // 抽獎中禁止切換
        
        // 1. 樣式切換
        $('.food-tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // 2. 顯示對應的區塊
        const targetId = $(this).data('target');
        $('.food-mode-section').hide();
        $('#' + targetId).fadeIn(300);
        
        // 3. 重置輪盤顯示
        resetResultBox();
    });

    // --- 模式 1：心情抽籤按鈕 ---
    $('.mood-btn').on('click', function() {
        if (isFoodRolling) return;
        const mood = $(this).data('mood');
        
        // 把該心情對應的字串，轉換成陣列
        const moodFoodArray = moodFoodDictionaries[mood].split(',').map(item => $.trim(item));
        
        // 開始轉動，並傳入心情參數用來改變顏色
        startFoodRoulette(moodFoodArray, mood);
    });

    // --- 模式 2：手動抽籤按鈕 ---
    $('#manualRollBtn').on('click', function() {
        if (isFoodRolling) return;
        
        const customList = $('#customFoodList').val();
        let foodArray = customList.split(',').map(item => $.trim(item)).filter(item => item !== "");
        
        // 防呆：如果輸入框是空的，偷塞搞笑選項
        if (foodArray.length === 0) {
            foodArray = ["喝西北風", "吃土", "泡麵", "斷食"];
            $('#customFoodList').val("泡麵, 吃土"); 
        }

        // 開始轉動 (自訂模式不傳入特定心情，預設發金光)
        startFoodRoulette(foodArray, 'custom');
    });

    // 返回大廳按鈕
    $('#backToLobbyBtn').on('click', function() {
        window.location.href = '/';
    });
});

// 重置結果框的樣式與文字
function resetResultBox() {
    $('#foodResult').text('等待命運指引...').css({
        "color": "rgba(255, 255, 255, 0.8)",
        "text-shadow": "none",
        "border-color": "rgba(255, 255, 255, 0.2)",
        "font-size": "32px"
    });
}

// 核心輪盤邏輯 (現在直接接收陣列作為參數)
function startFoodRoulette(foodArray, moodType) {
    isFoodRolling = true;
    const $resultDiv = $('#foodResult');
    
    // 改變為「抽取中」的外觀
    $resultDiv.css({
        "color": "rgba(255, 255, 255, 0.6)",
        "text-shadow": "none",
        "border-color": "rgba(255, 255, 255, 0.2)"
    });

    let count = 0;
    const maxCount = 30; // 滾動次數
    const speed = 50;    // 滾動速度(毫秒)

    foodInterval = setInterval(() => {
        const randomFood = foodArray[Math.floor(Math.random() * foodArray.length)];
        $resultDiv.text(randomFood);
        count++;

        if (count >= maxCount) {
            clearInterval(foodInterval);
            finishFoodRoulette(foodArray, moodType);
        }
    }, speed);
}

// 呈現最終結果與彈跳動畫
function finishFoodRoulette(foodArray, moodType) {
    const $resultDiv = $('#foodResult');
    const finalFood = foodArray[Math.floor(Math.random() * foodArray.length)];
    
    $resultDiv.text(`🎉 ${finalFood} 🎉`);
    
    // 根據模式設定最終發光顏色
    let finalColor = "#ffd700"; // 預設金色 (包含自訂模式 'custom')
    let finalShadow = "rgba(255, 215, 0, 0.6)";

    if (moodType === 'joy') { finalColor = "#ffd700"; finalShadow = "rgba(255, 215, 0, 0.6)"; }
    else if (moodType === 'anger') { finalColor = "#ff6464"; finalShadow = "rgba(255, 100, 100, 0.6)"; }
    else if (moodType === 'sorrow') { finalColor = "#64c8ff"; finalShadow = "rgba(100, 200, 255, 0.6)"; }
    else if (moodType === 'fun') { finalColor = "#aa78ff"; finalShadow = "rgba(170, 120, 255, 0.6)"; }

    $resultDiv.css({
        "color": finalColor,
        "text-shadow": `0 0 15px ${finalShadow}`,
        "border-color": finalColor
    });
    
    // 動畫放大效果
    $resultDiv.animate({ fontSize: '38px' }, 150)
              .animate({ fontSize: '32px' }, 250);

    isFoodRolling = false;
}
from flask import Flask, render_template, request, jsonify, session
import configparser
import google.generativeai as genai
from datetime import timedelta

app = Flask(__name__)

# 設定 Session
app.config['SECRET_KEY'] = 'genie_lamp_secret_key_2024'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

# 1. 讀取 config.ini 中的 API Key
config = configparser.ConfigParser()
config.read('config.ini')
api_key = config['Gemini']['API_KEY']

# 2. 設定 Gemini SDK
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/auth')
def auth_page():
    return render_template('auth.html')

@app.route('/rpg')
def rpg_page():
    return render_template('rpg.html')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/jiao')
def jiao_page():
    return render_template('jiao.html')

@app.route('/tarot')
def tarot_page():
    return render_template('tarot.html')

@app.route('/fortune')
def fortune_page():
    return render_template('fortune.html')

@app.route('/ai')
def ai_page():
    return render_template('ai.html')

@app.route('/dream')
def dream_page():
    return render_template('dream.html')

@app.route('/answerbook')
def answerbook_page():
    return render_template('answerbook.html')

@app.route('/lenormand')
def lenormand_page():
    return render_template('lenormand.html')

@app.route('/guidance')
def guidance_page():
    return render_template('guidance.html')

@app.route('/food')
def food_page():
    return render_template('food.html')

# 3. 建立專門給塔羅占卜用的 API 路由
@app.route('/api/tarot', methods=['POST'])
def tarot_reading():
    try:
        # 接收前端傳來的資料
        data = request.json
        question_type = data.get('question_type')
        cards = data.get('cards')
        
        # 組合 Prompt
        prompt = f"我正在進行塔羅牌占卜，問題方向是「{question_type}」。我抽到的三張牌分別是：過去是「{cards[0]}」，現在是「{cards[1]}」，未來是「{cards[2]}」。請扮演專業的星象塔羅占卜師，用大約 200 字給予我富有神祕感且溫暖的解讀，請不要輸出 Markdown 標題，直接給我內文即可。"
        
        # 呼叫 Gemini AI
        response = model.generate_content(prompt)
        
        # 回傳給前端
        return jsonify({"text": response.text})
        
    except Exception as e:
        print("API 錯誤:", e)
        return jsonify({"error": str(e)}), 500

GENIE_PROMPT = """你是一個神燈精靈，玩家心中想著一個人物（可以是真實人物、歷史人物等）。
你的任務是通過提問（玩家只能回答 YES 或 NO）來猜出這個人物。
遵循以下規則：
1. 每次只提一個問題
2. 問題應該是是/否問題，幫助你縮小範圍
3. 如果你有 80% 的把握知道是誰，就提出猜測：GUESS: [人物名稱]（不使用冒號，就寫成"GUESS [人物名稱]"）
4. 如果 20 個問題都用完了還沒猜對，回應：GIVE_UP: 我放棄了

開始提問吧！"""

# 4. 神燈精靈 - 初始化遊戲
@app.route('/api/genie/start', methods=['POST'])
def genie_start():
    try:
        # 初始化遊戲會話
        session['genie_game'] = {
            'conversation': [],
            'question_count': 0,
            'max_questions': 20,
            'guessing': False
        }
        session.permanent = True
        
        # 1. 呼叫 Gemini 取得第一個問題
        try:
            response = model.generate_content(f"{GENIE_PROMPT}\n\n開始提問：")
            first_question = response.text.strip()
        except Exception as api_error:
            if "quota" in str(api_error).lower() or "429" in str(api_error):
                return jsonify({"error": "系統忙線中，請稍後再試", "error_code": "QUOTA_EXCEEDED"}), 429
            raise
        
        # 2. 將第一個問題寫入會話
        session['genie_game']['conversation'].append({'role': 'assistant', 'content': first_question})
        session['genie_game']['question_count'] = 1
        
        return jsonify({
            "question": first_question,
            "question_count": 1,
            "max_questions": 20
        })
    except Exception as e:
        print("神燈精靈初始化錯誤:", e)
        return jsonify({"error": str(e)}), 500


# 5. 神燈精靈 - 處理玩家回答
@app.route('/api/genie/answer', methods=['POST'])
def genie_answer():
    try:
        data = request.json or {}
        user_answer = data.get('answer', '').strip().upper()
        
        # 檢查遊戲會話是否存在
        if 'genie_game' not in session:
            return jsonify({"error": "遊戲未初始化"}), 400
        
        game = session['genie_game']
        
        # 檢查是否超過最大問題數
        if game['question_count'] >= game['max_questions']:
            return jsonify({
                "status": "game_over",
                "message": "已達到最大提問次數",
                "final_message": "很遺憾，我用完了 20 個問題還是沒有猜出來。你想的是誰呢？"
            }), 200
            
       
        if game.get('guessing', False):
            game['guessing'] = False # 猜測階段結束
            
            if user_answer == 'YES':
                return jsonify({
                    "status": "correct",
                    "message": f"恭喜！我猜出來了，你想的是：{game.get('current_guess', '???')}",
                    "question_count": game['question_count']
                }), 200
            else:
                # 沒猜對，扣除一題，把 NO 寫入歷史，並在下方直接調用 Gemini 繼續問
                game['question_count'] += 1
                game['conversation'].append({'role': 'user', 'content': user_answer})
                
                
                conversation_text = GENIE_PROMPT + "\n\n對話歷史：\n"
                for msg in game['conversation']:
                    role = "玩家" if msg['role'] == 'user' else "精靈"
                    conversation_text += f"{role}: {msg['content']}\n"
                
                try:
                    response = model.generate_content(conversation_text + "\n精靈的下一個問題：")
                    next_question = response.text.strip()
                except Exception as api_error:
                    if "quota" in str(api_error).lower() or "429" in str(api_error):
                        game['conversation'].pop()
                        session['genie_game'] = game
                        return jsonify({"error": "系統忙線中，請稍後再試", "error_code": "QUOTA_EXCEEDED"}), 429
                    raise
                
                # 解析精靈新提出的問題/猜測
                if next_question.startswith("GUESS "):
                    guessed_person = next_question.replace("GUESS ", "").strip()
                    game['current_guess'] = guessed_person
                    game['guessing'] = True
                    game['conversation'].append({'role': 'assistant', 'content': next_question})
                    session['genie_game'] = game
                    return jsonify({
                        "status": "guessing",
                        "question": f"我猜你想的是：{guessed_person}，是這樣嗎？",
                        "question_count": game['question_count'],
                        "max_questions": game['max_questions']
                    }), 200
                elif next_question.startswith("GIVE_UP:"):
                    game['conversation'].append({'role': 'assistant', 'content': next_question})
                    session['genie_game'] = game
                    return jsonify({"status": "give_up", "message": "我放棄了！你想的是誰呢？", "question_count": game['question_count']}), 200
                else:
                    game['question_count'] += 1
                    game['conversation'].append({'role': 'assistant', 'content': next_question})
                    session['genie_game'] = game
                    return jsonify({"status": "continue", "question": next_question, "question_count": game['question_count'], "max_questions": game['max_questions']}), 200

       
        game['conversation'].append({'role': 'user', 'content': user_answer})
        
        conversation_text = GENIE_PROMPT + "\n\n對話歷史：\n"
        for msg in game['conversation']:
            role = "玩家" if msg['role'] == 'user' else "精靈"
            conversation_text += f"{role}: {msg['content']}\n"
            
        try:
            response = model.generate_content(conversation_text + "\n精靈的下一個問題：")
            next_question = response.text.strip()
        except Exception as api_error:
            if "quota" in str(api_error).lower() or "429" in str(api_error):
                game['conversation'].pop()
                session['genie_game'] = game
                return jsonify({"error": "系統忙線中，請稍後再試", "error_code": "QUOTA_EXCEEDED"}), 429
            raise
            
        # 解析回應
        if next_question.startswith("GUESS "):
            guessed_person = next_question.replace("GUESS ", "").strip()
            game['current_guess'] = guessed_person
            game['guessing'] = True
            game['question_count'] += 1
            game['conversation'].append({'role': 'assistant', 'content': next_question})
            session['genie_game'] = game
            return jsonify({
                "status": "guessing",
                "question": f"我猜你想的是：{guessed_person}，是這樣嗎？",
                "question_count": game['question_count'],
                "max_questions": game['max_questions']
            }), 200
            
        elif next_question.startswith("CORRECT:"):
            guessed_person = next_question.replace("CORRECT:", "").strip()
            game['conversation'].append({'role': 'assistant', 'content': next_question})
            game['question_count'] += 1
            session['genie_game'] = game
            return jsonify({"status": "correct", "message": f"恭喜！我猜出來了，你想的是：{guessed_person}", "question_count": game['question_count']}), 200
            
        elif next_question.startswith("GIVE_UP:"):
            game['conversation'].append({'role': 'assistant', 'content': next_question})
            session['genie_game'] = game
            return jsonify({"status": "give_up", "message": "我放棄了！你想的是誰呢？", "question_count": game['question_count']}), 200
            
        # 正常的下一個問題
        game['question_count'] += 1
        game['conversation'].append({'role': 'assistant', 'content': next_question})
        session['genie_game'] = game
        return jsonify({
            "status": "continue",
            "question": next_question,
            "question_count": game['question_count'],
            "max_questions": game['max_questions']
        }), 200
        
    except Exception as e:
        print("神燈精靈答題錯誤:", e)
        return jsonify({"error": str(e)}), 500
# 6. AI 捕夢網 - 解夢 API
@app.route('/api/dream', methods=['POST'])
def interpret_dream():
    try:
        data = request.json
        dream_text = data.get('dream', '')
        
        if not dream_text:
            return jsonify({"error": "未提供夢境內容"}), 400
            
        prompt = f"""
        你是一位洞察力極高、極度精準的解夢大師。
        有一位訪客向你訴說了他的夢境：「{dream_text}」
        
        請用最清晰、直白且一針見血的方式，讓訪客快速秒懂這個夢境的涵義。
        解析請控制在 200 字左右，並直接給出以下三個重點：
        
        1. 夢境核心意義（直指這個夢代表什麼）
        2. 潛意識狀態（反映了目前的什麼心理、現實壓力或渴望）
        3. 具體行動建議（給予一項在現實生活中可以立刻去做的簡單建議）
        
        請不要使用 Markdown 的大標題符號 (如 #)，直接以平易近人、條理分明的文字回覆即可，讓讀者一目了然。
        """
        
        response = model.generate_content(prompt)
        return jsonify({"text": response.text})
        
    except Exception as e:
        print("解夢 API 錯誤:", e)
        return jsonify({"error": str(e)}), 500

# 7. 雷諾曼卡占卜 API
@app.route('/api/lenormand', methods=['POST'])
def lenormand_reading():
    try:
        data = request.json
        question = data.get('question', '')
        cards = data.get('cards', [])
        
        if not question or len(cards) != 3:
            return jsonify({"error": "資料不完整"}), 400
            
        prompt = f"""
        你是一位精通「雷諾曼卡 (Lenormand)」的占卜大師。
        與塔羅牌不同，雷諾曼卡非常直白、不講求深層心理學，而是將牌面當作字詞組合成句子來預測具體事件。
        
        訪客的問題是：「{question}」
        抽出的三張牌依序是：「{cards[0]}」、「{cards[1]}」、「{cards[2]}」
        
        請根據這三張牌的組合，用大約 200 字給出最直白、具體的事件預測與建議。
        請不要使用 Markdown 的大標題符號 (如 #)，直接以平易近人的文字回覆即可。
        """
        
        response = model.generate_content(prompt)
        return jsonify({"text": response.text})
        
    except Exception as e:
        print("雷諾曼卡 API 錯誤:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

# ==========================================
# 🌟 2. 星光指引：Gemini 花語生成路由
# ==========================================
@app.route('/api/guidance_flower', methods=['POST'])
def guidance_flower_api():
    try:
        data = request.get_json()
        category = data.get('category')
        title = data.get('title')
        desc = data.get('desc')

        # 中文化測驗類型，幫助 Gemini 更好理解情境
        category_name = "靈魂與自我"
        if category == "love":
            category_name = "感情與緣分"
        elif category == "career":
            category_name = "學業與未來"

        # 組合給 Gemini 的提示詞 (Prompt)
        prompt = f"""
        使用者剛剛完成了一個名為「星光指引」的心理測驗。
        - 測驗主題：{category_name}
        - 他的測驗結果稱號：{title}
        - 他的狀態解析：{desc}
        
        請根據他目前的狀態，挑選一種「最適合他現在情境的花朵或植物」，並給他一段專屬的「花語」與溫柔的祝福。
        字數請控制在 50 到 80 字之間。
        語氣要溫柔、神秘、療癒，不要有任何開頭的「你好」或結尾的「謝謝」等寒暄，請直接輸出花朵名稱與內容。
        """

        # 呼叫 Gemini 模型 (推薦使用 gemini-1.5-flash，速度最快且適合文字生成)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        response = model.generate_content(prompt)
        
        # 取得 Gemini 回傳的文字
        ai_text = response.text

        # 回傳給前端
        return jsonify({"flower_text": ai_text})

    except Exception as e:
        # 如果發生錯誤 (例如 API Key 沒填對、額度用盡等)，印出錯誤原因
        print(f"Gemini 花語生成錯誤: {e}")
        return jsonify({"error": "伺服器或星象連線錯誤"}), 500
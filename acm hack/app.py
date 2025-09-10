import os
import requests
import json
from flask import Flask, request, jsonify, render_template, send_file
from gtts import gTTS
import uuid

app = Flask(__name__)

OPENROUTER_API_KEY = "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"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "DeepSeek Chat App",
    }

    payload = {
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": [{"role": "user", "content": user_message}],
    }

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload)
        )
        response.raise_for_status()
        api_response = response.json()

        content = api_response['choices'][0]['message']['content']
        return jsonify({"response": content})

    except requests.exceptions.RequestException as e:
        app.logger.error(f"API request failed: {e}")
        return jsonify({"error": "Failed to connect to the API."}), 500
    except (KeyError, IndexError) as e:
        app.logger.error(f"Unexpected API response format: {e}")
        return jsonify({"error": "Unexpected response format."}), 500


@app.route('/tts', methods=['POST'])
def tts():
    """Convert given text to speech using gTTS and return the MP3 file."""
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        filename = f"tts_{uuid.uuid4().hex}.mp3"
        filepath = os.path.join("static", filename)

        tts = gTTS(text=text, lang="en")
        tts.save(filepath)

        return jsonify({"audio_url": f"/static/{filename}"})
    except Exception as e:
        app.logger.error(f"TTS generation failed: {e}")
        return jsonify({"error": "Failed to generate TTS."}), 500


if __name__ == '__main__':
    os.makedirs("static", exist_ok=True)
    app.run(debug=True)

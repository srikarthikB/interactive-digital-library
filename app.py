from flask import Flask, render_template, request, jsonify
import json
import os

# ── Load .env file ────────────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Groq (Ask AI — text) ──────────────────────────────────────────────────────
# pip install groq  |  .env: GROQ_API_KEY=gsk_...
import importlib.util as _ilu

if _ilu.find_spec("groq") is not None:
    from groq import Groq as _Groq
    _groq_key = os.environ.get("GROQ_API_KEY", "")
    if _groq_key:
        _ai_client   = _Groq(api_key=_groq_key)
        AI_AVAILABLE = True
    else:
        _ai_client   = None
        AI_AVAILABLE = False
else:
    _Groq        = None
    _ai_client   = None
    AI_AVAILABLE = False

# ── Together AI (image generation — free tier) ────────────────────────────────
# pip install requests  |  .env: TOGETHER_API_KEY=tgp_v1_...
# Sign up FREE (no card) at: api.together.ai
import requests as _requests

_together_key   = os.environ.get("TOGETHER_API_KEY", "")
IMAGE_AVAILABLE = bool(_together_key)

GENERATED_DIR = os.path.join("static", "images", "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

app = Flask(__name__)


def load_books():
    with open("books.json") as f:
        return json.load(f)


def load_summaries():
    with open("data/summaries.json", "r", encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def home():
    books     = load_books()
    summaries = load_summaries()
    return render_template("home.html", books=books, summaries=summaries)


@app.route("/book/<int:book_id>")
def book_detail(book_id):
    books     = load_books()
    summaries = load_summaries()
    book      = next((b for b in books if b["id"] == book_id), None)
    if not book:
        return "Book not found", 404
    summary = summaries.get(book["slug"])
    return render_template("book.html", book=book, summary=summary)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/book/<int:book_id>/visuals")
def book_visuals(book_id):
    books = load_books()
    book  = next((b for b in books if b["id"] == book_id), None)
    if not book:
        return "Book not found", 404
    visuals_path = os.path.join("static", "images", "visuals", book["slug"])
    visuals      = os.listdir(visuals_path) if os.path.exists(visuals_path) else []
    return render_template("visuals.html", book=book, visuals=visuals)


@app.route("/college-library")
def college_library():
    with open("books.json") as f:
        books = json.load(f)
    academic_books = [b for b in books if b.get("category") == "academic"]
    return render_template("college_library.html", books=academic_books)


# ── Ask AI ────────────────────────────────────────────────────────────────────
@app.route("/ask-ai", methods=["POST"])
def ask_ai():
    if not AI_AVAILABLE:
        return jsonify({"error": "AI service not configured. Set GROQ_API_KEY in .env."}), 503

    data     = request.get_json(silent=True) or {}
    slug     = data.get("slug", "").strip()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question provided."}), 400

    books = load_books()
    book  = next((b for b in books if b["slug"] == slug), None)

    if book:
        book_context = (
            f"Title: {book['title']}\n"
            f"Author: {book['author']}\n"
            f"Genre: {book['genre']}\n"
            f"Era: {book['era']}\n"
            f"Description: {book['description']}"
        )
    else:
        book_context = f"A book with identifier '{slug}'."

    try:
        summaries   = load_summaries()
        summary_obj = summaries.get(slug)
        if summary_obj:
            summary_text = summary_obj.get("full") or summary_obj.get("short", "")
            if summary_text:
                book_context += f"\n\nSummary:\n{summary_text}"
    except Exception:
        pass

    system_prompt = (
        "You are a knowledgeable literary assistant in a digital library. "
        "Your role is to help readers understand books through clear, engaging, "
        "and insightful answers. Keep responses concise (3-5 sentences) unless "
        "more depth is genuinely needed. Do not reproduce copyrighted text."
    )

    user_prompt = (
        f"Here is information about the book the reader is asking about:\n\n"
        f"{book_context}\n\n"
        f"Reader's question: {question}"
    )

    try:
        response = _ai_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            max_tokens=400,
            temperature=0.7,
        )
        return jsonify({"answer": response.choices[0].message.content.strip()})

    except Exception as e:
        app.logger.error("Groq failed [%s]: %s", type(e).__name__, e)
        if app.debug:
            return jsonify({"error": f"[{type(e).__name__}] {e}"}), 502
        return jsonify({"error": "The AI service is temporarily unavailable."}), 502


# ── Generate Image ────────────────────────────────────────────────────────────
@app.route("/generate-image", methods=["POST"])
def generate_image():
    if not IMAGE_AVAILABLE:
        return jsonify({"error": "Image service not configured. Set TOGETHER_API_KEY in .env."}), 503

    data        = request.get_json(silent=True) or {}
    slug        = data.get("slug", "").strip()
    title       = data.get("title", "").strip()
    description = data.get("description", "").strip()
    scene_index = int(data.get("scene_index", 0))

    if not slug or not title:
        return jsonify({"error": "slug and title are required."}), 400

    scene_prompts = [
        (
            f"A dramatic opening scene illustration for the book '{title}'. "
            f"{description} "
            "Focus on setting and atmosphere. Style: classical oil painting, "
            "warm candlelight, rich textures, cinematic wide shot, highly detailed."
        ),
        (
            f"A pivotal conflict or turning point scene from '{title}'. "
            f"{description} "
            "Focus on tension and characters. Style: dramatic chiaroscuro lighting, "
            "oil painting, intense emotion, baroque composition, highly detailed."
        ),
        (
            f"A peaceful or reflective moment from the story '{title}'. "
            f"{description} "
            "Focus on mood and symbolism. Style: soft golden hour lighting, "
            "impressionist painting, aged parchment tones, poetic atmosphere, "
            "fine art quality."
        ),
    ]

    TOTAL_SCENES = len(scene_prompts)
    scene_index  = scene_index % TOTAL_SCENES

    safe_slug  = "".join(c if c.isalnum() or c == "-" else "_" for c in slug)
    image_name = f"{safe_slug}_scene{scene_index}.png"
    image_path = os.path.join(GENERATED_DIR, image_name)
    image_url  = f"/static/images/generated/{image_name}"

    if os.path.exists(image_path):
        app.logger.info("Cache hit: scene %d for %s", scene_index, slug)
        return jsonify({
            "image_url":    image_url,
            "cached":       True,
            "scene_index":  scene_index,
            "total_scenes": TOTAL_SCENES,
        })

    # ── Call Together AI via direct HTTP — works with tgp_v1_ keys ───────
    try:
        import base64, io
        from PIL import Image as _PIL

        hf_resp = _requests.post(
            "https://api.together.xyz/v1/images/generations",
            headers={
                "Authorization": f"Bearer {_together_key}",
                "Content-Type":  "application/json",
            },
            json={
                "model":           "black-forest-labs/FLUX.1-schnell-Free",
                "prompt":          scene_prompts[scene_index],
                "width":           768,
                "height":          512,
                "steps":           4,
                "n":               1,
                "response_format": "b64_json",
            },
            timeout=120,
        )

        if hf_resp.status_code != 200:
            try:
                msg = hf_resp.json().get("error", {}).get("message", hf_resp.text[:200])
            except Exception:
                msg = hf_resp.text[:200]
            app.logger.error("Together AI error: %s", msg)
            if app.debug:
                return jsonify({"error": f"[TogetherAI] {msg}"}), 502
            return jsonify({"error": "Image generation failed. Please try again."}), 502

        b64_data    = hf_resp.json()["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64_data)
        image       = _PIL.open(io.BytesIO(image_bytes))
        image.save(image_path)

        app.logger.info("Together AI generated scene %d for %s", scene_index, slug)
        return jsonify({
            "image_url":    image_url,
            "cached":       False,
            "scene_index":  scene_index,
            "total_scenes": TOTAL_SCENES,
        })

    except _requests.exceptions.Timeout:
        return jsonify({"error": "Timed out. Please try again."}), 504

    except Exception as e:
        app.logger.error("Image generation failed [%s]: %s", type(e).__name__, e)
        if app.debug:
            return jsonify({"error": f"[{type(e).__name__}] {e}"}), 502
        return jsonify({"error": "Image generation failed. Please try again later."}), 502


if __name__ == "__main__":
    app.run(debug=True)
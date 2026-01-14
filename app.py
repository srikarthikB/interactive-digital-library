from flask import Flask, render_template
import json

app = Flask(__name__)

def load_books():
    with open("books.json") as f:
        return json.load(f)
    
def load_summaries():
    with open("data/summaries.json", "r", encoding="utf-8") as f:
        return json.load(f)
    
@app.route("/")
def home():
    books = load_books()
    return render_template("home.html", books=books)   

@app.route("/book/<int:book_id>")
def book_detail(book_id):
    books = load_books()
    summaries = load_summaries()

    book = next((b for b in books if b["id"] == book_id), None)

    if not book:
        return "Book not found", 404

    summary = summaries.get(book["slug"])

    return render_template(
        "book.html",
        book=book,
        summary=summary
    )


@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/book/<int:book_id>/visuals")
def book_visuals(book_id):
    books = load_books()
    book = next((b for b in books if b["id"] == book_id), None)

    if not book:
        return "Book not found", 404

    return render_template("visuals.html", book=book)

if __name__ == "__main__":
    app.run(debug=True) 
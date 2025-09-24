from flask import Flask, render_template, request, jsonify
import json, os, random

app = Flask(__name__)

deck = {"name": "Nouveau_jeu", "cards": []}

@app.route("/")
def index():
    return render_template("index.html", deck=deck)

@app.route("/add_card", methods=["POST"])
def add_card():
    data = request.json
    q = data.get("q", "").strip()
    a = data.get("a", "").strip()
    cat = data.get("cat", "").strip()
    if not q or not a:
        return jsonify({"error": "Question et réponse obligatoires"}), 400
    deck["cards"].append({"q": q, "a": a, "cat": cat})
    return jsonify(deck)

@app.route("/quiz")
def quiz():
    order = list(range(len(deck["cards"])))
    random.shuffle(order)
    return render_template("quiz.html", deck=deck, order=order)

@app.route("/save", methods=["POST"])
def save():
    fname = f"{deck['name']}.json"
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    return jsonify({"message": f"Sauvegardé dans {fname}"})

if __name__ == "__main__":
    app.run(debug=True)

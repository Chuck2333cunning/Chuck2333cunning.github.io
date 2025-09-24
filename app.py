from flask import Flask, render_template, request, jsonify, redirect, url_for
import json, os, random

app = Flask(__name__)

# Jeu en mémoire (similaire à DEFAULT_DECK)
deck = {"name": "Nouveau_jeu", "cards": []}

@app.route("/")
def index():
    return render_template("index.html", deck=deck)

@app.route("/add_card", methods=["POST"])
def add_card():
    q = request.form.get("q", "").strip()
    a = request.form.get("a", "").strip()
    cat = request.form.get("cat", "").strip()
    if not q or not a:
        return "Question et réponse obligatoires", 400
    deck["cards"].append({"q": q, "a": a, "cat": cat})
    return redirect(url_for("index"))

@app.route("/delete/<int:idx>")
def delete_card(idx):
    if 0 <= idx < len(deck["cards"]):
        deck["cards"].pop(idx)
    return redirect(url_for("index"))

@app.route("/quiz")
def quiz():
    if not deck["cards"]:
        return "Ajoute des cartes avant de lancer le quiz !", 400
    order = list(range(len(deck["cards"])))
    random.shuffle(order)
    return render_template("quiz.html", deck=deck, order=order)

@app.route("/save")
def save():
    fname = f"{deck['name']}.json"
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    return f"Jeu sauvegardé dans {fname}"

if __name__ == "__main__":
    app.run(debug=True)

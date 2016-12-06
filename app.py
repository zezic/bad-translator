from flask import Flask, render_template, request
from flask_restful import Api, Resource
from bad_translator import BadTranslator
import json
import os.path
from uuid import uuid4

if not os.path.exists("translations.json"):
    with open("translations.json", "a+") as data_file:
        data = []
        json.dump([], data_file)

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

api = Api(app)

bt = BadTranslator(app.config.get("YANDEX_API_KEY"))

@app.route("/")
def index():
    print("IP:", request.remote_addr)
    theme_light = request.cookies.get("theme-light") == "true"
    with open("translations.json", "r") as data_file:
        translations = json.load(data_file)
        if len(translations) > 10:
            translations = translations[-10:]
        translations.reverse()
    return render_template("index.html", translations=translations, theme_light=theme_light)

class Translate(Resource):
    def get(self):
        print("IP:", request.remote_addr)
        text = request.args.get("text")
        text = (text[:400] + '...') if len(text) > 400 else text
        if text:
            result = bt.bad_translate(text)
            if not os.path.exists("translations.json"):
                with open("translations.json", "a+") as data_file:
                    data = []
                    json.dump([], data_file)
            with open("translations.json", "r") as data_file:
                data = json.load(data_file)
            with open("translations.json", "w") as data_file:
                if not data:
                    data = []
                data.append({
                    "id": uuid4().hex,
                    "in": text,
                    "out": result.get("text"),
                    "likes": []
                })
                json.dump(data, data_file)
            return result
        else:
            return "No text provided", 400

api.add_resource(Translate, '/api/translate')

app.run(host='0.0.0.0', port=5151, debug=True)

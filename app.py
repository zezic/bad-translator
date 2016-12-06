from flask import Flask, render_template, request
from flask_restful import Api, Resource
from bad_translator import BadTranslator
import json
import os.path

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
    with open("translations.json", "r") as data_file:
        translations = json.load(data_file)
        if len(translations) > 10:
            translations = translations[:10]
    return render_template("index.html", translations=translations)

class Translate(Resource):
    def get(self):
        text = request.args.get("text")
        text = (text[:300] + '..') if len(text) > 300 else text
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
                    "in": text,
                    "out": result.get("text")
                })
                json.dump(data, data_file)
            return result
        else:
            return "No text provided", 400

api.add_resource(Translate, '/api/translate')

app.run(host='0.0.0.0', port=5151, debug=True)

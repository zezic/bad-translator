from flask import Flask, render_template, request
from flask_restful import Api, Resource
from flask_socketio import SocketIO, emit, join_room, \
    rooms, disconnect
from bad_translator import BadTranslator
import json
import os.path
import eventlet
from uuid import uuid4
from languages import languages

eventlet.monkey_patch()

if not os.path.exists("translations.json"):
    with open("translations.json", "a+") as data_file:
        data = []
        json.dump([], data_file)

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

api = Api(app)

socketio = SocketIO(app, async_mode='eventlet')

bt = BadTranslator(app.config.get("YANDEX_API_KEY"))

@app.route("/")
def index():
    theme_light = request.cookies.get("theme-light") == "true"
    if not request.cookies.get("theme-light"):
        theme_light = True
    ip_addr = request.access_route[0]

    with open("translations.json", "r") as data_file:
        translations = json.load(data_file)
        if len(translations) > 10:
            translations = translations[-10:]
        translations.reverse()

    for idx, tr in enumerate(translations):
        if tr.get("likes") and ip_addr in tr.get("likes"):
            translations[idx].update({
                "its_you": True
            })

    return render_template("index.html", translations=translations, theme_light=theme_light)

class Translate(Resource):
    def get(self):
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
                translation = {
                    "id": uuid4().hex,
                    "in": text,
                    "out": result.get("text"),
                    "chain": result.get("chain"),
                    "likes": []
                }
                data.append(translation)
                json.dump(data, data_file)
                socketio.emit('translation', translation, namespace='/updates')
            return result
        else:
            return "No text provided", 400

class Like(Resource):
    def post(self, tr_id):
        if tr_id:
            ip_addr = request.access_route[0]
            with open("translations.json", "r") as data_file:
                data = json.load(data_file)
                for idx, item in enumerate(data):
                    if item.get("id") == tr_id:
                        if ip_addr not in item.get("likes"):
                            item["likes"].append(ip_addr)
                        else:
                            item["likes"].remove(ip_addr)
                        break

            with open("translations.json", "w") as data_file:
                json.dump(data, data_file)
        print(item)
        print(ip_addr)
        return {
            "likes": len(item.get("likes")),
            "and_you": ip_addr in item.get("likes")
        }

class Languages(Resource):
    def get(self):
        return languages

api.add_resource(Translate, '/api/translate')
api.add_resource(Like, '/api/like/<tr_id>')
api.add_resource(Languages, '/api/languages')

socketio.run(app, host='0.0.0.0', port=5151, debug=True)

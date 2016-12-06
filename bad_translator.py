import requests
import random

from languages import languages

class BadTranslator(object):
    def __init__(self, api_key):
        self.api_key = api_key

    def translate(self, text, fro, to):
        url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + self.api_key + "&text=" + text + "&lang=" + fro + "-" + to
        r = requests.get(url)
        print("tr:", r.json())
        if r.json().get("code") != 200:
            return text
        return r.json().get("text")[0]

    def detect_lang(self, text):
        url = "https://translate.yandex.net/api/v1.5/tr.json/detect?key=" + self.api_key + "&text=" + text + "&hint=ru,en"
        r = requests.get(url)
        print("dt:", r.json())
        return r.json().get("lang")

    def bad_translate(self, text):
        # Prepare translation chain
        chain = []
        source_lang = self.detect_lang(text)
        chain.append(source_lang)
        for a in range(random.randint(3, 7)):
            chain.append(random.choice(languages).get("code"))
        chain.append(source_lang)

        for idx, lang in enumerate(chain):
            if idx + 1 < len(chain):
                fro = lang
                to = chain[idx + 1]
                text = self.translate(text, fro, to)
                # print("from", fro, "to", to, ":", text)
        return {
            "text": text,
            "chain": chain
        }

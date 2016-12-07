# Bad Translator

[Demo](http://trtr.zezic.ru)

## Prepare:

    git clone https://github.com/zezic/bad-translator.git
    cd bad-translator
    python3 -m venv .venv
    source .venv/bin/activate
    pip install flask-restful requests

## Configure:

    cp instance/config.py.example instance/config.py
    vim instance/config.py

## Run:

    python app.py

Navigate to [localhost:5151](http://localhost:5151)

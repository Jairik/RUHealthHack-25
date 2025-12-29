pyenv install 3.11.0
pyenv local 3.11.0
python -m venv venv
source venv/bin/activate
pip install uv
uv pip install -r requirements.txt

cd frontend && npm install && cd npm run devf
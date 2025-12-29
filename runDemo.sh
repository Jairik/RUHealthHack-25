# Install backend dependencies
echo "Setting up backend virtual environment and installing dependencies..."
python -m venv venv
source venv/bin/activate
pip install uv
uv pip install -r requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install 

# Run the frontend and backend servers
echo "Starting servers..."
npm run devf
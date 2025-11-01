# Procfile content in the root of your repository
# Builds React client, then starts the Gunicorn server for the Python backend.
web: sh -c "npm install --prefix client && npm run build --prefix client && gunicorn --bind :$PORT --workers 2 --threads 4 server.app:app"

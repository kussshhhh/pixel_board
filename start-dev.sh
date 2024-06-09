#!/bin/sh

# Navigate to the backend directory and start the server in the background
cd backend
node server.js &

# Navigate to the frontend directory and start the React project in the background
cd ../frontend
npm start &

# Wait for all background processes to finish
wait

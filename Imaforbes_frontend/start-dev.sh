#!/bin/bash

# Start React Development Server for MAMP
# This script starts the Vite dev server for the portfolio frontend

echo "🚀 Starting React Portfolio Development Server..."
echo "📍 Location: /Applications/MAMP/htdocs/my-portfolio-react"
echo ""

cd /Applications/MAMP/htdocs/my-portfolio-react

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo "✅ Starting Vite dev server..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔗 API backend should be at: http://localhost:8888/api_db_portfolio"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev


#!/bin/bash
echo "Starting local server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8000

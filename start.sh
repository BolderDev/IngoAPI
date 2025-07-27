#!/bin/sh

# Start Redis server in the background
redis-server &

# Start the Node.js app
node src/app.js

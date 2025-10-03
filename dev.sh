#!/bin/bash

# Start database and redis
echo "Starting database and redis..."
sudo docker compose up -d postgres redis

# Wait for services to be ready
sleep 5

# Start local development
echo "Starting local development..."
turbo run dev
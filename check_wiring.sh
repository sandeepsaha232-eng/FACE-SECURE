#!/bin/bash

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
VITE_CONFIG="./frontend/vite.config.ts"

echo "=== FaceSecure Wiring Check ==="

# 1. Check Backend
echo -n "[1/3] Checking Backend (Port $BACKEND_PORT)... "
if lsof -i :$BACKEND_PORT > /dev/null; then
    echo "✅ RUNNING"
    # Try a health check
    HEALTH=$(curl -s http://localhost:$BACKEND_PORT/health)
    if [[ $HEALTH == *"ok"* ]]; then
        echo "      Health Check: ✅ OK"
    else
        echo "      Health Check: ❌ FAILED (Response: $HEALTH)"
    fi
else
    echo "❌ NOT RUNNING (Start it with 'npm run dev' in backend folder)"
fi

# 2. Check Frontend
echo -n "[2/3] Checking Frontend (Port $FRONTEND_PORT)... "
if lsof -i :$FRONTEND_PORT > /dev/null; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING (Start it with 'npm run dev' in frontend folder)"
fi

# 3. Check Vite Proxy
echo -n "[3/3] Checking Vite Proxy Target... "
if [ -f "$VITE_CONFIG" ]; then
    TARGET=$(grep "target:" "$VITE_CONFIG" | head -n 1 | sed "s/.*'\(.*\)'.*/\1/")
    echo "Target: $TARGET"
    if [[ $TARGET == *":$BACKEND_PORT"* ]]; then
        echo "      Proxy Sync: ✅ MATCHED"
    else
        echo "      Proxy Sync: ❌ MISMATCH (Vite points to $TARGET but Backend is $BACKEND_PORT)"
    fi
else
    echo "❌ VITE CONFIG NOT FOUND"
fi

echo "==============================="

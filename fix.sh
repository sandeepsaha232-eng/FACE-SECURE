#!/bin/bash

# Vercel Quick Fix Script
# Run this in your project root

echo "🔧 Starting Vercel Fix..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: frontend directory not found${NC}"
    echo "Please run this script from your project root"
    exit 1
fi

echo -e "${YELLOW}Step 1: Cleaning frontend node_modules...${NC}"
cd frontend
rm -rf node_modules package-lock.json dist .vite
npm cache clean --force
echo -e "${GREEN}✓ Cleaned${NC}"

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 3: Testing build...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed${NC}"
    echo "Fix the build errors before deploying to Vercel"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

cd ..

echo -e "${YELLOW}Step 4: Checking backend...${NC}"
if [ -d "backend" ]; then
    cd backend
    
    # Check if cors is installed
    if ! grep -q '"cors"' package.json; then
        echo -e "${YELLOW}Installing cors package...${NC}"
        npm install cors
        echo -e "${GREEN}✓ CORS installed${NC}"
    else
        echo -e "${GREEN}✓ CORS already installed${NC}"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠ Backend directory not found (might be separate repo)${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✓ Local fixes complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'fix: clean dependencies and config'"
echo "   git push"
echo ""
echo "2. In Vercel Dashboard:"
echo "   - Settings → General → Clear Cache"
echo "   - Deployments → Redeploy (disable cache)"
echo ""
echo "3. Check deployment logs for any remaining errors"
echo ""
echo -e "${YELLOW}Need help? Check DEPLOYMENT_GUIDE.md${NC}"

#!/bin/bash

# Script để commit và push thay đổi

cd /home/mrkent/Projects/etax-web-new

# Check git status
echo "📋 Checking git status..."
git status

# Add changed files
echo "📝 Adding files..."
git add src/app/login/page.tsx

# Commit với message
echo "💾 Committing changes..."
git commit -m "fix: align VNeID button text to center to match design

- Change text alignment from left to center for 'Đăng nhập bằng tài khoản' and 'Định danh điện tử'
- Match design specification exactly"

# Push to remote
echo "🚀 Pushing to remote..."
git push origin main

echo "✅ Done!"




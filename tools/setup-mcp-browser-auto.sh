#!/bin/bash

# 🔧 Auto Setup MCP Browser for Cursor IDE
# Based on: https://cursor.com/docs/agent/browser

set -e

echo "🔧 Setting up MCP Browser for Cursor IDE..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20+. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check Chrome
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "⚠️  Chrome/Chromium not found. MCP browser may not work."
else
    echo "✅ Chrome/Chromium found"
fi

# Cursor config directory
CURSOR_CONFIG_DIR="$HOME/.cursor"
MCP_CONFIG_FILE="$CURSOR_CONFIG_DIR/mcp.json"

# Create Cursor config dir if not exists
mkdir -p "$CURSOR_CONFIG_DIR"

echo ""
echo "📝 Configuring MCP Browser..."

# Check if mcp.json exists
if [ -f "$MCP_CONFIG_FILE" ]; then
    echo "⚠️  Found existing mcp.json. Backing up..."
    cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create/Update MCP config
cat > "$MCP_CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "cursor-ide-browser": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "env": {
        "PUPPETEER_HEADLESS": "false",
        "PUPPETEER_EXECUTABLE_PATH": ""
      },
      "disabled": false
    }
  }
}
EOF

# Try to auto-detect Chrome path
CHROME_PATH=""
if command -v google-chrome &> /dev/null; then
    CHROME_PATH=$(which google-chrome)
elif command -v chromium &> /dev/null; then
    CHROME_PATH=$(which chromium)
elif command -v chromium-browser &> /dev/null; then
    CHROME_PATH=$(which chromium-browser)
fi

# Update Chrome path if found
if [ -n "$CHROME_PATH" ]; then
    echo "✅ Found Chrome at: $CHROME_PATH"
    # Update config with Chrome path
    sed -i "s|\"PUPPETEER_EXECUTABLE_PATH\": \"\"|\"PUPPETEER_EXECUTABLE_PATH\": \"$CHROME_PATH\"|" "$MCP_CONFIG_FILE"
else
    echo "⚠️  Chrome path not found. Using default."
fi

echo ""
echo "✅ MCP Browser configured!"
echo "📄 Config file: $MCP_CONFIG_FILE"
echo ""
echo "🔄 Next steps:"
echo "1. Restart Cursor IDE"
echo "2. MCP browser should be available automatically"
echo ""
echo "💡 To verify, try using browser tools in Cursor chat"


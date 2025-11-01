# 🤖 MCP Browser Auto Setup Guide

## 🎯 Mục đích

Tự động config MCP Browser cho Cursor IDE để dùng browser automation tools.

**Reference:** https://cursor.com/docs/agent/browser

---

## ⚡ Quick Setup

```bash
# Chạy script tự động
./tools/setup-mcp-browser-auto.sh

# Sau đó restart Cursor IDE
```

---

## 📋 Manual Setup (nếu script không chạy)

### 1. Tạo file config

```bash
mkdir -p ~/.cursor
```

### 2. Tạo/Update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cursor-ide-browser": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "env": {
        "PUPPETEER_HEADLESS": "false"
      },
      "disabled": false
    }
  }
}
```

### 3. Restart Cursor IDE

---

## ✅ Verify Setup

Sau khi restart, thử dùng browser tools trong Cursor chat:

```
Navigate to http://localhost:3000
Take a screenshot
Click on login button
```

Nếu hoạt động = Setup thành công! ✅

---

## 🔧 Troubleshooting

### Chrome not found
- Install Chrome/Chromium
- Hoặc set `PUPPETEER_EXECUTABLE_PATH` trong config

### Node.js version
- Cần Node.js 20+
- Check: `node -v`

### MCP not loading
- Check `~/.cursor/mcp.json` syntax đúng JSON
- Check Cursor IDE logs
- Restart Cursor IDE

---

## 📚 Browser Tools Available

- `browser_navigate` - Navigate to URL
- `browser_snapshot` - Get page snapshot
- `browser_click` - Click element
- `browser_type` - Type text
- `browser_screenshot` - Take screenshot
- `browser_console_messages` - Get console logs
- `browser_network_requests` - Get network logs

**Xem full list trong Cursor chat khi MCP đã load!**


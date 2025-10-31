# Hướng dẫn push code lên GitHub

## Đã commit code xong ✅

Code đã được commit với message:
```
feat: migrate to Firebase Auth + Firestore, add server-side auth guard, optimize PWA
```

## Bước push lên GitHub:

### Cách 1: Dùng HTTPS (cần Personal Access Token)

```bash
cd /home/mrkent/etax-web-new

# Push (GitHub sẽ hỏi username và password/token)
git push -u origin main
```

**Lưu ý:** Nếu GitHub hỏi password, dùng **Personal Access Token** (PAT), không dùng password thật:
1. Vào GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token với quyền `repo`
3. Copy token và dùng thay cho password

### Cách 2: Dùng SSH (nếu đã setup SSH key)

```bash
# Đổi remote sang SSH
git remote set-url origin git@github.com:mrkent19999x/Etaxfinal.git

# Push
git push -u origin main
```

### Cách 3: Dùng GitHub CLI (gh)

```bash
# Login
gh auth login

# Push
git push -u origin main
```

## Kiểm tra:

Sau khi push xong, check tại: https://github.com/mrkent19999x/Etaxfinal


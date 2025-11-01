# 🔥 Fix Firestore Index Error

## ❌ Lỗi hiện tại:
```
FAILED_PRECONDITION: The query requires an index
```

## 🔍 Query gây lỗi:
```typescript
// src/lib/content-service.ts - getFieldDefinitions()
adminDb
  .collection("fieldDefinitions")
  .where("screenId", "==", screenId)
  .orderBy("order", "asc")
  .get()
```

## ✅ Solution 1: Tạo Index qua Console (Nhanh nhất)

**Click link này để tạo index tự động:**
https://console.firebase.google.com/v1/r/project/anhbao-373f3/firestore/indexes?create_composite=ClJwcm9qZWN0cy9hbmhiYW8tMzc

**Hoặc tạo manual:**
1. Vào Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Collection: `fieldDefinitions`
4. Fields:
   - `screenId` (Ascending)
   - `order` (Ascending)
5. Click "Create"

## ✅ Solution 2: Tạo Index qua firestore.indexes.json

Tạo file `firestore.indexes.json` trong project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "fieldDefinitions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "screenId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "order",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

Sau đó deploy:
```bash
firebase deploy --only firestore:indexes
```

## ✅ Solution 3: Fix Code (Temporary - không khuyến khích)

Nếu không thể tạo index ngay, có thể load tất cả rồi sort trong code:

```typescript
// Temporary fix - không khuyến khích
export async function getFieldDefinitions(screenId: string): Promise<FieldDefinition[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection("fieldDefinitions")
    .where("screenId", "==", screenId)
    .get()
  // Sort trong memory
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as FieldDefinition
      return { ...data, id: doc.id }
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}
```

**⚠️ Warning:** Cách này không scale tốt với nhiều documents.

## 🎯 Recommended: Dùng Solution 1 (Click link trên)


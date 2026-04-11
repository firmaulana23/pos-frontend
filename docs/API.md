# POS System API Documentation

**Base URL:** `http://localhost:8080/api/v1`

> Header untuk semua protected endpoints:
> ```
> Authorization: Bearer <token>
> ```

## Standar Response Format

### Success Response
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "...",
  "error": {
    "code": 400,
    "details": "..."
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "...",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

---

## Auth

### POST /auth/login
Login user.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

---

### POST /auth/register
Register user baru.

**Request:**
```json
{
  "username": "cashier1",
  "email": "cashier1@example.com",
  "full_name": "Cashier One",
  "password": "password123",
  "role": "cashier"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "username": "cashier1",
      "email": "cashier1@example.com",
      "fullName": "Cashier One",
      "role": "cashier"
    }
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"cashier1","email":"cashier1@example.com","full_name":"Cashier One","password":"password123","role":"cashier"}'
```

---

## Profile (🔒 Protected)

### GET /profile
Get profil user yang login.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

```bash
curl http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer <token>"
```

### PUT /profile
Update profil user.

**Request:**
```json
{
  "username": "admin_updated",
  "email": "admin_new@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin_updated",
    "email": "admin_new@example.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_updated","email":"admin_new@example.com"}'
```

---

## User Management (🔒 Admin)

### GET /users
List semua user.

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <token>"
```

### GET /users/:id
Get user by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin",
    "is_active": true
  }
}
```

```bash
curl http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer <token>"
```

### PUT /users/:id
Update user.

**Request:**
```json
{
  "username": "admin",
  "full_name": "Admin Updated",
  "email": "admin@example.com",
  "password": "newpassword",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin Updated",
    "role": "admin",
    "is_active": true
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin Updated"}'
```

### PUT /users/:id/role
Update role user.

**Request:**
```json
{
  "role": "manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "manager",
    "is_active": true
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/users/1/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"manager"}'
```

### DELETE /users/:id
Hapus user.

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer <token>"
```

---

## Menu Categories (🔒 Protected)

### GET /menu/categories
List semua kategori + menu items.

**Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Makanan",
      "description": "Menu makanan",
      "menu_items": [
        {
          "id": 1,
          "name": "Nasi Goreng",
          "price": 25000,
          "is_available": true
        }
      ]
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/menu/categories \
  -H "Authorization: Bearer <token>"
```

### POST /menu/categories
Buat kategori baru.

**Request:**
```json
{
  "name": "Minuman",
  "description": "Menu minuman"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 2,
    "name": "Minuman",
    "description": "Menu minuman",
    "created_at": "2026-03-08T10:00:00+07:00",
    "updated_at": "2026-03-08T10:00:00+07:00"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/menu/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Minuman","description":"Menu minuman"}'
```

### PUT /menu/categories/:id
Update kategori.

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Makanan Berat",
    "description": "Menu makanan berat"
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/menu/categories/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Makanan Berat","description":"Menu makanan berat"}'
```

### DELETE /menu/categories/:id
Hapus kategori.

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/menu/categories/1 \
  -H "Authorization: Bearer <token>"
```

---

## Menu Items (🔒 Protected)

### GET /menu/items
List menu items dengan filter & pagination.

**Query Params:** `category_id`, `available`, `search`, `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng",
      "description": "Nasi goreng spesial",
      "price": 25000,
      "cogs": 10000,
      "margin": 60,
      "category_id": 1,
      "is_available": true,
      "image_url": "",
      "category": {
        "id": 1,
        "name": "Makanan"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "total_pages": 2
  }
}
```

```bash
curl "http://localhost:8080/api/v1/menu/items?category_id=1&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### GET /menu/items/:id
Get menu item by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item retrieved successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng",
    "description": "Nasi goreng spesial",
    "price": 25000,
    "cogs": 10000,
    "margin": 60,
    "category_id": 1,
    "is_available": true,
    "category": {
      "id": 1,
      "name": "Makanan"
    },
    "add_ons": [
      { "id": 1, "name": "Extra Cheese", "price": 5000 }
    ]
  }
}
```

```bash
curl http://localhost:8080/api/v1/menu/items/1 \
  -H "Authorization: Bearer <token>"
```

### POST /menu/items
Buat menu item baru.

**Request:**
```json
{
  "name": "Nasi Goreng",
  "description": "Nasi goreng spesial",
  "price": 25000,
  "cogs": 10000,
  "category_id": 1,
  "is_available": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng",
    "description": "Nasi goreng spesial",
    "price": 25000,
    "cogs": 10000,
    "category_id": 1,
    "is_available": true,
    "created_at": "2026-03-08T10:00:00+07:00"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/menu/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nasi Goreng","price":25000,"cogs":10000,"category_id":1,"is_available":true}'
```

### PUT /menu/items/:id
Update menu item.

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng Spesial",
    "price": 30000,
    "cogs": 12000,
    "category_id": 1,
    "is_available": true
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/menu/items/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nasi Goreng Spesial","price":30000,"cogs":12000}'
```

### DELETE /menu/items/:id
Hapus menu item.

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/menu/items/1 \
  -H "Authorization: Bearer <token>"
```

---

## Add-Ons (🔒 Protected)

### GET /add-ons
List add-ons dengan pagination.

**Query Params:** `menu_item_id`, `available`, `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "message": "Add-ons retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Extra Cheese",
      "description": "Tambahan keju",
      "price": 5000,
      "cogs": 2000,
      "margin": 60,
      "is_available": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

```bash
curl "http://localhost:8080/api/v1/add-ons?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### GET /add-ons/:id
Get add-on by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Add-on retrieved successfully",
  "data": {
    "id": 1,
    "name": "Extra Cheese",
    "description": "Tambahan keju",
    "price": 5000,
    "cogs": 2000,
    "is_available": true,
    "menu_items": [
      { "id": 1, "name": "Nasi Goreng", "price": 25000 }
    ]
  }
}
```

```bash
curl http://localhost:8080/api/v1/add-ons/1 \
  -H "Authorization: Bearer <token>"
```

### POST /add-ons
Buat add-on baru dan link ke menu items.

**Request:**
```json
{
  "name": "Extra Cheese",
  "description": "Tambahan keju",
  "price": 5000,
  "cogs": 2000,
  "is_available": true,
  "menu_item_ids": [1, 2, 3]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Add-on created and linked to menu items",
  "data": {
    "add_on": {
      "id": 1,
      "name": "Extra Cheese",
      "price": 5000,
      "is_available": true
    },
    "linked_menu_items": 3
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/add-ons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Extra Cheese","price":5000,"cogs":2000,"is_available":true,"menu_item_ids":[1,2,3]}'
```

### PUT /add-ons/:id
Update add-on.

**Response (200):**
```json
{
  "success": true,
  "message": "Add-on updated successfully",
  "data": {
    "id": 1,
    "name": "Extra Cheese Updated",
    "price": 6000,
    "cogs": 2500,
    "is_available": true
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/add-ons/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Extra Cheese Updated","price":6000,"cogs":2500}'
```

### DELETE /add-ons/:id
Hapus add-on.

**Response (200):**
```json
{
  "success": true,
  "message": "Add-on deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/add-ons/1 \
  -H "Authorization: Bearer <token>"
```

### GET /menu/items/:id/add-ons
Get add-ons untuk menu item tertentu.

**Response (200):**
```json
{
  "success": true,
  "message": "Add-ons for menu item retrieved successfully",
  "data": {
    "menu_item": {
      "id": 1,
      "name": "Nasi Goreng",
      "price": 25000
    },
    "add_ons": [
      { "id": 1, "name": "Extra Cheese", "price": 5000 }
    ]
  }
}
```

```bash
curl http://localhost:8080/api/v1/menu/items/1/add-ons \
  -H "Authorization: Bearer <token>"
```

### POST /add-ons/:id/menu-items
Tambah menu items ke add-on.

**Request:**
```json
{
  "menu_item_ids": [4, 5]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Menu items added to add-on",
  "data": {
    "add_on": { "id": 1, "name": "Extra Cheese", "price": 5000 },
    "added_menu_items": 2
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/add-ons/1/menu-items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_item_ids":[4,5]}'
```

### DELETE /add-ons/:id/menu-items
Hapus menu items dari add-on.

**Request:**
```json
{
  "menu_item_ids": [4]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Menu items removed from add-on",
  "data": {
    "add_on": { "id": 1, "name": "Extra Cheese", "price": 5000 },
    "removed_menu_items": 1
  }
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/add-ons/1/menu-items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_item_ids":[4]}'
```

---

## Transactions (🔒 Protected)

### POST /transactions
Buat transaksi baru.

**Request:**
```json
{
  "customer_name": "John",
  "tax": 2500,
  "member_id": 1,
  "promo_id": null,
  "notes": "notes",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "add_ons": [
        { "add_on_id": 1, "quantity": 1 }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": 1,
    "transaction_no": "TRX-1709900000",
    "user_id": 1,
    "customer_name": "John",
    "status": "pending",
    "sub_total": 55000,
    "tax": 2500,
    "discount": 0,
    "total": 57500,
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "unit_price": 25000,
        "total_price": 50000,
        "menu_item": { "id": 1, "name": "Nasi Goreng" },
        "add_ons": [
          { "add_on_id": 1, "quantity": 1, "unit_price": 5000, "total_price": 5000 }
        ]
      }
    ],
    "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John","tax":2500,"items":[{"menu_item_id":1,"quantity":2}]}'
```

### GET /transactions
List transaksi dengan filter & pagination.

**Query Params:** `status`, `customer_name`, `payment_method`, `start_date`, `end_date`, `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "transaction_no": "TRX-1709900000",
      "customer_name": "John",
      "status": "paid",
      "total": 57500,
      "payment_method": "cash",
      "paid_at": "2026-03-08T10:00:00+07:00",
      "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

```bash
curl "http://localhost:8080/api/v1/transactions?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### GET /transactions/:id
Get transaksi by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 1,
    "transaction_no": "TRX-1709900000",
    "user_id": 1,
    "customer_name": "John",
    "status": "paid",
    "sub_total": 55000,
    "tax": 2500,
    "discount": 0,
    "total": 57500,
    "payment_method": "cash",
    "paid_at": "2026-03-08T10:00:00+07:00",
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "unit_price": 25000,
        "total_price": 50000,
        "menu_item": { "id": 1, "name": "Nasi Goreng" },
        "add_ons": [
          { "add_on_id": 1, "quantity": 1, "unit_price": 5000, "total_price": 5000 }
        ]
      }
    ],
    "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
  }
}
```

```bash
curl http://localhost:8080/api/v1/transactions/1 \
  -H "Authorization: Bearer <token>"
```

### PUT /transactions/:id
Update transaksi (hanya untuk status pending).

**Request:**
```json
{
  "customer_name": "John Updated",
  "tax": 3000,
  "discount_percentage": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "id": 1,
    "transaction_no": "TRX-1709900000",
    "customer_name": "John Updated",
    "status": "pending",
    "sub_total": 55000,
    "tax": 3000,
    "discount": 5500,
    "discount_percentage": 10,
    "total": 52500,
    "items": [],
    "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/transactions/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John Updated","tax":3000}'
```

### PUT /transactions/:id/pay
Bayar transaksi.

**Request:**
```json
{
  "payment_method": "cash"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction paid successfully",
  "data": {
    "id": 1,
    "transaction_no": "TRX-1709900000",
    "customer_name": "John",
    "status": "paid",
    "sub_total": 55000,
    "tax": 2500,
    "total": 57500,
    "payment_method": "cash",
    "paid_at": "2026-03-08T10:05:00+07:00",
    "items": [],
    "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/transactions/1/pay \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"payment_method":"cash"}'
```

### DELETE /transactions/:id
Hapus transaksi.

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/transactions/1 \
  -H "Authorization: Bearer <token>"
```

### POST /transactions/:id/items
Tambah item ke transaksi.

**Request:**
```json
{
  "menu_item_id": 2,
  "quantity": 1,
  "add_ons": [
    { "add_on_id": 1, "quantity": 1 }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction item added successfully",
  "data": {
    "id": 2,
    "transaction_id": 1,
    "menu_item_id": 2,
    "quantity": 1,
    "unit_price": 22000,
    "total_price": 22000,
    "menu_item": { "id": 2, "name": "Mie Goreng" },
    "add_ons": [
      { "add_on_id": 1, "quantity": 1, "unit_price": 5000, "total_price": 5000 }
    ]
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/transactions/1/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_item_id":2,"quantity":1}'
```

### PUT /transactions/:id/items/:item_id
Update item transaksi.

**Request:**
```json
{
  "quantity": 3,
  "add_ons": [
    { "add_on_id": 1, "quantity": 2 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction item updated successfully",
  "data": {
    "id": 1,
    "transaction_id": 1,
    "menu_item_id": 1,
    "quantity": 3,
    "unit_price": 25000,
    "total_price": 75000,
    "menu_item": { "id": 1, "name": "Nasi Goreng" },
    "add_ons": [
      { "add_on_id": 1, "quantity": 2, "unit_price": 5000, "total_price": 10000 }
    ]
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/transactions/1/items/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity":3}'
```

### DELETE /transactions/:id/items/:item_id
Hapus item dari transaksi.

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction item deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/transactions/1/items/1 \
  -H "Authorization: Bearer <token>"
```

---

## Payment Methods (🔒 Protected)

### GET /payment-methods
List metode pembayaran.

**Response (200):**
```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": [
    { "id": 1, "name": "cash", "is_active": true },
    { "id": 2, "name": "debit", "is_active": true },
    { "id": 3, "name": "qris", "is_active": true }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/payment-methods \
  -H "Authorization: Bearer <token>"
```

---

## Expenses (🔒 Protected)

### POST /expenses
Buat pengeluaran baru.

**Request:**
```json
{
  "type": "operational",
  "category": "Listrik",
  "description": "Bayar listrik bulan Maret",
  "amount": 500000,
  "date": "2026-03-08",
  "payment_method": "cash"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 1,
    "type": "operational",
    "category": "Listrik",
    "description": "Bayar listrik bulan Maret",
    "amount": 500000,
    "date": "2026-03-08T00:00:00Z",
    "user_id": 1,
    "created_at": "2026-03-08T10:00:00+07:00",
    "payment_method": "cash"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/expenses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"operational","category":"Listrik","description":"Bayar listrik","amount":500000,"date":"2026-03-08"}'
```

### GET /expenses
List pengeluaran dengan pagination.

**Query Params:** `type`, `category`, `start_date`, `end_date`, `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "operational",
      "category": "Listrik",
      "description": "Bayar listrik bulan Maret",
      "amount": 500000,
      "date": "2026-03-08T00:00:00Z",
      "user_id": 1,
      "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

```bash
curl "http://localhost:8080/api/v1/expenses?type=operational&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### GET /expenses/:id
Get expense by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Expense retrieved successfully",
  "data": {
    "id": 1,
    "type": "operational",
    "category": "Listrik",
    "description": "Bayar listrik bulan Maret",
    "amount": 500000,
    "date": "2026-03-08T00:00:00Z",
    "user_id": 1,
    "user": { "id": 1, "username": "admin", "full_name": "Admin User" }
  }
}
```

```bash
curl http://localhost:8080/api/v1/expenses/1 \
  -H "Authorization: Bearer <token>"
```

### PUT /expenses/:id
Update expense.

**Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "id": 1,
    "type": "operational",
    "category": "Listrik",
    "description": "Bayar listrik updated",
    "amount": 550000,
    "date": "2026-03-08T00:00:00Z",
    "user_id": 1
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/expenses/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":550000,"description":"Bayar listrik updated"}'
```

### DELETE /expenses/:id
Hapus expense.

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/expenses/1 \
  -H "Authorization: Bearer <token>"
```

### GET /expenses/summary
Ringkasan pengeluaran.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Expense summary retrieved successfully",
  "data": {
    "total_expenses": 1500000,
    "expenses_by_type": [
      { "type": "operational", "total": 1000000 },
      { "type": "raw_material", "total": 500000 }
    ],
    "expenses_by_category": [
      { "category": "Listrik", "total": 500000 },
      { "category": "Air", "total": 200000 }
    ]
  }
}
```

```bash
curl "http://localhost:8080/api/v1/expenses/summary?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

---

## Dashboard (🔒 Admin/Manager)

### GET /dashboard/data
Data dashboard utama.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "total_sales": 5000000,
    "total_orders": 150,
    "total_expenses": 1500000,
    "net_profit": 3500000
  }
}
```

```bash
curl "http://localhost:8080/api/v1/dashboard/data?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

### GET /dashboard/stats
Statistik dashboard lengkap.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "total_sales": 5000000,
    "total_cogs": 2000000,
    "gross_profit": 3000000,
    "gross_margin": 60,
    "total_operational_expenses": 500000,
    "total_raw_material_expenses": 1000000,
    "net_profit": 2500000,
    "total_orders": 150,
    "pending_orders": 5,
    "paid_orders": 145,
    "top_menu_items": [
      { "name": "Nasi Goreng", "total_sold": 80, "total_revenue": 2000000 }
    ],
    "top_add_ons": [
      { "name": "Extra Cheese", "total_sold": 50, "total_revenue": 250000 }
    ],
    "sales_chart": [],
    "expense_chart": [],
    "sales_by_payment_method": []
  }
}
```

```bash
curl "http://localhost:8080/api/v1/dashboard/stats?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

### GET /dashboard/sales-report
Laporan penjualan.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Sales report retrieved successfully",
  "data": {
    "total_sales": 5000000,
    "total_orders": 150,
    "average_order": 33333.33,
    "top_categories": [
      { "category_name": "Makanan", "total_sales": 3500000, "total_orders": 100 },
      { "category_name": "Minuman", "total_sales": 1500000, "total_orders": 50 }
    ]
  }
}
```

```bash
curl "http://localhost:8080/api/v1/dashboard/sales-report?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

### GET /dashboard/profit-analysis
Analisis profit.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Profit analysis retrieved successfully",
  "data": {
    "gross_profit": 3000000,
    "net_profit": 2500000,
    "profit_margin": 50,
    "cogs": 1500000,
    "revenue": 5000000,
    "expenses": 500000,
    "addon_revenue": 250000,
    "addon_cogs": 100000
  }
}
```

```bash
curl "http://localhost:8080/api/v1/dashboard/profit-analysis?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

---

## Stock Management (🔒 Protected)

### GET /stock/raw-materials
List semua bahan baku.

**Response (200):**
```json
{
  "success": true,
  "message": "Raw materials retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Beras",
      "unit_of_measure": "kg",
      "current_stock": 50,
      "minimum_stock": 10
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/stock/raw-materials \
  -H "Authorization: Bearer <token>"
```

### POST /stock/raw-materials
Buat bahan baku baru.

**Request:**
```json
{
  "name": "Beras",
  "unit_of_measure": "kg",
  "current_stock": 50,
  "minimum_stock": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Raw material created successfully",
  "data": {
    "id": 1,
    "name": "Beras",
    "unit_of_measure": "kg",
    "current_stock": 50,
    "created_at": "2026-03-08T10:00:00+07:00"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/stock/raw-materials \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Beras","unit_of_measure":"kg","current_stock":50,"minimum_stock":10}'
```

### PUT /stock/raw-materials/:id
Update bahan baku.

**Response (200):**
```json
{
  "success": true,
  "message": "Raw material updated successfully",
  "data": {
    "id": 1,
    "name": "Beras Premium",
    "unit_of_measure": "kg",
    "current_stock": 50
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/stock/raw-materials/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Beras Premium","minimum_stock":15}'
```

### DELETE /stock/raw-materials/:id
Hapus bahan baku.

**Response (200):**
```json
{
  "success": true,
  "message": "Raw material deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/stock/raw-materials/1 \
  -H "Authorization: Bearer <token>"
```

### POST /stock/receipts
Catat stok masuk.

**Request:**
```json
{
  "raw_material_id": 1,
  "quantity": 25,
  "notes": "Pembelian dari supplier A"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Stock receipt created successfully",
  "data": {
    "id": 1,
    "raw_material_id": 1,
    "quantity": 25,
    "receipt_date": "2026-03-08T10:00:00+07:00",
    "notes": "Pembelian dari supplier A"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/stock/receipts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"raw_material_id":1,"quantity":25,"notes":"Pembelian dari supplier A"}'
```

### POST /stock/adjustments
Catat penyesuaian stok.

**Request:**
```json
{
  "raw_material_id": 1,
  "quantity": 2,
  "reason": "Expired",
  "notes": "Beras kadaluarsa"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Stock adjustment created successfully",
  "data": {
    "id": 1,
    "raw_material_id": 1,
    "quantity": -2,
    "adjustment_date": "2026-03-08T10:00:00+07:00",
    "reason": "Expired",
    "notes": "Beras kadaluarsa"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/stock/adjustments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"raw_material_id":1,"quantity":2,"reason":"Expired","notes":"Beras kadaluarsa"}'
```

### GET /stock/summary
Get rekap stok harian.

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Daily summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "summary_date": "2026-03-08T00:00:00Z",
      "raw_material_id": 1,
      "beginning_stock": 50,
      "receipts_in": 25,
      "total_available": 75,
      "ending_stock": 43,
      "daily_usage": 32,
      "theoretical_usage": 30,
      "adjustments": -2,
      "variance": 0,
      "raw_material": { "id": 1, "name": "Beras", "unit_of_measure": "kg" }
    }
  ]
}
```

```bash
curl "http://localhost:8080/api/v1/stock/summary?start_date=2026-03-01&end_date=2026-03-08" \
  -H "Authorization: Bearer <token>"
```

### POST /stock/summary
Buat rekap stok harian.

**Request:**
```json
[
  {
    "raw_material_id": 1,
    "ending_stock": 43,
    "notes": "Stok akhir hari"
  }
]
```

**Response (201):**
```json
{
  "success": true,
  "message": "Daily summaries created successfully"
}
```

```bash
curl -X POST http://localhost:8080/api/v1/stock/summary \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[{"raw_material_id":1,"ending_stock":43,"notes":"Stok akhir hari"}]'
```

### GET /stock/menu-item-materials/:menu_item_id
Get resep bahan baku menu item.

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item materials retrieved successfully",
  "data": [
    {
      "menu_item_id": 1,
      "raw_material_id": 1,
      "quantity_used": 0.15,
      "raw_material": { "id": 1, "name": "Beras", "unit_of_measure": "kg" }
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/stock/menu-item-materials/1 \
  -H "Authorization: Bearer <token>"
```

### POST /stock/menu-item-materials
Tambah bahan baku ke menu item.

**Request:**
```json
{
  "menu_item_id": 1,
  "raw_material_id": 1,
  "quantity_used": 0.15
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Menu item material added successfully",
  "data": {
    "menu_item_id": 1,
    "raw_material_id": 1,
    "quantity_used": 0.15
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/stock/menu-item-materials \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_item_id":1,"raw_material_id":1,"quantity_used":0.15}'
```

### DELETE /stock/menu-item-materials/:menu_item_id/:raw_material_id
Hapus bahan baku dari menu item.

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item material removed successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/stock/menu-item-materials/1/1 \
  -H "Authorization: Bearer <token>"
```

---

## Members (🔒 Protected)

### GET /members
List semua member.

**Response (200):**
```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone_number": "081234567890",
      "email": "john@example.com",
      "card_number": "12345678",
      "points": 150,
      "discount": 10,
      "expired_date": "2027-03-08T00:00:00Z"
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/members \
  -H "Authorization: Bearer <token>"
```

### POST /members
Buat member baru (card number auto-generated).

**Request:**
```json
{
  "full_name": "John Doe",
  "phone_number": "081234567890",
  "email": "john@example.com",
  "discount": 10,
  "expired_date": "2027-03-08T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone_number": "081234567890",
    "email": "john@example.com",
    "card_number": "A1B2C3D4",
    "points": 0,
    "discount": 10,
    "expired_date": "2027-03-08T00:00:00Z"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","phone_number":"081234567890","discount":10}'
```

### GET /members/card/:cardNumber
Cari member by card number.

**Response (200):**
```json
{
  "success": true,
  "message": "Member retrieved successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone_number": "081234567890",
    "email": "john@example.com",
    "card_number": "12345678",
    "points": 150,
    "discount": 10,
    "expired_date": "2027-03-08T00:00:00Z"
  }
}
```

```bash
curl http://localhost:8080/api/v1/members/card/12345678 \
  -H "Authorization: Bearer <token>"
```

### GET /members/validate
Validasi member (cek expired).

**Query Params:** `card_number`

**Response (200):**
```json
{
  "success": true,
  "message": "Member is valid",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone_number": "081234567890",
    "card_number": "12345678",
    "points": 150,
    "discount": 10,
    "expired_date": "2027-03-08T00:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Member validation failed",
  "error": {
    "code": 400,
    "details": "Member has expired"
  }
}
```

```bash
curl "http://localhost:8080/api/v1/members/validate?card_number=12345678" \
  -H "Authorization: Bearer <token>"
```

### PUT /members/:id
Update member.

**Response (200):**
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "id": 1,
    "full_name": "John Updated",
    "phone_number": "081234567890",
    "email": "john@example.com",
    "card_number": "12345678",
    "points": 100,
    "discount": 15,
    "expired_date": "2027-03-08T00:00:00Z"
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/members/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Updated","points":100,"discount":15}'
```

### DELETE /members/:id
Hapus member.

**Response (200):**
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/members/1 \
  -H "Authorization: Bearer <token>"
```

### POST /members/:id/redeem
Redeem poin member untuk menu item.

**Request:**
```json
{
  "menu_item_id": 1,
  "quantity": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Points redeemed successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "card_number": "12345678",
    "points": 125,
    "discount": 10
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/members/1/redeem \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_item_id":1,"quantity":1}'
```

---

## Promos (🔒 Protected)

### GET /promos
List semua promo.

**Response (200):**
```json
{
  "success": true,
  "message": "Promos retrieved successfully",
  "data": [
    {
      "id": 1,
      "code": "MARET20",
      "name": "Promo Maret",
      "description": "Diskon 20% semua menu",
      "discount_type": "percentage",
      "discount_value": 20,
      "min_order_amount": 50000,
      "max_discount": 30000,
      "start_date": "2026-03-01T00:00:00Z",
      "end_date": "2026-03-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

```bash
curl http://localhost:8080/api/v1/promos \
  -H "Authorization: Bearer <token>"
```

### POST /promos
Buat promo baru.

**Request:**
```json
{
  "name": "Promo Maret",
  "description": "Diskon 20% semua menu",
  "code": "MARET20",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_amount": 50000,
  "max_discount": 30000,
  "start_date": "2026-03-01T00:00:00Z",
  "end_date": "2026-03-31T23:59:59Z",
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Promo created successfully",
  "data": {
    "id": 1,
    "code": "MARET20",
    "name": "Promo Maret",
    "discount_type": "percentage",
    "discount_value": 20,
    "is_active": true,
    "created_at": "2026-03-08T10:00:00+07:00"
  }
}
```

```bash
curl -X POST http://localhost:8080/api/v1/promos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Promo Maret","code":"MARET20","discount_type":"percentage","discount_value":20,"is_active":true}'
```

### GET /promos/validate
Validasi kode promo.

**Query Params:** `code`

**Response (200):**
```json
{
  "success": true,
  "message": "Promo is valid",
  "data": {
    "id": 1,
    "code": "MARET20",
    "name": "Promo Maret",
    "description": "Diskon 20% semua menu",
    "discount_type": "percentage",
    "discount_value": 20,
    "min_order_amount": 50000,
    "max_discount": 30000,
    "start_date": "2026-03-01T00:00:00Z",
    "end_date": "2026-03-31T23:59:59Z",
    "is_active": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Promo validation failed",
  "error": {
    "code": 400,
    "details": "Promo code has expired"
  }
}
```

```bash
curl "http://localhost:8080/api/v1/promos/validate?code=MARET20" \
  -H "Authorization: Bearer <token>"
```

### PUT /promos/:id
Update promo.

**Response (200):**
```json
{
  "success": true,
  "message": "Promo updated successfully",
  "data": {
    "id": 1,
    "code": "MARET20",
    "name": "Promo Maret Updated",
    "description": "Diskon 25% semua menu",
    "discount_type": "percentage",
    "discount_value": 25,
    "min_order_amount": 50000,
    "max_discount": 30000,
    "start_date": "2026-03-01T00:00:00Z",
    "end_date": "2026-03-31T23:59:59Z",
    "is_active": true
  }
}
```

```bash
curl -X PUT http://localhost:8080/api/v1/promos/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Promo Maret Updated","discount_value":25}'
```

### DELETE /promos/:id
Hapus promo.

**Response (200):**
```json
{
  "success": true,
  "message": "Promo deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8080/api/v1/promos/1 \
  -H "Authorization: Bearer <token>"
```

---

## Reports (🔒 Admin/Manager)

### GET /reports
Get laporan komprehensif (JSON).

**Query Params:** `start_date`, `end_date`

**Response (200):**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "period": "2026-03-01 s/d 2026-03-31",
    "generated_at": "2026-03-08T10:00:00+07:00",
    "sales": {
      "total_transactions": 150,
      "total_revenue": 5000000,
      "total_sub_total": 4800000,
      "total_tax": 200000,
      "total_discount": 100000
    },
    "expense_summary": 1500000,
    "transactions": [],
    "expenses": [],
    "promo_usages": [],
    "member_activities": [],
    "payment_methods": [],
    "stock_receipts": [],
    "stock_adjustments": [],
    "stock_summaries": []
  }
}
```

```bash
curl "http://localhost:8080/api/v1/reports?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

### GET /reports/download/excel
Download laporan dalam format Excel.

**Query Params:** `start_date`, `end_date`

> Response: File download (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

```bash
curl -O -J "http://localhost:8080/api/v1/reports/download/excel?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

### GET /reports/download/pdf
Download laporan dalam format PDF.

**Query Params:** `start_date`, `end_date`

> Response: File download (`application/pdf`)

```bash
curl -O -J "http://localhost:8080/api/v1/reports/download/pdf?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

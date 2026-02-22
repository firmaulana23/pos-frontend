# POS System API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Key Features

### Dashboard Analytics
The POS system provides comprehensive analytics including:
- **Financial Metrics**: Total sales, COGS, gross profit, gross margin percentage, net profit
- **Order Statistics**: Total orders, pending orders, paid orders
- **Performance Analytics**: Top-selling menu items and add-ons
- **Visual Charts**: Sales trends and expense breakdowns by date and type

### Menu-Dependent Add-ons
The POS system supports two types of add-ons:

1. **Global Add-ons** (`menu_item_id: null`): Available for all menu items
   - Example: "Whipped Cream", "Extra Hot", "Decaf"
   
2. **Menu-Specific Add-ons** (`menu_item_id: 4`): Only available for specific menu items
   - Example: "Latte Art" (only for Lattes), "Extra Foam" (only for Cappuccinos)

### Cost Management
- **COGS Tracking**: Track Cost of Goods Sold for menu items and add-ons
- **Margin Calculation**: Automatic margin calculation: `((Price - COGS) / Price) * 100`
- **Expense Categories**: Support for raw materials and operational expenses
- **Profit Analysis**: Gross profit (Sales - COGS) and net profit (Gross profit - Expenses)

## Authentication

The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@pos.com",
        "full_name": "",
        "role": "admin",
        "is_active": true,
        "created_at": "2025-07-07T00:34:37.207182+07:00",
        "updated_at": "2025-07-07T00:34:37.207182+07:00"
    }
}
```

## Public Endpoints (No Authentication Required)

The POS system provides public endpoints for Point of Sale operations that don't require authentication. These are designed to be used by POS terminals.

### Get Categories (Public)
```http
GET /api/v1/public/menu/categories
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "Coffee",
        "description": "Hot and cold coffee beverages",
        "created_at": "2025-07-09T15:07:53.253915+07:00",
        "updated_at": "2025-07-09T15:07:53.253915+07:00",
        "menu_items": [
            {
                "id": 4,
                "category_id": 1,
                "name": "Latte",
                "price": 28000,
                "cogs": 14000,
                "is_available": true
            }
        ]
    }
]
```

### Get Menu Items (Public)
```http
GET /api/v1/public/menu/items?category_id=1
```

**Response:**
```json
{
    "data": [
        {
            "id": 4,
            "category_id": 1,
            "name": "Latte",
            "description": "Espresso with steamed milk",
            "price": 28000,
            "cogs": 14000,
            "margin": 50.0,
            "is_available": true,
            "image_url": "",
            "created_at": "2025-07-09T15:07:53.253915+07:00",
            "updated_at": "2025-07-09T15:07:53.253915+07:00",
            "category": {
                "id": 1,
                "name": "Coffee",
                "description": "Hot and cold coffee beverages"
            },
            "add_ons": [
                {
                    "id": 17,
                    "menu_item_id": 4,
                    "name": "Double Shot for Latte",
                    "description": "Double espresso shot specifically for lattes",
                    "price": 8000,
                    "cogs": 3000,
                    "margin": 62.5,
                    "is_available": true
                },
                {
                    "id": 2,
                    "menu_item_id": null,
                    "name": "Whipped Cream",
                    "description": "Fresh whipped cream",
                    "price": 3000,
                    "cogs": 1500,
                    "margin": 50.0,
                    "is_available": true
                }
            ]
        }
    ]
}
```

### Get Menu Item (Public)
```http
GET /api/v1/public/menu/items/{id}
```

**Response:**
```json
{
    "id": 4,
    "category_id": 1,
    "name": "Latte",
    "description": "Espresso with steamed milk",
    "price": 28000,
    "cogs": 14000,
    "margin": 50.0,
    "is_available": true,
    "image_url": "",
    "created_at": "2025-07-09T15:07:53.253915+07:00",
    "updated_at": "2025-07-09T15:07:53.253915+07:00",
    "category": {
        "id": 1,
        "name": "Coffee",
        "description": "Hot and cold coffee beverages"
    }
}
```

### Get Add-ons (Public)
```http
GET /api/v1/public/add-ons?available=true
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "menu_item_id": null,
            "name": "Extra Shot",
            "description": "Additional espresso shot",
            "price": 8000,
            "cogs": 4000,
            "margin": 50.0,
            "is_available": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": 17,
            "menu_item_id": 4,
            "name": "Double Shot for Latte",
            "description": "Double espresso shot specifically for lattes",
            "price": 8000,
            "cogs": 3000,
            "margin": 62.5,
            "is_available": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "menu_item": {
                "id": 4,
                "name": "Latte",
                "price": 28000
            }
        }
    ]
}
```

### Get Add-on (Public)
```http
GET /api/v1/public/add-ons/{id}
```

**Response:**
```json
{
    "id": 1,
    "name": "Extra Shot",
    "description": "Additional espresso shot",
    "price": 8000,
    "cogs": 4000,
    "margin": 50.0,
    "is_available": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "menu_items": [
        {
            "id": 4,
            "category_id": 1,
            "name": "Latte",
            "price": 28000,
            "cogs": 14000,
            "is_available": true
        }
    ]
}
```

### Get Add-ons for Menu Item (Public)
```http
GET /api/v1/public/menu-item-add-ons/{menu_item_id}
```

### Get Payment Methods (Public)
```http
GET /api/v1/public/payment-methods
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Cash",
            "code": "cash",
            "is_active": true
        },
        {
            "id": 2,
            "name": "Qris",
            "code": "qris",
            "is_active": true
        },
        {
            "id": 3,
            "name": "Digital Wallet",
            "code": "digital_wallet",
            "is_active": true
        }
    ]
}
```

## User Management


### Get Profile
```http
GET /api/v1/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
    "id": 1,
    "username": "admin",
    "email": "admin@pos.com",
    "full_name": "",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-07-07T00:34:37.207182+07:00",
    "updated_at": "2025-07-07T00:34:37.207182+07:00"
}
```

### Update Profile
```http
PUT /api/v1/profile
Authorization: Bearer <token>
Content-Type: application/json

{
    "full_name": "New Full Name",
    "email": "new.email@example.com"
}
```
**Response:**
```json
{
    "id": 1,
    "username": "admin",
    "email": "new.email@example.com",
    "full_name": "New Full Name",
    "role": "admin",
    "is_active": true
}
```

### Register User (Admin only)
```http
POST /api/v1/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "username": "newuser",
    "email": "newuser@pos.com",
    "password": "password123",
    "role": "cashier"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 2,
        "username": "newuser",
        "email": "newuser@pos.com",
        "full_name": "New User",
        "role": "cashier",
        "is_active": true,
        "created_at": "2025-07-10T10:00:00.000000+07:00",
        "updated_at": "2025-07-10T10:00:00.000000+07:00"
    }
}
```

### Get Users
```http
GET /api/v1/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
    {
        "id": 1,
        "username": "admin",
        "email": "admin@pos.com",
        "full_name": "",
        "role": "admin",
        "is_active": true,
        "created_at": "2025-07-07T00:34:37.207182+07:00",
        "updated_at": "2025-07-07T00:34:37.207182+07:00"
    },
    {
        "id": 2,
        "username": "newuser",
        "email": "newuser@pos.com",
        "full_name": "New User",
        "role": "cashier",
        "is_active": true,
        "created_at": "2025-07-10T10:00:00.000000+07:00",
        "updated_at": "2025-07-10T10:00:00.000000+07:00"
    }
]
```

### Get User
```http
GET /api/v1/users/{id}
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "id": 2,
    "username": "newuser",
    "email": "newuser@pos.com",
    "full_name": "New User",
    "role": "cashier",
    "is_active": true,
    "created_at": "2025-07-10T10:00:00.000000+07:00",
    "updated_at": "2025-07-10T10:00:00.000000+07:00"
}
```

### Update User
```http
PUT /api/v1/users/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "full_name": "Updated Name",
    "email": "updated.email@example.com",
    "is_active": true
}
```

**Response:**
```json
{
    "id": 2,
    "username": "updateduser",
    "email": "updated@pos.com",
    "full_name": "Updated Name",
    "role": "manager",
    "is_active": true,
    "created_at": "2025-07-10T10:00:00.000000+07:00",
    "updated_at": "2025-07-10T11:00:00.000000+07:00"
}
```

### Update User Role
```http
PUT /api/v1/users/{id}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "role": "manager"
}
```

**Response:**
```json
{
    "id": 2,
    "username": "updateduser",
    "email": "updated@pos.com",
    "full_name": "Updated Name",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-07-10T10:00:00.000000+07:00",
    "updated_at": "2025-07-10T12:00:00.000000+07:00"
}
```

### Delete User
```http
DELETE /api/v1/users/{id}
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "message": "User deleted successfully"
}
```

**Available Roles:**
- `admin`: Full system access
- `manager`: Can manage menu, transactions, expenses, view analytics
- `cashier`: Can create transactions, view menu

## Menu Management

### Get Categories
```http
GET /api/v1/menu/categories
Authorization: Bearer <token>
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "Coffee",
        "description": "Hot and cold coffee beverages",
        "created_at": "2025-07-09T15:07:53.253915+07:00",
        "updated_at": "2025-07-09T15:07:53.253915+07:00",
        "menu_items": [
            {
                "id": 4,
                "category_id": 1,
                "name": "Latte",
                "price": 28000,
                "cogs": 14000,
                "is_available": true
            }
        ]
    }
]
```

**Note:** Categories are also available at the public endpoint `/api/v1/public/menu/categories` for POS display without authentication.

### Create Category (Admin/Manager)
```http
POST /api/v1/menu/categories
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "New Category",
    "description": "Category description"
}
```

**Response:**
```json
{
    "id": 2,
    "name": "New Category",
    "description": "Category description",
    "created_at": "2025-07-10T13:00:00.000000+07:00",
    "updated_at": "2025-07-10T13:00:00.000000+07:00"
}
```

### Get Menu Items
```http
GET /api/v1/menu/items?category_id=1&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `category_id` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
    "data": [
        {
            "id": 4,
            "category_id": 1,
            "name": "Latte",
            "description": "Espresso with steamed milk",
            "price": 28000,
            "cogs": 14000,
            "margin": 50.0,
            "is_available": true,
            "image_url": "",
            "created_at": "2025-07-09T15:07:53.253915+07:00",
            "updated_at": "2025-07-09T15:07:53.253915+07:00",
            "category": {
                "id": 1,
                "name": "Coffee",
                "description": "Hot and cold coffee beverages"
            },
            "add_ons": [
                {
                    "id": 17,
                    "menu_item_id": 4,
                    "name": "Double Shot for Latte",
                    "description": "Double espresso shot specifically for lattes",
                    "price": 8000,
                    "cogs": 3000,
                    "margin": 62.5,
                    "is_available": true
                },
                {
                    "id": 2,
                    "menu_item_id": null,
                    "name": "Whipped Cream",
                    "description": "Fresh whipped cream",
                    "price": 3000,
                    "cogs": 1500,
                    "margin": 50.0,
                    "is_available": true
                }
            ]
        }
    ]
}
```

**Note:** Menu items now include their associated add-ons (both menu-specific and global add-ons).

### Create Menu Item (Admin/Manager)
```http
POST /api/v1/menu/items
Authorization: Bearer <token>
Content-Type: application/json

{
    "category_id": 1,
    "name": "New Coffee",
    "description": "Delicious new coffee",
    "price": 25000,
    "cogs": 12000,
    "is_available": true
}
```

### Update Category (Admin/Manager)
```http
PUT /api/v1/menu/categories/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Updated Category Name",
    "description": "Updated category description"
}
```

**Response:**
```json
{
    "id": 1,
    "name": "Updated Category Name",
    "description": "Updated category description",
    "created_at": "2025-07-09T15:07:53.253915+07:00",
    "updated_at": "2025-07-10T10:00:00.000000+07:00"
}
```

### Delete Category (Admin/Manager)
```http
DELETE /api/v1/menu/categories/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Category deleted successfully"
}
```

### Get Menu Item
```http
GET /api/v1/menu/items/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "id": 4,
    "category_id": 1,
    "name": "Latte",
    "description": "Espresso with steamed milk",
    "price": 28000,
    "cogs": 14000,
    "margin": 50.0,
    "is_available": true,
    "image_url": "",
    "created_at": "2025-07-09T15:07:53.253915+07:00",
    "updated_at": "2025-07-09T15:07:53.253915+07:00",
    "category": {
        "id": 1,
        "name": "Coffee",
        "description": "Hot and cold coffee beverages"
    }
}
```

### Update Menu Item (Admin/Manager)
```http
PUT /api/v1/menu/items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "category_id": 1,
    "name": "Updated Latte",
    "description": "Updated description",
    "price": 30000,
    "cogs": 15000,
    "is_available": false
}
```

**Response:**
```json
{
    "id": 4,
    "category_id": 1,
    "name": "Updated Latte",
    "description": "Updated description",
    "price": 30000,
    "cogs": 15000,
    "margin": 50.0,
    "is_available": false,
    "image_url": "",
    "created_at": "2025-07-09T15:07:53.253915+07:00",
    "updated_at": "2025-07-10T11:00:00.000000+07:00"
}
```

### Delete Menu Item (Admin/Manager)
```http
DELETE /api/v1/menu/items/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Menu item deleted successfully"
}
```

## Add-ons Management

The system supports both **global add-ons** (available for all menu items) and **menu-specific add-ons** (only available for specific menu items).

### Get All Add-ons
```http
GET /api/v1/add-ons?available=true&menu_item_id=4
```

**Query Parameters:**
- `available` (boolean): Filter by availability status
- `menu_item_id` (integer): Filter by specific menu item ID, or use "global" for global add-ons only

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "menu_item_id": null,
            "name": "Extra Shot",
            "description": "Additional espresso shot",
            "price": 8000,
            "cogs": 4000,
            "margin": 50.0,
            "is_available": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": 17,
            "menu_item_id": 4,
            "name": "Double Shot for Latte",
            "description": "Double espresso shot specifically for lattes",
            "price": 8000,
            "cogs": 3000,
            "margin": 62.5,
            "is_available": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "menu_item": {
                "id": 4,
                "name": "Latte",
                "price": 28000
            }
        }
    ]
}
```

### Get Add-on
```http
GET /api/v1/add-ons/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "id": 1,
    "name": "Extra Shot",
    "description": "Additional espresso shot",
    "price": 8000,
    "cogs": 4000,
    "margin": 50.0,
    "is_available": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "menu_items": [
        {
            "id": 4,
            "category_id": 1,
            "name": "Latte",
            "price": 28000,
            "cogs": 14000,
            "is_available": true
        }
    ]
}
```

### Get Add-ons for Specific Menu Item
```http
GET /api/v1/public/menu-item-add-ons/{menu_item_id}
```

Returns both global add-ons and menu-specific add-ons for the given menu item.

**Response:**
```json
{
    "add_ons": [
        {
            "id": 1,
            "menu_item_id": null,
            "name": "Extra Shot",
            "description": "Additional espresso shot",
            "price": 8000,
            "cogs": 4000,
            "margin": 50.0,
            "is_available": true
        },
        {
            "id": 17,
            "menu_item_id": 4,
            "name": "Double Shot for Latte",
            "description": "Double espresso shot specifically for lattes",
            "price": 8000,
            "cogs": 3000,
            "margin": 62.5,
            "is_available": true
        }
    ],
    "menu_item": {
        "id": 4,
        "name": "Latte"
    }
}
```

### Create Add-on (Admin/Manager)
```http
POST /api/v1/add-ons
Authorization: Bearer <token>
Content-Type: application/json
```

**Global Add-on Example:**
```json
{
    "name": "Oat Milk",
    "description": "Premium oat milk substitute",
    "price": 7000,
    "cogs": 4000,
    "is_available": true
}
```

**Menu-Specific Add-on Example:**
```json
{
    "menu_item_id": 4,
    "name": "Latte Art",
    "description": "Beautiful latte art design (only for lattes)",
    "price": 5000,
    "cogs": 0,
    "is_available": true
}
```

**Response:**
```json
{
    "message": "Add-on created and assigned to 1 menu items successfully",
    "data": {
        "id": 18,
        "name": "Oat Milk",
        "description": "Premium oat milk substitute",
        "price": 7000,
        "cogs": 4000,
        "margin": 42.857142857142854,
        "is_available": true,
        "created_at": "2025-07-10T14:00:00.000000+07:00",
        "updated_at": "2025-07-10T14:00:00.000000+07:00",
        "menu_items": [
            {
                "id": 4,
                "category_id": 1,
                "name": "Latte",
                "price": 28000
            }
        ]
    }
}
```

### Update Add-on (Admin/Manager)
```http
PUT /api/v1/add-ons/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "menu_item_id": 4,
    "name": "Updated Add-on Name",
    "description": "Updated description",
    "price": 6000,
    "cogs": 3000,
    "is_available": true
}
```

**Response:**
```json
{
    "id": 1,
    "name": "Updated Add-on Name",
    "description": "Updated description",
    "price": 6000,
    "cogs": 3000,
    "margin": 50.0,
    "is_available": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

### Delete Add-on (Admin/Manager)
```http
DELETE /api/v1/add-ons/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Add-on deleted successfully"
}
```

### Add Menu Items to Add-on
Associates a list of menu items with a specific add-on.

```http
POST /api/v1/add-ons/{id}/menu-items
Authorization: Bearer <token>
Content-Type: application/json

{
    "menu_item_ids": [1, 2, 3]
}
```

**Response:**
```json
{
    "message": "Added 2 menu items to add-on successfully",
    "data": {
        "id": 1,
        "name": "Extra Shot",
        "description": "Additional espresso shot",
        "price": 8000,
        "cogs": 4000,
        "margin": 50.0,
        "is_available": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "menu_items": [
            {
                "id": 1,
                "category_id": 1,
                "name": "Espresso",
                "price": 15000
            },
            {
                "id": 4,
                "category_id": 1,
                "name": "Latte",
                "price": 28000
            }
        ]
    }
}
```

### Remove Menu Items from Add-on
Disassociates a list of menu items from a specific add-on.

```http
DELETE /api/v1/add-ons/{id}/menu-items
Authorization: Bearer <token>
Content-Type: application/json

{
    "menu_item_ids": [1, 2]
}
```

**Response:**
```json
{
    "message": "Removed 2 menu items from add-on successfully",
    "data": {
        "id": 1,
        "name": "Extra Shot",
        "description": "Additional espresso shot",
        "price": 8000,
        "cogs": 4000,
        "margin": 50.0,
        "is_available": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "menu_items": [
            {
                "id": 4,
                "category_id": 1,
                "name": "Latte",
                "price": 28000
            }
        ]
    }
}
```

## Members & Promotions

The POS system supports membership cards and promotions that can be applied at checkout.

Key concepts:
- Member card: each member has a unique 8-digit numeric `member_code` (example: `12345678`) used at POS to apply member discounts.
- Promo: promotional offers that can be percentage-based or fixed-amount discounts. Promos can have start/end dates, usage limits, and a `stackable` flag to control combining with other promos or member discounts.

Security & validation:
- `member_code` must be exactly 8 digits (0-9) and unique across members.
- Promo types: `percentage` (0-100) or `fixed` (amount in smallest currency unit).
- Promos respect `start_at` and `end_at` and optional `usage_limit` per customer or global.

DB notes:
- Add migrations to create `members` and `promotions` tables. Example filenames:
    - `008_create_members_table.sql`
    - `009_create_promotions_table.sql`

### Member Endpoints

Create member (Admin/Manager):
```http
POST /api/v1/members
Authorization: Bearer <token>
Content-Type: application/json

{
    "full_name": "Alice Johnson",
    "email": "alice@example.com"
}
```

Response (201):
```json
{
    "id": 1,
    "full_name": "Alice Johnson",
    "email": "alice@example.com",
    "member_code": "82471023",
    "is_active": true,
    "created_at": "2026-01-24T10:00:00Z"
}
```

### Validate Member
```http
GET /api/v1/members/validate?card_number={cardNumber}
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "full_name": "Alice Johnson",
        "phone_number": "1234567890",
        "card_number": "82471023",
        "points": 0,
        "discount": 10,
        "expired_date": "2027-01-24T10:00:00Z",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
    }
}
```

**Response (Not Found):**
```json
{
    "error": "Member not found"
}
```

**Response (Expired):**
```json
{
    "error": "Member card has expired"
}
```

### Get Members
```http
GET /api/v1/members
Authorization: Bearer <token>
```

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "full_name": "Alice Johnson",
            "phone_number": "1234567890",
            "card_number": "82471023",
            "points": 0,
            "discount": 10,
            "expired_date": "2027-01-24T10:00:00Z",
            "created_at": "2026-01-24T10:00:00Z",
            "updated_at": "2026-01-24T10:00:00Z"
        }
    ]
}
```

### Get Member by Card
```http
GET /api/v1/members/card/{cardNumber}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "full_name": "Alice Johnson",
        "phone_number": "1234567890",
        "card_number": "82471023",
        "points": 0,
        "discount": 10,
        "expired_date": "2027-01-24T10:00:00Z",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
    }
}
```

### Update Member (Admin/Manager)
```http
PUT /api/v1/members/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "full_name": "Alice Johnson Smith",
    "email": "alice.smith@example.com",
    "is_active": false
}
```

**Response:**
```json
{
    "id": 1,
    "full_name": "Alice Johnson Smith",
    "phone_number": "1234567890",
    "card_number": "82471023",
    "points": 100,
    "discount": 15,
    "expired_date": "2028-01-24T10:00:00Z",
    "created_at": "2026-01-24T10:00:00Z",
    "updated_at": "2026-01-25T10:00:00Z"
}
```

### Delete Member (Admin/Manager)
```http
DELETE /api/v1/members/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Member deleted successfully"
}
```

### Promotions Endpoints

### Get Promos
```http
GET /api/v1/promos
Authorization: Bearer <token>
```

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "code": "SUMMER25",
            "name": "Summer Sale",
            "description": "25% off on all items",
            "discount_type": "percentage",
            "discount_value": 25,
            "min_order_amount": 0,
            "max_discount": 0,
            "start_date": "2026-06-01T00:00:00Z",
            "end_date": "2026-06-30T23:59:59Z",
            "is_active": true,
            "created_at": "2026-05-01T00:00:00Z",
            "updated_at": "2026-05-01T00:00:00Z"
        }
    ]
}
```

Create promo (Admin/Manager):
```http
POST /api/v1/promos
Authorization: Bearer <token>
Content-Type: application/json

{
    "code": "SUMMER25",
    "type": "percentage",        // "percentage" or "fixed"
    "value": 25,                 // percent (0-100) or fixed amount in cents
    "start_at": "2026-06-01T00:00:00Z",
    "end_at": "2026-06-30T23:59:59Z",
    "usage_limit": 100,          // optional
    "stackable": false,
    "is_active": true
}
```

**Response:**
```json
{
    "id": 2,
    "code": "WINTER15",
    "name": "Winter Sale",
    "description": "15% off on all items",
    "discount_type": "percentage",
    "discount_value": 15,
    "min_order_amount": 0,
    "max_discount": 0,
    "start_date": "2026-12-01T00:00:00Z",
    "end_date": "2026-12-31T23:59:59Z",
    "is_active": true,
    "created_at": "2026-11-01T00:00:00Z",
    "updated_at": "2026-11-01T00:00:00Z"
}
```

### Validate Promo Code
```http
GET /api/v1/promos/validate?code=PROMO_CODE
Authorization: Bearer <token>
```

Response (200):
```json
{
    "success": true,
    "data": {
        "id": 2,
        "code": "WINTER15",
        "name": "Winter Sale",
        "description": "15% off on all items",
        "discount_type": "percentage",
        "discount_value": 15,
        "min_order_amount": 0,
        "max_discount": 0,
        "start_date": "2026-12-01T00:00:00Z",
        "end_date": "2026-12-31T23:59:59Z",
        "is_active": true,
        "created_at": "2026-11-01T00:00:00Z",
        "updated_at": "2026-11-01T00:00:00Z"
    }
}
```

### Update Promo (Admin/Manager)
```http
PUT /api/v1/promos/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "code": "WINTER15",
    "type": "percentage",
    "value": 15,
    "is_active": false
}
```

**Response:**
```json
{
    "id": 1,
    "code": "SUMMER30",
    "name": "Summer Sale",
    "description": "30% off on all items",
    "discount_type": "percentage",
    "discount_value": 30,
    "min_order_amount": 0,
    "max_discount": 0,
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-06-30T23:59:59Z",
    "is_active": true,
    "created_at": "2026-05-01T00:00:00Z",
    "updated_at": "2026-05-15T00:00:00Z"
}
```

### Delete Promo (Admin/Manager)
```http
DELETE /api/v1/promos/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Promo deleted successfully"
}
```

### Applying Member / Promo on Transaction

When creating a transaction, the POS can include either a `member_code` and/or `promo_code` in the request body. The server will validate and apply discounts in this order:
1. Validate `member_code` (if present) and apply member discount.
2. Validate `promo_code` (if present) and apply promo if active and within date/usage limits.
3. If a promo is not `stackable` and a member discount was applied, the promo will be rejected unless the promo `stackable` flag allows combining.

Create transaction with member and promo example:
```http
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
    "customer_name": "Alice Johnson",
    "member_id": 1,
    "promo_id": 2,
    "items": [
        { "menu_item_id": 1, "quantity": 2 }
    ],
    "tax": 2500,
    "discount": 0
}
```

Successful response (discounts applied):
```json
{
    "success": true,
    "data": {
        "id": 10,
        "sub_total": 50000,
        "member_discount": 5000,
        "promo_discount": 11250,
        "tax": 2500,
        "total": 41250
    }
}
```

Error response when promo not stackable:
```json
{
    "success": false,
    "message": "Promo SUMMER25 cannot be combined with member discount"
}
```

### CURL Examples

Create member (admin):
```bash
curl -X POST "http://localhost:8080/api/v1/members" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Alice Johnson","email":"alice@example.com"}'
```

Create promo (admin):
```bash
curl -X POST "http://localhost:8080/api/v1/promos" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"code":"SUMMER25","type":"percentage","value":25,"start_at":"2026-06-01T00:00:00Z","end_at":"2026-06-30T23:59:59Z","stackable":false}'
```

Apply member/promo when creating a transaction (POS):
```bash
curl -X POST "http://localhost:8080/api/v1/transactions" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customer_name":"Alice","member_code":"82471023","promo_code":"SUMMER25","items":[{"menu_item_id":1,"quantity":2}],"payment_method":"cash","tax":2500}'
```

## Transactions

### Customer Name Support
The POS system now supports storing an optional customer name with each transaction. This field:
- Is optional and can be left empty/null
- Accepts any string value (customer's name)
- Is stored with the transaction for future reference
- Can be used for customer service, receipts, or analytics
- Is included in both transaction creation and retrieval endpoints

### Create Transaction
```http
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
    "customer_name": "John Doe",
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2,
            "add_ons": [
                {
                    "add_on_id": 1,
                    "quantity": 1
                }
            ]
        }
    ],
    "tax": 2500,
    "discount_percentage": 10
}
```

**Request Fields:**
- `customer_name` (string, optional): Customer's name for this transaction
- `items` (array, required): Array of menu items to purchase
- `payment_method` (string, required): Payment method (cash, card, etc.)
- `tax` (number, required): Tax amount in smallest currency unit
- `discount` (number, optional): Discount amount in smallest currency unit. If `discount_percentage` is also provided, `discount` will be ignored.
- `discount_percentage` (number, optional): Discount percentage to be applied to the subtotal.
- `member_id` (number, optional): ID of the member to apply their discount.
- `promo_id` (number, optional): ID of the promo to apply.
- `notes` (string, optional): Additional notes for this transaction.

**Response:**
```json
{
    "success": true,
    "message": "Transaction created successfully",
    "data": {
        "id": 1,
        "transaction_no": "TXN-20240101-0001",
        "customer_name": "John Doe",
        "status": "pending",
        "payment_method": "cash",
        "sub_total": 46000,
        "tax": 2500,
        "discount": 0,
        "total": 48500,
        "notes": "",
        "created_at": "2024-01-01T12:00:00Z",
        "items": [
            {
                "id": 1,
                "menu_item_id": 1,
                "quantity": 2,
                "unit_price": 15000,
                "total_price": 30000,
                "menu_item": {
                    "id": 1,
                    "name": "Espresso",
                    "price": 15000
                },
                "add_ons": [
                    {
                        "id": 1,
                        "add_on_id": 1,
                        "quantity": 1,
                        "unit_price": 8000,
                        "total_price": 8000,
                        "add_on": {
                            "id": 1,
                            "name": "Extra Shot",
                            "price": 8000
                        }
                    }
                ]
            }
        ]
    }
}
```

### Get Transactions
```http
GET /api/v1/transactions?status=paid&limit=10&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "transaction_no": "TXN-20240101-0001",
            "customer_name": "John Doe",
            "status": "paid",
            "payment_method": "cash",
            "sub_total": 46000,
            "tax": 2500,
            "discount": 0,
            "total": 48500,
            "notes": "",
            "created_at": "2024-01-01T12:00:00Z",
            "updated_at": "2024-01-01T12:30:00Z",
            "items": [
                {
                    "id": 1,
                    "menu_item_id": 1,
                    "quantity": 2,
                    "unit_price": 15000,
                    "total_price": 30000,
                    "menu_item": {
                        "id": 1,
                        "name": "Espresso",
                        "price": 15000
                    },
                    "add_ons": [
                        {
                            "id": 1,
                            "add_on_id": 1,
                            "quantity": 1,
                            "unit_price": 8000,
                            "total_price": 8000,
                            "add_on": {
                                "id": 1,
                                "name": "Extra Shot",
                                "price": 8000
                            }
                        }
                    ]
                }
            ]
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

### Process Payment
```http
PUT /api/v1/transactions/1/pay
Authorization: Bearer <token>
Content-Type: application/json

{
    "payment_method": "cash"
}
```

**Response:**
```json
{
    "id": 1,
    "transaction_no": "TXN-20240101-0001",
    "customer_name": "John Doe",
    "status": "paid",
    "payment_method": "cash",
    "sub_total": 46000,
    "tax": 2500,
    "discount": 0,
    "total": 48500,
    "notes": "",
    "paid_at": "2024-01-01T12:30:00Z",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:30:00Z",
    "items": [
        {
            "id": 1,
            "menu_item_id": 1,
            "quantity": 2,
            "unit_price": 15000,
            "total_price": 30000,
            "menu_item": {
                "id": 1,
                "name": "Espresso",
                "price": 15000
            },
            "add_ons": [
                {
                    "id": 1,
                    "add_on_id": 1,
                    "quantity": 1,
                    "unit_price": 8000,
                    "total_price": 8000,
                    "add_on": {
                        "id": 1,
                        "name": "Extra Shot",
                        "price": 8000
                    }
                }
            ]
        }
    ]
}
```

### Get Transaction
Retrieves a single transaction by its ID.

```http
GET /api/v1/transactions/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "transaction_no": "TXN-20240101-0001",
            "customer_name": "John Doe",
            "status": "paid",
            "payment_method": "cash",
            "sub_total": 46000,
            "tax": 2500,
            "discount": 0,
            "total": 48500,
            "notes": "",
            "created_at": "2024-01-01T12:00:00Z",
            "updated_at": "2024-01-01T12:30:00Z",
            "items": [
                {
                    "id": 1,
                    "menu_item_id": 1,
                    "quantity": 2,
                    "unit_price": 15000,
                    "total_price": 30000,
                    "menu_item": {
                        "id": 1,
                        "name": "Espresso",
                        "price": 15000
                    },
                    "add_ons": [
                        {
                            "id": 1,
                            "add_on_id": 1,
                            "quantity": 1,
                            "unit_price": 8000,
                            "total_price": 8000,
                            "add_on": {
                                "id": 1,
                                "name": "Extra Shot",
                                "price": 8000
                            }
                        }
                    ]
                }
            ]
        }
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total": 42,
        "total_pages": 5
    }
}
```

### Delete Transaction (Admin/Manager)
```http
DELETE /api/v1/transactions/:id
Authorization: Bearer <token>
```

**Notes:**
- Pending transactions can be deleted by any authenticated user
- Paid transactions can only be deleted by admin users
- Deletes all related transaction items and add-ons

**Response (Success):**
```json
{
    "message": "Transaction deleted successfully"
}
```

**Response (Error - Insufficient Permissions):**
```json
{
    "error": "Only admin can delete paid transactions"
}
```

**Response (Error - Not Found):**
```json
{
    "error": "Transaction not found"
}
```

### Update Transaction
Update basic transaction information (customer name, tax, discount). Only works on pending transactions.

```http
PUT /api/v1/transactions/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "customer_name": "Jane Smith",
    "tax": 3000,
    "discount_percentage": 15
}
```

**Response:**
```json
{
    "id": 1,
    "transaction_no": "TXN-20240101-0001",
    "customer_name": "Jane Smith",
    "status": "pending",
    "sub_total": 46000,
    "tax": 3000,
    "discount": 500,
    "total": 48500,
    "updated_at": "2024-01-01T13:00:00Z"
}
```

### Add Item to Transaction
Add a new menu item to a pending transaction.

```http
POST /api/v1/transactions/{id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
    "menu_item_id": 3,
    "quantity": 1,
    "add_ons": [
        {
            "add_on_id": 2,
            "quantity": 1
        }
    ]
}
```

**Response:**
```json
{
    "id": 5,
    "transaction_id": 1,
    "menu_item_id": 3,
    "quantity": 1,
    "price": 18000,
    "created_at": "2024-01-01T13:15:00Z"
}
```

### Update Transaction Item
Update an existing transaction item's quantity and add-ons. Only works on pending transactions.

```http
PUT /api/v1/transactions/{id}/items/{item_id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "quantity": 3,
    "add_ons": [
        {
            "add_on_id": 1,
            "quantity": 2
        },
        {
            "add_on_id": 3,
            "quantity": 1
        }
    ]
}
```

**Response:**
```json
{
    "id": 5,
    "transaction_id": 1,
    "menu_item_id": 3,
    "quantity": 3,
    "price": 18000,
    "updated_at": "2024-01-01T13:20:00Z"
}
```

### Delete Transaction Item
Remove an item from a pending transaction. Automatically recalculates transaction totals.

```http
DELETE /api/v1/transactions/{id}/items/{item_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Transaction item deleted successfully"
}
```

**Common Error Responses for Transaction Item Operations:**
```json
{
    "error": "Cannot modify paid transaction"
}
```

```json
{
    "error": "Transaction not found"
}
```

```json
{
    "error": "Transaction item not found"
}
```

## Expenses

### Get Expenses
```http
GET /api/v1/expenses?type=raw_material&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "type": "raw_material",
            "category": "Coffee Beans",
            "description": "Premium Arabica coffee beans - 5kg",
            "amount": 500000,
            "date": "2024-01-01T00:00:00Z",
            "user_id": 1,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "admin"
            }
        }
    ]
}
```

### Create Expense (Admin/Manager)
```http
POST /api/v1/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
    "type": "operational",
    "category": "Utilities",
    "description": "Monthly electricity bill",
    "amount": 800000,
    "date": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
    "id": 1,
    "type": "operational",
    "category": "Utilities",
    "description": "Monthly electricity bill",
    "amount": 800000,
    "date": "2024-01-01T00:00:00Z",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
}
```

### Get Expense
```http
GET /api/v1/expenses/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "id": 1,
    "type": "raw_material",
    "category": "Coffee Beans",
    "description": "Premium Arabica coffee beans - 5kg",
    "amount": 500000,
    "date": "2024-01-01T00:00:00Z",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
}
```

### Update Expense (Admin/Manager)
```http
PUT /api/v1/expenses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "type": "operational",
    "category": "Rent",
    "description": "Monthly office rent",
    "amount": 1000000,
    "date": "2024-02-01T00:00:00Z"
}
```

**Response:**
```json
{
    "id": 1,
    "type": "operational",
    "category": "Rent",
    "description": "Monthly office rent",
    "amount": 1000000,
    "date": "2024-02-01T00:00:00Z",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-02-01T00:00:00Z",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
}
```

### Delete Expense (Admin/Manager)
```http
DELETE /api/v1/expenses/{id}
Authorization: Bearer <admin_or_manager_token>
```

**Response:**
```json
{
    "message": "Expense deleted successfully"
}
```

### Get Expense Summary
```http
GET /api/v1/expenses/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
    "total_expenses": 1300000,
    "expenses_by_type": [
        {
            "type": "raw_material",
            "amount": 500000
        },
        {
            "type": "operational",
            "amount": 800000
        }
    ],
    "expenses_by_category": [
        {
            "category": "Coffee Beans",
            "amount": 500000
        },
        {
            "category": "Utilities",
            "amount": 800000
        }
    ]
}
```

## Dashboard Analytics

### Get Dashboard Data
```http
GET /api/v1/dashboard/data?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (string, optional): Filter data from this start date (YYYY-MM-DD)
- `end_date` (string, optional): Filter data up to this end date (YYYY-MM-DD)

If no dates are provided, the API returns all-time statistics.

**Response:**
```json
{
    "total_sales": 1500000,
    "total_orders": 120,
    "pending_orders": 5,
    "paid_orders": 115,
    "sales_chart": [
        {
            "date": "2024-01-31",
            "amount": 100000,
            "orders": 10
        },
        {
            "date": "2024-01-30",
            "amount": 80000,
            "orders": 8
        }
    ],
    "sales_by_payment_method": [
        {
            "payment_method": "cash",
            "total_sales": 1000000
        },
        {
            "payment_method": "qris",
            "total_sales": 500000
        }
    ]
}
```

**Access Requirements:** Admin or Manager role required for all dashboard endpoints.

### Get Dashboard Stats
```http
GET /api/v1/dashboard/stats?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <admin_or_manager_token>
```

**Query Parameters:**
- `start_date` (optional): Start date for filtering (YYYY-MM-DD format)
- `end_date` (optional): End date for filtering (YYYY-MM-DD format)

**Note:** If no date parameters are provided, all data will be included in the statistics.

**Response:**
```json
{
    "total_sales": 57700,
    "total_cogs": 28850,
    "gross_profit": 28850,
    "gross_margin_percent": 50.0,
    "total_expenses": 15000,
    "net_profit": 13850,
    "total_orders": 3,
    "pending_orders": 1,
    "paid_orders": 2,
    "top_menu_items": [
        {
            "name": "Latte",
            "total_sold": 2,
            "total_revenue": 56000
        }
    ],
    "top_add_ons": [
        {
            "name": "Double Shot for Latte",
            "total_sold": 1,
            "total_revenue": 8000
        }
    ],
    "sales_chart": [
        {
            "date": "2025-07-09",
            "amount": 57700,
            "orders": 3
        }
    ],
    "expense_chart": [
        {
            "date": "2025-07-09",
            "amount": 15000,
            "type": "Raw Materials"
        }
    ],
     "sales_by_payment_method": [
        {
            "payment_method": "cash",
            "total_sales": 1000000
        },
        {
            "payment_method": "qris",
            "total_sales": 500000
        }
    ]
}
```

### Get Sales Report
```http
GET /api/v1/dashboard/sales-report?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "total_sales": 111000,
    "total_orders": 2,
    "average_order": 55500,
    "top_categories": [
        {
            "category_name": "Food",
            "total_sales": 70000,
            "total_orders": 1
        },
        {
            "category_name": "Drinks",
            "total_sales": 41000,
            "total_orders": 1
        }
    ]
}
```

### Get Profit Analysis
```http
GET /api/v1/dashboard/profit-analysis?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "gross_profit": 57700,
    "net_profit": 33700,
    "profit_margin": 30.36,
    "cogs": 53300,
    "revenue": 111000,
    "expenses": 24000,
    "addon_revenue": 10000,
    "addon_cogs": 4000
}
```

## Payment Methods

### Get Payment Methods
```http
GET /api/v1/payment-methods
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Cash",
            "code": "cash",
            "is_active": true
        },
        {
            "id": 2,
            "name": "Qris",
            "code": "qris",
            "is_active": true
        },
        {
            "id": 3,
            "name": "Digital Wallet",
            "code": "digital_wallet",
            "is_active": true
        }
    ]
}
```

## Stock Management

### Get Raw Materials
```http
GET /api/v1/stock/raw-materials
Authorization: Bearer <token>
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "Coffee Beans",
        "unit_of_measure": "kg",
        "current_stock": 10,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
]
```

### Create Raw Material
```http
POST /api/v1/stock/raw-materials
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Coffee Beans",
    "unit": "kg",
    "stock": 10
}
```

### Update Raw Material
```http
PUT /api/v1/stock/raw-materials/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Updated Coffee Beans",
    "unit_of_measure": "gram",
    "current_stock": 1500
}
```

**Response:**
```json
{
    "id": 1,
    "name": "Updated Coffee Beans",
    "unit_of_measure": "gram",
    "current_stock": 1500,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

### Delete Raw Material
```http
DELETE /api/v1/stock/raw-materials/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Raw material deleted successfully"
}
```

### Create Stock Receipt
```http
POST /api/v1/stock/receipts
Authorization: Bearer <token>
Content-Type: application/json

{
    "raw_material_id": 1,
    "quantity": 5,
    "notes": "Received new stock of coffee beans"
}
```

**Response:**
```json
{
    "id": 1,
    "raw_material_id": 1,
    "quantity": 5,
    "receipt_date": "2024-01-02T00:00:00Z",
    "notes": "Received new stock of coffee beans",
    "created_at": "2024-01-02T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
}
```

### Create Stock Adjustment
```http
POST /api/v1/stock/adjustments
Authorization: Bearer <token>
Content-Type: application/json

{
    "raw_material_id": 1,
    "quantity": -1,
    "notes": "Wasted 1kg of coffee beans"
}
```

**Response:**
```json
{
    "id": 1,
    "raw_material_id": 1,
    "quantity": -1,
    "adjustment_date": "2024-01-03T00:00:00Z",
    "reason": "Wastage",
    "notes": "Wasted 1kg of coffee beans",
    "created_at": "2024-01-03T00:00:00Z",
    "updated_at": "2024-01-03T00:00:00Z"
}
```

### Create Daily Summary
```http
POST /api/v1/stock/summary
Authorization: Bearer <token>
```

**Request Body:**
```json
[
    {
        "raw_material_id": 1,
        "ending_stock": 8,
        "notes": "Daily stock count for coffee beans"
    }
]
```

**Response:**
```json
{
    "message": "Daily summaries created successfully"
}
```

### Get Daily Summary
```http
GET /api/v1/stock/summary
Authorization: Bearer <token>
```

**Response:**
```json
[
    {
        "id": 1,
        "summary_date": "2024-01-03T00:00:00Z",
        "raw_material_id": 1,
        "beginning_stock": 10,
        "receipts_in": 5,
        "total_available": 14,
        "ending_stock": 8,
        "daily_usage": 6,
        "theoretical_usage": 5,
        "adjustments": -1,
        "variance": 1,
        "notes": "Daily stock count for coffee beans",
        "created_at": "2024-01-03T00:00:00Z",
        "updated_at": "2024-01-03T00:00:00Z",
        "raw_material": {
            "id": 1,
            "name": "Coffee Beans",
            "unit_of_measure": "kg",
            "current_stock": 8
        }
    }
]
```

### Get Menu Item Materials
```http
GET /api/v1/stock/menu-item-materials/{menu_item_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "menu_item_id": 1,
            "raw_material_id": 1,
            "quantity_used": 0.02,
            "raw_material": {
                "id": 1,
                "name": "Coffee Beans",
                "unit_of_measure": "kg",
                "current_stock": 8
            }
        }
    ]
}
```

### Add Menu Item Material
```http
POST /api/v1/stock/menu-item-materials
Authorization: Bearer <token>
Content-Type: application/json

{
    "menu_item_id": 1,
    "raw_material_id": 1,
    "quantity": 0.02
}
```

**Response:**
```json
{
    "menu_item_id": 1,
    "raw_material_id": 1,
    "quantity_used": 0.02
}
```

### Remove Menu Item Material
```http
DELETE /api/v1/stock/menu-item-materials/{menu_item_id}/{raw_material_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
    "message": "Material removed from recipe successfully"
}
```

### CURL Examples

Create raw material:
```bash
curl -X POST "http://localhost:8080/api/v1/stock/raw-materials" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Coffee Beans","unit":"kg","stock":10}'
```

Create stock receipt:
```bash
curl -X POST "http://localhost:8080/api/v1/stock/receipts" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"raw_material_id":1,"quantity":5,"notes":"Received new stock of coffee beans"}'
```

Create stock adjustment:
```bash
curl -X POST "http://localhost:8080/api/v1/stock/adjustments" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"raw_material_id":1,"quantity":-1,"notes":"Wasted 1kg of coffee beans"}'
```

Add menu item material:
```bash
curl -X POST "http://localhost:8080/api/v1/stock/menu-item-materials" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"menu_item_id":1,"raw_material_id":1,"quantity":0.02}'
```

## Error Responses

All endpoints return errors in the following format:

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

The API implements basic rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for web applications. All origins are allowed in development mode.

## Database Schema Changes

### Add-ons Table Enhancement
The `add_ons` table now includes:
- `menu_item_id` (nullable): Links add-on to specific menu item
- Foreign key constraint to `menu_items` table
- Index on `menu_item_id` for performance

```sql
-- Migration: 005_add_menu_item_id_to_addons.sql
ALTER TABLE add_ons ADD COLUMN menu_item_id INTEGER REFERENCES menu_items(id);
CREATE INDEX idx_add_ons_menu_item_id ON add_ons(menu_item_id);
```

### Data Model Examples

**Global Add-on:**
```json
{
    "id": 2,
    "menu_item_id": null,
    "name": "Whipped Cream",
    "price": 3000,
    "cogs": 1500
}
```

**Menu-Specific Add-on:**
```json
{
    "id": 17,
    "menu_item_id": 4,
    "name": "Double Shot for Latte",
    "price": 8000,
    "cogs": 3000
}
```

### Migration from Old System
Existing add-ons remain unchanged as global add-ons (`menu_item_id: null`). The system is fully backward compatible:

1. **Existing Global Add-ons**: Continue to work for all menu items
2. **New Menu-Specific Add-ons**: Can be created for targeted offerings
3. **API Compatibility**: Old endpoints continue to work as before
4. **UI Enhancement**: Admin interface now shows add-on types with visual indicators

### Best Practices
- Use **global add-ons** for universal options (milk alternatives, sweeteners, temperature preferences)
- Use **menu-specific add-ons** for specialized options (latte art for lattes, extra foam for cappuccinos)
- Consider customer experience when choosing between global vs. specific add-ons

## Dashboard & Analytics

### Get Dashboard Statistics
```http
GET /api/v1/dashboard/stats?start_date=2025-07-01&end_date=2025-07-31
Authorization: Bearer <admin_or_manager_token>
```

**Query Parameters:**
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)

**Response:**
```json
{
    "total_sales": 111000,
    "total_cogs": 53300,
    "gross_profit": 57700,
    "gross_margin_percent": 51.98,
    "total_expenses": 24000,
    "net_profit": 33700,
    "total_orders": 2,
    "pending_orders": 0,
    "paid_orders": 2,
    "top_menu_items": [
        {
            "name": "Zona12",
            "total_sold": 4,
            "total_revenue": 70000
        }
    ],
    "top_add_ons": [
        {
            "name": "Telur",
            "total_sold": 2,
            "total_revenue": 10000
        }
    ],
    "sales_chart": [
        {
            "date": "2025-07-09T00:00:00Z",
            "amount": 111000,
            "orders": 2
        }
    ],
    "expense_chart": [
        {
            "date": "2025-07-09T00:00:00Z",
            "amount": 24000,
            "type": "raw_material"
        }
    ]
}
```

**Financial Metrics:**
- `total_sales`: Total revenue from paid transactions
- `total_cogs`: Total Cost of Goods Sold (menu items + add-ons)
- `gross_profit`: Sales - COGS
- `gross_margin_percent`: (Gross Profit / Sales) × 100
- `total_expenses`: Sum of all business expenses (excludes deleted expenses)
- `net_profit`: Gross Profit - Total Expenses

### Get Sales Report
```http
GET /api/v1/dashboard/sales-report?start_date=2025-07-01&end_date=2025-07-31
Authorization: Bearer <admin_or_manager_token>
```

### Get Profit Analysis
```http
GET /api/v1/dashboard/profit-analysis?start_date=2025-07-01&end_date=2025-07-31
Authorization: Bearer <admin_or_manager_token>
```



## Error Handling

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
    "error": "Error message description"
}
```

## Testing

You can test the API using tools like:
- **Postman**: Import the collection from `docs/postman/`
- **cURL**: Use the examples above
- **Insomnia**: REST client alternative to Postman

### Testing Menu-Dependent Add-ons

**Test 1: Get add-ons for a specific menu item**
```bash
curl -X GET "http://localhost:8080/api/v1/public/menu-item-add-ons/4"
```

**Test 2: Create a menu-specific add-on**
```bash
curl -X POST "http://localhost:8080/api/v1/add-ons" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_item_id": 4,
    "name": "Extra Foam for Latte",
    "description": "Additional milk foam specifically for lattes",
    "price": 3000,
    "cogs": 1000,
    "is_available": true
  }'
```

**Test 3: Filter add-ons by menu item**
```bash
curl -X GET "http://localhost:8080/api/v1/add-ons?menu_item_id=4"
```

**Test 4: Get only global add-ons**
```bash
curl -X GET "http://localhost:8080/api/v1/add-ons?menu_item_id=global"
```

**Test 5: Get menu items with their add-ons**
```bash
curl -X GET "http://localhost:8080/api/v1/menu/items" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This will return menu items with both menu-specific and global add-ons included.

## Web Interface Routes

The POS system includes a web-based admin dashboard accessible through the following routes:

### Admin Dashboard Access
- **Login Page**: `GET /admin/` - Authentication page
- **Dashboard**: `GET /admin/dashboard` - Main analytics dashboard
- **Menu Management**: `GET /admin/menu` - Manage categories and menu items
- **Add-ons Management**: `GET /admin/add-ons` - Manage add-ons
- **Transactions**: `GET /admin/transactions` - View and manage transactions
- **Expenses**: `GET /admin/expenses` - Track expenses and costs
- **Point of Sale**: `GET /admin/pos` - POS terminal interface
- **User Management**: `GET /admin/users` - Manage system users (admin only)
- **Stock Management**: `GET /admin/stock` - Manage stock levels and raw materials
- **Material Recipe**: `GET /admin/material-recipe` - Manage material recipes for menu items
- **Member Management**: `GET /admin/members` - Manage customer members
- **Promo Management**: `GET /admin/promos` - Manage promotional offers

### Static Assets
- **Static Files**: `/static/*` - CSS, JavaScript, and other assets
- **Templates**: Rendered HTML templates from `web/templates/`

### Authentication Requirements
- All admin routes require authentication via JWT tokens
- Token is stored in localStorage and sent with API calls
- Dashboard and analytics require admin or manager role
- User management requires admin role only

### Frontend Architecture
- **JavaScript Modules**: Modular JS files for each feature
- **API Integration**: All frontend calls use `/api/v1` base URL
- **Real-time Updates**: Dashboard auto-refreshes and cross-tab synchronization
- **Error Handling**: Comprehensive error display and logging
- **Responsive Design**: Works on desktop and mobile devices

---

For more detailed development information, see the project README and source code documentation.

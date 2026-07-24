# TradeHub API Documentation

Welcome to the **TradeHub API** documentation. This document provides a complete guide to all available endpoints, authentication mechanisms, request/response formats, validation rules, and example payloads.

---

## 1. Overview & Base Configuration

- **Base URL:** `http://localhost:5292` *(or your configured port)*
- **API Prefix:** `/api`
- **Content-Type:** `application/json`

### Standard Response Envelope

All API endpoints return responses wrapped in a standard JSON envelope:

#### Success Response (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

#### Failure Response (`ApiResponse`)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    "Password must contain at least one uppercase letter."
  ]
}
```

---

## 2. Authentication & Authorization

TradeHub API uses **JWT (JSON Web Token)** for authentication.

- **Header Name:** `Authorization`
- **Header Value Format:** `Bearer <your_jwt_token>`

### User Roles

| Role | Access Permissions |
| :--- | :--- |
| `Customer` | Can view products/categories, place orders, view own orders. |
| `Vendor` | Everything a Customer can do + Create, Update, and Delete products. |
| `Admin` | Full access to all endpoints, including category creation, order status updates, and dashboard analytics. |

---

## 3. API Endpoints Reference

---

### 🔑 Authentication (`/api/auth`)

#### 1. Register User Account
Registers a new user (Customer, Vendor, or Admin) and returns a JWT token.

- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`

##### Request Body (`RegisterDto`)
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | `string` | Yes | Length: 2–150 chars | User's full name |
| `email` | `string` | Yes | Valid email format | User's email address (must be unique) |
| `password` | `string` | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit | Password |
| `role` | `string` | No | `"Customer"`, `"Vendor"`, `"Admin"` | User role (Defaults to `"Customer"`) |

**Example Request:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "Vendor"
}
```

##### Response Examples

**`201 Created`**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "Vendor"
    }
  }
}
```

**`400 Bad Request`**
```json
{
  "success": false,
  "message": "An account with this email address already exists.",
  "errors": null
}
```

---

#### 2. User Login
Authenticates an existing user and returns a JWT token.

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`

##### Request Body (`LoginDto`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Registered email address |
| `password` | `string` | Yes | Account password |

**Example Request:**
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

##### Response Examples

**`200 OK`**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "Vendor"
    }
  }
}
```

**`401 Unauthorized`**
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "errors": null
}
```

---

### 📦 Products (`/api/products`)

#### 1. Get All Products
Retrieves active products with optional filters.

- **Method:** `GET`
- **Endpoint:** `/api/products`
- **Auth Required:** No

##### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `category` | `string` | No | Filter by category name |
| `minPrice` | `decimal` | No | Minimum product price |
| `maxPrice` | `decimal` | No | Maximum product price |
| `search` | `string` | No | Search by product name or description |

**Example Request:**
`GET /api/products?category=Electronics&minPrice=100&search=laptop`

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "title": "Wireless Noise-Canceling Headphones",
      "description": "High fidelity audio with active noise cancellation.",
      "price": 299.99,
      "stockQuantity": 45,
      "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "categoryId": 1,
      "category": "Electronics",
      "rating": 4.5,
      "isActive": true,
      "createdAt": "2026-07-24T12:00:00Z"
    }
  ]
}
```

---

#### 2. Get Product By ID
Retrieves details of a single product.

- **Method:** `GET`
- **Endpoint:** `/api/products/{id}`
- **Auth Required:** No

##### Response Examples

**`200 OK`**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Wireless Noise-Canceling Headphones",
    "description": "High fidelity audio with active noise cancellation.",
    "price": 299.99,
    "stockQuantity": 45,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "categoryId": 1,
    "category": "Electronics",
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2026-07-24T12:00:00Z"
  }
}
```

**`404 Not Found`**
```json
{
  "success": false,
  "message": "Product with ID 99 was not found.",
  "errors": null
}
```

---

#### 3. Create Product
Creates a new product in the store.

- **Method:** `POST`
- **Endpoint:** `/api/products`
- **Auth Required:** Yes (`Admin`, `Vendor`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

##### Request Body (`CreateProductDto`)
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Length: 2–300 chars | Product title |
| `description` | `string` | No | Max length: 2000 chars | Detailed product description |
| `price` | `decimal` | Yes | Range: 0.01 – 999,999.99 | Unit price |
| `stockQuantity` | `int` | Yes | Min: 0 | Available inventory count |
| `imageUrl` | `string` | Yes | Valid URL format | Image URL for display |
| `categoryId` | `int` | Yes | Min: 1 | ID of existing category |

**Example Request:**
```json
{
  "name": "Mechanical Keyboard RGB",
  "description": "Custom mechanical switches with customizable per-key RGB backlighting.",
  "price": 129.99,
  "stockQuantity": 20,
  "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
  "categoryId": 1
}
```

##### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": 12,
    "title": "Mechanical Keyboard RGB",
    "description": "Custom mechanical switches with customizable per-key RGB backlighting.",
    "price": 129.99,
    "stockQuantity": 20,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "categoryId": 1,
    "category": "Electronics",
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2026-07-24T15:45:00Z"
  }
}
```

---

#### 4. Update Product
Updates an existing product's details.

- **Method:** `PUT`
- **Endpoint:** `/api/products/{id}`
- **Auth Required:** Yes (`Admin`, `Vendor`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

##### Request Body (`UpdateProductDto`)
All fields are optional; only provided fields will be updated.

| Field | Type | Validation Rules |
| :--- | :--- | :--- |
| `name` | `string?` | Length: 2–300 chars |
| `description` | `string?` | Max length: 2000 chars |
| `price` | `decimal?` | Range: 0.01 – 999,999.99 |
| `stockQuantity` | `int?` | Min: 0 |
| `imageUrl` | `string?` | Valid URL format |
| `categoryId` | `int?` | Valid category ID |
| `isActive` | `bool?` | Set product visibility |

**Example Request:**
```json
{
  "price": 109.99,
  "stockQuantity": 15
}
```

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": {
    "id": 12,
    "title": "Mechanical Keyboard RGB",
    "description": "Custom mechanical switches with customizable per-key RGB backlighting.",
    "price": 109.99,
    "stockQuantity": 15,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "categoryId": 1,
    "category": "Electronics",
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2026-07-24T15:45:00Z"
  }
}
```

---

#### 5. Delete Product
Soft-deletes a product by setting `isActive = false`.

- **Method:** `DELETE`
- **Endpoint:** `/api/products/{id}`
- **Auth Required:** Yes (`Admin`, `Vendor`)
- **Headers:** `Authorization: Bearer <token>`

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Product deleted successfully."
}
```

---

### 🏷️ Categories (`/api/categories`)

#### 1. Get All Categories
Retrieves all product categories along with product counts.

- **Method:** `GET`
- **Endpoint:** `/api/categories`
- **Auth Required:** No

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "productCount": 14
    },
    {
      "id": 2,
      "name": "Clothing",
      "productCount": 8
    }
  ]
}
```

---

#### 2. Create Category
Creates a new product category.

- **Method:** `POST`
- **Endpoint:** `/api/categories`
- **Auth Required:** Yes (`Admin`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

##### Request Body (`CreateCategoryDto`)
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Length: 2–100 chars | Category name |

**Example Request:**
```json
{
  "name": "Home & Kitchen"
}
```

##### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {
    "id": 3,
    "name": "Home & Kitchen",
    "productCount": 0
  }
}
```

---

### 🛒 Orders (`/api/orders`)

#### 1. Create Order (Checkout)
Places a new order with items from the shopping cart.

- **Method:** `POST`
- **Endpoint:** `/api/orders`
- **Auth Required:** Yes (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

##### Request Body (`CreateOrderDto`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `items` | `Array<OrderItemDto>` | Yes | Array of items (At least 1 item required) |

###### `OrderItemDto` Structure
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `productId` | `int` | Yes | Min: 1 | ID of product being purchased |
| `quantity` | `int` | Yes | Range: 1–100 | Quantity to purchase |

**Example Request:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

##### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": 1001,
    "userId": 5,
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "orderDate": "2026-07-24T15:46:00Z",
    "totalPrice": 649.97,
    "status": "Pending",
    "items": [
      {
        "productId": 1,
        "productName": "Wireless Noise-Canceling Headphones",
        "productImage": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "quantity": 2,
        "unitPrice": 299.99,
        "subTotal": 599.98
      },
      {
        "productId": 3,
        "productName": "Ergonomic Mouse",
        "productImage": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
        "quantity": 1,
        "unitPrice": 49.99,
        "subTotal": 49.99
      }
    ]
  }
}
```

---

#### 2. Get All Orders
Retrieves orders.
- Customers receive **only their own** orders.
- Admins receive **all** orders in the system.

- **Method:** `GET`
- **Endpoint:** `/api/orders`
- **Auth Required:** Yes (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1001,
      "userId": 5,
      "customerName": "Jane Doe",
      "customerEmail": "jane@example.com",
      "orderDate": "2026-07-24T15:46:00Z",
      "totalPrice": 649.97,
      "status": "Pending",
      "items": [ ... ]
    }
  ]
}
```

---

#### 3. Get Order By ID
Retrieves details of a specific order.

- **Method:** `GET`
- **Endpoint:** `/api/orders/{id}`
- **Auth Required:** Yes (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`

##### Response Examples

**`200 OK`**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1001,
    "userId": 5,
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "orderDate": "2026-07-24T15:46:00Z",
    "totalPrice": 649.97,
    "status": "Pending",
    "items": [ ... ]
  }
}
```

**`404 Not Found`**
```json
{
  "success": false,
  "message": "Order with ID 1001 was not found.",
  "errors": null
}
```

---

#### 4. Update Order Status
Updates the status of an order.

- **Method:** `PUT`
- **Endpoint:** `/api/orders/{id}/status`
- **Auth Required:** Yes (`Admin`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

##### Allowed Order Status Values
- `"Pending"`
- `"Confirmed"`
- `"Shipped"`
- `"Delivered"`
- `"Cancelled"`

##### Request Body (`UpdateOrderStatusDto`)
```json
{
  "status": "Shipped"
}
```

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Order status updated successfully.",
  "data": {
    "id": 1001,
    "userId": 5,
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "orderDate": "2026-07-24T15:46:00Z",
    "totalPrice": 649.97,
    "status": "Shipped",
    "items": [ ... ]
  }
}
```

---

### 📊 Dashboard (`/api/dashboard`)

#### 1. Get Dashboard Statistics
Returns aggregated analytics including sales totals, total order count, active users count, products count, 7-day sales breakdown, and product distribution by category.

- **Method:** `GET`
- **Endpoint:** `/api/dashboard/stats`
- **Auth Required:** Yes (`Admin`)
- **Headers:** `Authorization: Bearer <token>`

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalSales": 15420.50,
    "totalOrders": 142,
    "totalUsers": 58,
    "totalProducts": 32,
    "salesByDay": [
      { "day": "Sat", "total": 1200.00 },
      { "day": "Sun", "total": 1850.50 },
      { "day": "Mon", "total": 940.00 },
      { "day": "Tue", "total": 2100.00 },
      { "day": "Wed", "total": 3100.00 },
      { "day": "Thu", "total": 2800.00 },
      { "day": "Fri", "total": 3430.00 }
    ],
    "categoryStats": [
      { "category": "Electronics", "count": 14 },
      { "category": "Clothing", "count": 8 },
      { "category": "Home & Kitchen", "count": 10 }
    ]
  }
}
```

---

## 4. HTTP Status Code Summary

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200` | `OK` | Request succeeded. |
| `201` | `Created` | Resource successfully created. |
| `400` | `Bad Request` | Validation failed or invalid payload syntax. |
| `401` | `Unauthorized` | Missing or invalid JWT authentication token. |
| `403` | `Forbidden` | Authenticated user lacks permission/role required for endpoint. |
| `404` | `Not Found` | Requested resource ID does not exist. |
| `500` | `Internal Server Error` | Server encountered an unexpected error. |

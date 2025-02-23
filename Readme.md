---
title: "Apparels & Vendors API Documentation"
description: "Documentation for setting up and using the Apparels & Vendors API."
---

## About the App
The **Apparels & Vendors API** is a lightweight Node.js and Express-based application designed for managing apparel vendors and their products. It uses a **file-based database** for data storage, ensuring simplicity and easy deployment.

## Features
- Vendor and product management.
- CRUD operations with a **file-based database**.
- Data encryption for security.
- Lightweight and easy to deploy.

## Project Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (v16+ recommended)
- Yarn or NPM

### Installation Steps
```sh
# Clone the repository
git clone https://github.com/MrGiddz/freah_prints.git
cd freah_prints

# Install dependencies
yarn # or npm install
```

### Environment Variables
Create a `.env` file in the root directory and configure the necessary environment variables:
```
PORT=5000
ENCRYPTION_KEY=your_secret_key
```

### Running the Server
```sh
# Start the server
yarn start # or npm start
```
The API will be available at `http://localhost:5000`.


## Base URL
```
http://localhost:6000/api
```

## Authentication

### Register a Vendor
**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "example@gmail.com",
  "password": "password",
  "name": "Vendor Name"
}
```

### Login a Vendor
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "example@gmail.com",
  "password": "password"
}
```

---

## Apparel Management

### Add an Apparel
**Endpoint:** `POST /apparel/add`

**Headers:**
```
X-Vendor-Token: <your-token>
```

**Request:**
```json
{
  "name": "Shoes",
  "totalQuantity": 50,
  "variants": [
    {
      "size": "XL", 
      "quantity": 10,
      "price": 100.99
    }
  ]
}
```

### Update an Apparel
**Endpoint:** `PUT /apparel/update`

**Headers:**
```
X-Vendor-Token: <your-token>
```

**Request:**
```json
{
  "code": "SHO-77340-9622",
  "name": "New Apparel Name",
  "variants": [
    {
      "sizeId": "XL-609140-22C9",
      "size": "Medium"
    }
  ]
}
```

### Get All Apparels
**Endpoint:** `GET /apparel`

**Headers:**
```
X-Vendor-Token: <your-token>
```

### Get a Specific Apparel
**Endpoint:** `GET /apparel/{apparelCode}`

**Headers:**
```
X-Vendor-Token: <your-token>
```

---

## Order Management

### Create a Single Order
**Endpoint:** `POST /order/create-single-order`

**Headers:**
```
X-Vendor-Token: <your-token>
```

**Request:**
```json
{
  "customerName": "Olaniyi Gideon Olamide",
  "items": [
    {
      "apparelCode": "SHO-74333-323B", 
      "sizeId": "XL-974334-E416",
      "quantity": 10,
      "vendorId": "9103fa08-d12a-469e-a094-9283618d9fac"
    }
  ]
}
```

### Get Vendor Orders
**Endpoint:** `GET /vendor/orders`

**Headers:**
```
X-Vendor-Token: <your-token>
```

### Check If Vendor Can Fulfill Order
**Endpoint:** `GET /vendor/{vendorId}/can-fulfil-order`

**Headers:**
```
X-Vendor-Token: <your-token>
```

### Get Lowest Cost Option
**Endpoint:** `GET /vendor/{vendorId}/lowest-cost`

**Headers:**
```
X-Vendor-Token: <your-token>
```

---

## Notes
- All requests require authentication via `X-Vendor-Token`.
- Ensure to replace `{apparelCode}` and `{vendorId}` with actual values.


## Testing the API
### Running Tests
```sh
yarn test # or npm test
```


## Additional Notes
- Data is stored in JSON files located in the `db/` directory.
- Ensure proper encryption handling for secure data storage.
- Modify unique field constraints in `Base.ts` as needed.

For further assistance, refer to the **source code** or contact support. 🚀

🛒 Product Backend API (WhatsApp Checkout)

A Node.js + Express backend for managing products and generating WhatsApp order links.
All cart logic is handled on the frontend.

---

🚀 Features

- 🔐 Admin authentication (JWT-based)
- 📦 Product management (create & fetch)
- 🛒 Frontend-driven cart system
- 📲 WhatsApp order link generation
- 🔒 Protected admin routes

---

🧰 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Token (JWT)

---

📁 Project Structure

├── models/
├── routes/
├── controllers/
├── middleware/
├── config/
├── server.js

---

⚙️ Installation

git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install

---

🔐 Environment Variables

Create a ".env" file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

---

▶️ Run Server

npm run dev

or

node server.js

---

📡 API Endpoints

🔑 Admin Login

POST "/api/admin/login"

{
"email": "admin@example.com",
"password": "yourpassword"
}

Response

{
"token": "JWT_TOKEN"
}

---

📦 Create Product (Protected)

POST "/api/products"

Headers

Authorization: Bearer <token>

{
"name": "Product Name",
"price": 5000,
"image": "optional-url"
}

---

📋 Get Products

GET "/api/products"

[
{
"_id": "id",
"name": "Product Name",
"price": 5000
}
]

---

📲 Generate WhatsApp Link

POST "/api/generate-whatsapp-link"

«The frontend sends cart data (since cart is not stored in backend)»

{
"name": "John",
"phone": "08012345678",
"cart": [
{ "name": "Item 1", "price": 2000 }
],
"total": 2000
}

Response

{
"url": "https://wa.me/..."
}

---

🔒 Authentication

Protected routes require JWT:

Authorization: Bearer <token>

---

🛒 Architecture Note

- Backend stores products only
- Cart and package logic are handled on the frontend
- Backend only processes the final order and generates a WhatsApp link

---

🧪 Testing

Use:

- Postman
- Thunder Client

---

📌 Future Improvements

- Add product update & delete
- Store orders in database
- Add order history
- Add analytics dashboard

---

👤 Author

Your Name
GitHub:https://github.com/ajisolasodiq10-prog

---

📄 License

MIT License

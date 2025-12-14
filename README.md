# 🍬 _Misthan_ - Sweet Shop Management System

> "A full-stack sweet shop management system built with Test-Driven Development."

![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-ORM-brightgreen?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge)

---

## 🎯 What Makes This Project Special?

_Misthan_ is a full-stack web application designed to manage a traditional sweet shop digitally.

It focuses on:

- Clean backend architecture with TDD
- JWT-based authentication (HttpOnly cookies)
- Role-based access control (Admin/User)
- Inventory & purchase management
- Modern React frontend with TanStack Router & Query
- Type-safe development with TypeScript & Prisma

This project emphasizes **Test-Driven Development**, **clean code**, and **practical implementation** without over-engineering.

---

## 🚀 Project Highlights

| Feature              | Description                            |
| -------------------- | -------------------------------------- |
| 🔐 Authentication    | JWT with HttpOnly cookies              |
| 👥 Role Separation   | Admin & user level access              |
| 🍬 Sweet Management  | CRUD operations for sweets             |
| 📦 Inventory Control | Stock tracking & restock functionality |
| 🛒 Purchase System   | Purchase sweets with quantity control  |
| 🔎 Advanced Search   | Filter by name, category, price range  |
| 🎨 Modern UI         | React + TanStack + Tailwind CSS        |
| 🧪 Test Coverage     | 32+ passing tests with Jest            |

---

## 🎪 _What You Can Do Here_

### 👥 _As a User:_

- 🔍 Browse & search through sweet collection with filters
- 🛒 Purchase sweets with quantity selection
- 📦 Real-time stock visibility
- 🔐 Secure authentication with JWT tokens in HttpOnly cookies

### 👨‍💼 _As an Admin:_

- ➕ Create new sweets with categories
- ✏ Update sweet details (name, price, stock, category)
- 📦 Restock inventory
- 🗑 Delete sweets from inventory
- 📂 Create and manage categories
- 👀 View only your own created sweets

---

## 🏗 _Architecture - The Big Picture_

```
┌─────────────────────────────────────────────────────────────┐
│                    🎨 CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite + TypeScript + Tailwind CSS)   │  │
│  │  • TanStack Router (File-based routing)              │  │
│  │  • TanStack Query (Server state management)          │  │
│  │  • Auth Context (Global auth state)                  │  │
│  │  • Custom UI Components                              │  │
│  │  • Purchase & Admin Dialogs                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST + Cookies
┌─────────────────────────────────────────────────────────────┐
│                    🚀 API LAYER (Express)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    📍 Routes                          │  │
│  │  ├─ /api/auth (register, login, me, logout)          │  │
│  │  ├─ /api/sweets (CRUD + search + purchase/restock)   │  │
│  │  └─ /api/category (create, list)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   🛡 Middleware                        │  │
│  │  ├─ requireAuth (JWT validation from cookie)          │  │
│  │  ├─ requireAdmin (Role-based access control)          │  │
│  │  └─ Error Handler (Structured error responses)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                💾 DATABASE LAYER (Prisma ORM)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              📊 Models (Prisma Schema)                │  │
│  │  ├─ User (email, name, password, role)                │  │
│  │  ├─ Category (name, description)                      │  │
│  │  └─ Sweet (name, price, stock, categoryId, userId)    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 _TDD Implementation Showcase_

### _1️⃣ Authentication System_ 🔐

_Test Coverage:_

- ✅ User registration with validation
- ✅ Duplicate email prevention
- ✅ Password hashing verification
- ✅ Login with credential verification
- ✅ JWT token generation & validation
- ✅ Profile retrieval with authentication
- ✅ Role-based authorization
- ✅ SQL injection prevention
- ✅ Case-insensitive email handling

### _2️⃣ Sweet Management System_ 🍭

_Test Coverage:_

- ✅ Create sweets (admin-only)
- ✅ GET all sweets (authenticated users)
- ✅ Search sweets with filters (name, category, price range)
- ✅ Update sweet details (admin + ownership check)
- ✅ Delete sweets (admin + ownership check)
- ✅ Purchase sweets with stock validation
- ✅ Restock sweets (admin + ownership check)
- ✅ Stock validation (prevent negative quantities)

### _3️⃣ Category Management System_ 📂

_Test Coverage:_

- ✅ Create categories (admin-only)
- ✅ Duplicate category prevention (case-insensitive)
- ✅ List all categories (authenticated users)
- ✅ Category validation with Zod

---

## 📊 _Test Coverage Report_

```
========================== Coverage Summary ===========================
Test Suites: ✅ 3 passed, 3 total
Tests:       ✅ 32 passed, 32 total
Time:        ~3-5s

All tests passing with comprehensive coverage across:
- Authentication flow (register, login, me, logout)
- Sweet CRUD operations
- Category management
- Purchase & restock functionality
========================================================================
```

✨ **Mission Accomplished!** Every feature is tested, validated, and production-ready.

---

## 🎬 _Application Screenshots_

_(Screenshots to be added)_

---

# 🚀 Quick Start Guide

### ✅ Prerequisites

- Node.js (v18+)
- PostgreSQL database
- pnpm (v10+)
- Git

---

## 🔧 _Backend Setup_

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/misthan.git
cd misthan

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
# Create apps/server/.env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/misthan"
JWT_SECRET=your_jwt_secret_here
PORT=3000

# 4. Set up Prisma database
cd apps/server
pnpx prisma generate
pnpx prisma db push

# 5. Run tests (optional)
pnpm test

# 6. Start the backend server
pnpm dev
```

**Backend will be live at:** http://localhost:3000 🎉

---

### _🎨 Frontend Setup_

```bash
# 1. Navigate to frontend (from root directory)
cd apps/frontend

# 2. Start frontend development server
pnpm dev
```

**Frontend will be live at:** http://localhost:5173 🎉

---

### _📦 Running the Full Stack_

```bash
# From root directory, run both backend and frontend:
pnpm dev
```

---

## 🔑 _API Reference_

### _🔐 Authentication_

```http
POST /api/auth/register    # Register new user (with optional role)
POST /api/auth/login       # Login user (sets HttpOnly cookie)
GET  /api/auth/me          # Get current user info (Protected)
POST /api/auth/logout      # Logout user (clears cookie)
```

### _🍬 Sweets Management_

```http
GET    /api/sweets             # Get all sweets (Protected)
GET    /api/sweets/search      # Search sweets with filters (Protected)
POST   /api/sweets             # Create sweet (Admin only)
PUT    /api/sweets/:id         # Update sweet (Admin + owner only)
DELETE /api/sweets/:id         # Delete sweet (Admin + owner only)
POST   /api/sweets/:id/purchase # Purchase sweet (Protected)
POST   /api/sweets/:id/restock  # Restock sweet (Admin + owner only)
```

### _📂 Category Management_

```http
GET  /api/category    # Get all categories (Protected)
POST /api/category    # Create category (Admin only)
```

---

## 🤖 _AI-Assisted Development - My Honest Experience_

### _🛠 Tool Used:_

- **GitHub Copilot** - Code completion and intelligent suggestions

---

### _✅ How I Used GitHub Copilot Effectively_

#### _1. Boilerplate & Repetitive Code_

**Scenario:** Setting up Express routes and middleware

```typescript
// I typed the route structure, Copilot suggested the implementation:
router.post("/register", async (req, res) => {
  // Copilot suggested the full validation and user creation flow
  const parsed = RegisterSchema.safeParse(req.body);
  // ... rest of the implementation
});
```

**Result:** Saved hours on boilerplate code while maintaining code quality.

#### _2. Test Case Generation_

**Scenario:** Writing Jest tests for authentication

```typescript
// I wrote the test description, Copilot completed the test:
it("should prevent duplicate user registration", async () => {
  // Copilot suggested: First registration, then duplicate attempt
  await request(app).post("/api/auth/register").send(userData);
  const response = await request(app).post("/api/auth/register").send(userData);
  expect(response.status).toBe(409);
});
```

**Result:** Comprehensive test coverage with less typing.

#### _3. TypeScript Type Definitions_

**Scenario:** Creating type-safe API responses

```typescript
// I started typing the interface, Copilot completed it:
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}
```

**Result:** Consistent type definitions across the codebase.

#### _4. Frontend Component Structure_

**Scenario:** Building React components with dialogs

```typescript
// I created the component skeleton, Copilot suggested state and handlers:
const [createDialog, setCreateDialog] = useState(false);
const [formData, setFormData] = useState({ name: "", price: "", stock: "" });
// Copilot suggested the complete form handling logic
```

**Result:** Faster UI development with consistent patterns.

---

### _⚠ When Copilot Needed Guidance_

**Business Logic:**

- Copilot suggested generic CRUD but didn't understand ownership checks
- I had to manually implement: "Admin can only manage their own sweets"

**Project-Specific Patterns:**

- Copilot suggested Mongoose, but I was using Prisma
- Required manual adjustment to Prisma syntax

**Complex Test Scenarios:**

- Copilot generated basic happy-path tests
- I added edge cases like: stock validation, ownership checks, role-based access

---

### _🎯 My Copilot Usage Philosophy_

**Copilot as a Tool, Not a Crutch:**

❌ Wrong: Accept every suggestion blindly  
✅ Right: Review suggestions, understand them, adapt as needed

❌ Wrong: Let Copilot design architecture  
✅ Right: Use Copilot for implementation details after I design

❌ Wrong: Copy-paste without testing  
✅ Right: Test every Copilot suggestion thoroughly

**The Golden Rule:**

> "GitHub Copilot accelerates coding, but I own the architecture and logic."

---

### _📈 Impact Metrics_

**Speed:**

- ⚡ 30-40% faster development on repetitive tasks
- ⚡ Saved ~15 hours on boilerplate and type definitions
- ⚡ Instant autocomplete for common patterns

**Quality:**

- 🎯 Consistent code style across files
- 🎯 Fewer typos and syntax errors
- 🎯 Better TypeScript type coverage

**Learning:**

- 📚 Discovered new TypeScript patterns
- 📚 Learned Jest testing conventions
- 📚 Understood React hooks patterns better

---

## 🎭 _Test Credentials_

### _Admin Access_

📧 Email: admin@example.com  
🔑 Password: admin123  
🎯 Role: ADMIN

### _User Access_

📧 Email: user@example.com  
🔑 Password: user123  
🎯 Role: USER

_(Create these users via registration or seed your database)_

---

## 🎨 _Tech Stack Deep Dive_

### _Backend Arsenal_

🏗 **Runtime** → Node.js  
🚂 **Framework** → Express.js  
📘 **Language** → TypeScript  
🗄 **Database** → PostgreSQL  
🧬 **ORM** → Prisma  
🔐 **Authentication** → JWT with HttpOnly Cookies  
🔒 **Password Hashing** → bcrypt  
✅ **Validation** → Zod  
🧪 **Testing** → Jest + Supertest  
🛡 **Middleware** → Custom auth middleware (requireAuth, requireAdmin)

### _Frontend Arsenal_

⚛ **Framework** → React 19  
⚡ **Build Tool** → Vite  
📘 **Language** → TypeScript  
🎨 **Styling** → Tailwind CSS 4  
🧠 **State Management** → React Context API + TanStack Query  
🛣 **Routing** → TanStack Router (file-based)  
🌐 **API Client** → Axios  
🎯 **Query Management** → TanStack Query v5  
🎭 **UI Components** → Custom components

### _DevOps & Development_

📦 **Package Manager** → pnpm  
🧪 **Testing** → Jest with manual Prisma mocks  
📂 **Version Control** → Git & GitHub  
🔧 **Development** → Hot reload for both frontend & backend  
🎯 **Type Safety** → Full TypeScript coverage  
🤖 **AI Assistant** → GitHub Copilot

---

## 📈 _Future Roadmap_

### _Phase 1: Core Features_ (Completed ✅)

- [x] Authentication & Authorization (JWT + Cookies)
- [x] Role-based Access Control (Admin/User)
- [x] Sweet Management (CRUD operations)
- [x] Category Management
- [x] Purchase System with Stock Validation
- [x] Restock Functionality
- [x] Search & Filter System
- [x] Admin Dashboard
- [x] Comprehensive Test Coverage

### _Phase 2: Enhanced Features_ (Next)

- [ ] 💳 Payment Gateway Integration (Stripe/Razorpay)
- [ ] 📧 Email Notifications (Order confirmation, low stock alerts)
- [ ] ⭐ Product Reviews & Ratings
- [ ] 📊 Advanced Analytics Dashboard
- [ ] 📱 Responsive Mobile Design Improvements
- [ ] 🔔 Real-time Stock Notifications
- [ ] 📦 Order History & Tracking

### _Phase 3: Scale & Optimize_

- [ ] 🚀 Redis Caching for Performance
- [ ] 📡 WebSocket for Real-time Updates
- [ ] 🌍 Multi-language Support (i18n)
- [ ] 📱 Mobile App (React Native)
- [ ] 🔍 Advanced Search (Elasticsearch)
- [ ] 📈 Performance Monitoring
- [ ] 🐳 Docker Containerization

---

## 🤝 _Contributing_

Love TDD? Want to add features? Here's how:

```bash
# 1. Fork & Clone
git clone https://github.com/yourusername/misthan.git

# 2. Create Feature Branch
git checkout -b feature/amazing-feature

# 3. Follow TDD (IMPORTANT!)
# - Write test first (RED)
# - Make it pass (GREEN)
# - Refactor (REFACTOR)

# 4. Run tests
cd apps/server
pnpm test

# 5. Commit (Conventional Commits)
git commit -m "feat: add amazing feature with tests"

# 6. Push & PR
git push origin feature/amazing-feature
```

**Contribution Guidelines:**

- ✅ All new features must have tests
- ✅ Follow existing code patterns
- ✅ Write meaningful commit messages
- ✅ Update documentation
- ✅ Ensure all tests pass before PR

---

## 📊 _Project Statistics_

📝 **Total Lines of Code:** ~5,000+  
🧪 **Test Files:** 3  
✅ **Test Cases:** 32+  
📈 **Test Coverage:** Comprehensive (Auth, Sweets, Categories)  
💾 **Git Commits:** 30+  
⏰ **Development Time:** ~50 hours  
☕ **Cups of Tea:** ∞

---

## 🙏 _Acknowledgments_

**Big Thanks To:**

🤖 **GitHub Copilot**

- For intelligent code completion
- Saved countless keystrokes
- Made development faster and more enjoyable

📚 **Prisma Team**

- For excellent ORM and type generation
- Made database development a breeze

⚛ **TanStack Team**

- For amazing Router and Query libraries
- Modern React development made easy

🧪 **Jest Team**

- For comprehensive testing framework
- Made TDD enjoyable

👥 **The Open Source Community**

- For all the amazing libraries and tools
- For documentation and examples

---

## 👨‍💻 _About the Developer_

**Mrinmoy Sarkar** - Full Stack Developer & TDD Enthusiast

🐙 GitHub: [@Mrinmoy-cyb](https://github.com/Mrinmoy-cyb)  
📧 Email: mrinmoy.0617@gmail.com

**Currently:** Building with modern tech stacks and TDD principles  
**Mission:** Write clean, tested, maintainable code

---

## 📄 _License_

This project is licensed under the **MIT License** - feel free to learn, modify, and share!

---

## 💭 _Final Thoughts_

This project taught me that:

- 🎯 **TDD isn't slower** - it's confidence and faster refactoring
- 🧠 **Tests are documentation** - they explain what code should do
- 💪 **Confidence comes from coverage** - refactor fearlessly
- 🤖 **GitHub Copilot accelerates** - but doesn't replace understanding
- 🎓 **Learning never stops** - every bug is a lesson
- 🏗 **Architecture matters** - good structure makes everything easier

**If you read this far, you're awesome!** ⭐

Star the repo, try the project, break things, fix them, and most importantly - **test first, code later**!

---

<div align="center">

### **Built with ❤️, TypeScript, Test-Driven Development, and GitHub Copilot**

**"Red, Green, Refactor, Repeat"**

_Misthan - Where tradition meets technology_ 🍬

</div>

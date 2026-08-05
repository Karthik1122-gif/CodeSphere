# CodeSphere | Autonomous Coding Assessment Platform

CodeSphere is a next-generation secure online judge and coding assessment platform designed for autonomous engineering colleges. It allows faculty members to create, run, and auto-grade coding tests in isolated sandboxes.

---

## 🚀 Key Features

* **Multi-Language Compiler**: Ephemeral process execution for C, C++17, Python 3, and JavaScript/Node.
* **Isolated Sandboxing**: Secure local sandboxing enforcing runtime timeouts and memory boundaries.
* **Dynamic Analytics Dashboard**: Faculty tracking of class averages, pass rates, and submission telemetries.
* **AI Question Assistant**: Integrates an assistant to draft questions and compile inputs in the test editor.
* **ISO 27001 & NBA Alignment**: Immutable audit trails and session tracking logs exportable for compliance.

---

## 🛠️ Tech Stack

* **Frontend & Backend**: Next.js 16 (App Router), React 19, TailwindCSS v4
* **Database ORM**: Prisma ORM v6
* **Database**: MongoDB Atlas (Replica Set)
* **IDE Editor**: Monaco Editor (VS Code core engine)

---

## 💻 Local Setup & Installation

Follow these steps to run CodeSphere on your computer:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and a running **MongoDB cluster** (replica set enabled, like a free MongoDB Atlas tier).

### 2. Configure Environment Variables
Create a file named `.env` in the root folder of the project, copying the template from `.env.example`:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/CodeSphere?appName=Cluster1"
JWT_SECRET="your-custom-jwt-secret-key-here"
```
*(Make sure to URL-encode any special characters in your password, e.g., replace `@` with `%40`).*

### 3. Install Dependencies
Run the package installation:
```bash
npm install
```

### 4. Setup Database
Synchronize the Prisma schema structure with MongoDB (creates collections and indices) and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Seed Initial Data
Run the seeding script to populate the database with mock accounts, problems, and test cases:
```bash
npx tsx prisma/seed.ts
```

### 6. Start Development Server
Launch the development server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view the application.

---

## 🔑 Seeding / Login Credentials

After running the seed script, you can log in using these preset credentials:

### 👤 Student Dashboard
* **Email**: `student@hitam.edu.in`
* **Password**: `Password123`
* **Role**: `STUDENT`

### 🎓 Faculty Dashboard
* **Email**: `faculty@hitam.edu.in`
* **Password**: `Password123`
* **Role**: `FACULTY`

### 🔑 System Admin Console
* **Email**: `admin@hitam.edu.in`
* **Password**: `Password123`
* **Role**: `ADMIN`

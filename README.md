# Fullstack Project Runner

🚀 **Chạy npm commands cho cả frontend và backend với một lệnh đơn giản!**

## 📋 Commands for All Operating Systems

### 📦 Install Dependencies

```bash
npm run install
# Hoặc riêng lẻ:
npm run install:frontend
npm run install:backend
```

### 🔧 Development Mode

**Windows:**

```cmd
npm run dev:windows
```

**macOS/Linux:**

```bash
npm run dev:unix
```

**Manual (All OS):**

```bash
# Mở 2 terminal riêng và chạy:
npm run dev:frontend
npm run dev:backend
```

### 🏗️ Build Projects

```bash
npm run build
# Hoặc riêng lẻ:
npm run build:frontend
npm run build:backend
```

### 🚀 Start Production

**Windows:**

```cmd
npm run start:windows
```

**macOS/Linux:**

```bash
npm run start:unix
```

**Manual (All OS):**

```bash
# Mở 2 terminal riêng và chạy:
npm run start:frontend
npm run start:backend
```

### 🧪 Run Tests

```bash
npm run test
# Hoặc riêng lẻ:
npm run test:frontend
npm run test:backend
```

### 🧹 Clean Dependencies

```bash
npm run clean
# Hoặc riêng lẻ:
npm run clean:frontend
npm run clean:backend
```

## 🔧 Environment Configuration

This project uses a **consolidated environment configuration** with a single `.env` file at the root level.

### Setup Environment Variables

1. **Copy the example file:**

    ```bash
    cp .env.example .env
    ```

2. **Edit `.env` with your actual values:**
    - Database credentials
    - JWT secrets
    - API endpoints
    - Port configurations

### Environment Structure

The consolidated `.env` file contains all configuration for:

-   **Backend** (port 5000)
-   **Admin Backend** (port 4002)
-   **Frontend** (port 3000)
-   **Admin Frontend** (port 3001)
-   **Database connection** (shared across services)

All services automatically load from the root `.env` file - no need for separate environment files!

## 💡 Quick Start

1. **Setup environment:**

    ```bash
    cp .env.example .env
    # Edit .env with your database credentials
    ```

2. **Install dependencies:**

    ```bash
    npm run install
    ```

3. **Start development:**

    - **Windows:** `npm run dev:windows`
    - **macOS/Linux:** `npm run dev:unix`

4. **Build for production:**
    ```bash
    npm run build
    ```

## 🎯 OS-Specific Notes

-   **Windows**: Sử dụng `start` command để mở 2 cửa sổ cmd riêng biệt
-   **macOS/Linux**: Sử dụng `&` để chạy processes trong background
-   **All OS**: Có thể chạy manual bằng cách mở 2 terminal và chạy từng lệnh

---

**No extra dependencies required! 🎉**

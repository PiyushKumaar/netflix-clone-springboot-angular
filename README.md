# 🎬 NetFlix Clone

[![Java](https://img.shields.io/badge/Java-17-%23ED8B00?logo=java)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-%236DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Maven-3.9.6-%2337373D?logo=apache-maven)](https://maven.apache.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-%23339933?logo=node.js)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17-%23DD0031?logo=angular)](https://angular.io/)
[![License](https://img.shields.io/github/license/yourusername/NetFlix-clone)](LICENSE)

---

## 📖 Table of Contents
<details open>
  <summary>Click to expand</summary>

- [📖 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#-architecture)
- [📁 Folder Structure](#-folder-structure)
- [🚀 API Endpoints](#-api-endpoints)
- [⚙️ Installation & Setup](#-installation--setup)
  - [Backend (Spring Boot)](#backend-spring-boot)
  - [Frontend (Angular)](#frontend-angular)
- [🔧 Environment Variables](#-environment-variables)
- [▶️ How to Run](#-how-to-run)
- [🔮 Future Improvements](#-future-improvements)
- [👤 Author](#-author)

</details>

---

## 📖 Overview
NetFlix Clone is a **full‑stack video streaming platform** built with **Spring Boot** (backend) and **Angular** (frontend). It supports user registration, JWT authentication, video upload, streaming with HTTP range support, watch‑list management and admin‑only video publishing controls.

---

## ✨ Key Features
- **User Management** – sign‑up, email verification, password reset, role‑based access (`ADMIN` / `USER`).
- **Video & Poster Upload** – multipart upload endpoints store files locally and return a UUID.
- **Streaming** – video files are served with proper `Content‑Range` headers for efficient playback.
- **Admin Dashboard** – create, update, delete, publish/unpublish videos.
- **Watch‑List** – users can add or remove videos to their personal watch‑list.
- **Statistics** – total videos, published videos, total duration.
- **Security** – CORS configuration and JWT authentication.

---

## 🛠️ Tech Stack
| Layer | Technology | Description |
|-------|------------|-------------|
| **Backend** | Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, Lombok, Hibernate | REST API, JWT auth, JPA repository pattern |
| **Database** | H2 (development) / any JDBC‑compatible DB (PostgreSQL, MySQL) | Relational storage for users, videos, watch‑lists |
| **File Storage** | Local filesystem (`uploads/videos`, `uploads/images`) | Simple storage for media assets |
| **Frontend** | Angular 17, TypeScript, RxJS, Angular Material | SPA with routing, guards, dialogs |
| **Build** | Maven (backend), npm (frontend) | Dependency management |
| **Testing** | JUnit (backend), Jasmine/Karma (frontend) | Unit & integration tests |

---

## 🏗️ Architecture
```mermaid
flowchart TD
    subgraph Frontend[Angular SPA]
        FE[UI Components]
        FE -->|REST Calls| BE
    end
    subgraph Backend[Spring Boot]
        BE[REST Controllers]
        BE --> Service[Service Layer]
        Service --> Repo[Repository (JPA)]
        Service --> FileSrv[FileUploadService]
        FileSrv --> FS[Filesystem Storage]
        Repo --> DB[(Database)]
    end
    FE -->|JWT in Authorization header| Auth[Spring Security]
    Auth --> JWT[JwtUtil]
    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
```
*The diagram is GitHub‑compatible.*

---

## 📁 Folder Structure
```
NetFlix clone/
├─ .idea/                 # IDE configuration
├─ backend/                # Spring Boot application
│   ├─ src/main/java/com/netflix/clone
│   │   ├─ config/                # CORS & Security configuration
│   │   ├─ controller/            # REST controllers (Auth, Video, FileUpload, …)
│   │   ├─ dao/                   # Spring Data repositories
│   │   ├─ dto/                   # Request / response objects
│   │   ├─ entity/                # JPA entities (User, Video, …)
│   │   ├─ enums/                 # Role enum
│   │   ├─ exceptions/            # Global exception handling
│   │   ├─ security/              # JWT filter & utilities
│   │   ├─ service/               # Service interfaces
│   │   ├─ serviceImpl/           # Service implementations
│   │   └─ util/                  # Helper utilities (FileHandlerUtil, …)
│   └─ pom.xml                # Maven build file
├─ frontend/               # Angular project
│   ├─ src/app/
│   │   ├─ admin/               # Admin modules (manage‑video, manage‑user)
│   │   ├─ components/          # Shared UI components (header, dialogs, …)
│   │   ├─ services/            # Angular services (auth, video, watch‑list)
│   │   ├─ guards/              # Route guards (auth‑guard, admin‑guard)
│   │   └─ ...
│   ├─ angular.json
│   └─ package.json
├─ README.md               # ← this file
└─ ...
```

---

## 🚀 API Endpoints
> All endpoints are prefixed with **`/api`**. Authentication (JWT) is required for admin routes (`hasRole('ADMIN')`).

### Auth & User
| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/auth/signup` | Register a new user (verification email sent). |
| `POST` | `/api/auth/login` | Obtain JWT token. |
| `POST` | `/api/auth/verify-email` | Verify email with token. |
| `POST` | `/api/auth/forgot-password` | Send password‑reset email. |
| `POST` | `/api/auth/reset-password` | Reset password using token. |
| `GET`  | `/api/users/me` | Get current user profile (requires JWT). |

### Video Management (Admin only)
| Method | URL | Description |
|--------|-----|-------------|
| `POST`   | `/api/videos/admin` | Create video – body includes `src` (video UUID) and `poster` (image UUID). |
| `GET`    | `/api/videos/admin` | Paginated list of all videos (optional `search`). |
| `PUT`    | `/api/videos/admin/{id}` | Update video fields, optionally with new `src`/`poster` UUIDs. |
| `DELETE` | `/api/videos/admin/{id}` | Delete video. |
| `PATCH`  | `/api/videos/admin/{id}/publish?status=true` | Publish or unpublish a video. |
| `GET`    | `/api/videos/admin/stats` | Statistics: total videos, published videos, total duration. |

### Public Video Access
| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/videos/published` | Paginated list of published videos (available to all). |
| `GET` | `/api/videos/featured` | Top 5 random published videos. |
| `GET` | `/api/files/video/{uuid}` | Stream video file (supports `Range` header). |
| `GET` | `/api/files/image/{uuid}` | Retrieve poster image. |

---

## ⚙️ Installation & Setup
### Backend (Spring Boot)
1. **Prerequisites**
   - Java 17 JDK
   - Maven 3.9+
   - (Optional) a relational DB; the default profile uses an embedded H2 database.
2. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd "NetFlix clone/backend"
   ```
3. **Environment variables** – create a `.env` (or edit `application.properties`) with at least:
   ```properties
   JWT_SECRET=your-secret-key
   FILE_UPLOAD_VIDEO_DIR=uploads/videos
   FILE_UPLOAD_IMAGE_DIR=uploads/images
   ```
   Adjust DB settings (`spring.datasource.*`) if you switch from H2.
4. **Build and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The API will be available at `http://localhost:8080`.

### Frontend (Angular)
1. **Prerequisites**
   - Node.js 20 (LTS)
   - npm 10+
   - Angular CLI (`npm i -g @angular/cli`)
2. **Install dependencies**
   ```bash
   cd "NetFlix clone/frontend"
   npm install
   ```
3. **Configure environment** – edit `src/environments/environment.ts` (or `environment.development.ts`):
   ```ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```
4. **Run the development server**
   ```bash
   ng serve
   ```
   Open `http://localhost:4200` in a browser.

---

## 🔧 Environment Variables
| Variable | Scope | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Backend | Secret key for signing JWT tokens. |
| `FILE_UPLOAD_VIDEO_DIR` | Backend | Directory for uploaded video files (default `uploads/videos`). |
| `FILE_UPLOAD_IMAGE_DIR` | Backend | Directory for uploaded poster images (default `uploads/images`). |
| `SPRING_DATASOURCE_URL` | Backend | JDBC URL for production DB (optional). |
| `SPRING_DATASOURCE_USERNAME` | Backend | DB username (optional). |
| `SPRING_DATASOURCE_PASSWORD` | Backend | DB password (optional). |
| `API_URL` | Frontend | Base URL used by Angular services (see `environment.ts`). |

---

## ▶️ How to Run
1. **Start the backend** – `mvn spring-boot:run`.
2. **Start the frontend** – `ng serve`.
3. Open `http://localhost:4200`.
4. Register a new user, verify the email (check console log for the verification link in dev mode), then log in.
5. As an admin, upload video and poster files via the file‑upload endpoints, keep the returned UUIDs, and create a video record using the admin UI.
6. Users can browse published videos, stream them, and add them to their watch‑list.

---

## 🔮 Future Improvements
- Cloud storage integration (AWS S3 / Google Cloud Storage) for media assets.
- Video transcoding to generate multiple resolutions.
- Search & recommendation engine using Elasticsearch or vector similarity.
- Docker Compose for easy local deployment of backend, DB, and frontend.
- CI/CD pipeline with GitHub Actions for automated testing and deployment.
- Refresh‑token flow for longer‑lived sessions.

---

## 👤 Author
**Your Name** – Full‑stack developer  
[GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)

---

*README generated by Antigravity AI assistant.*

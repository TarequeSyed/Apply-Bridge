<div align="center">

  <img src="public/logo.svg" alt="ApplyBridge Origami Ribbon Logo" width="80" height="80" />

  # 🌉 ApplyBridge
  ### The "Ctrl+V" Career Opportunity Engine
  **Stop Applying Blind. Paste Winning Applications.**

  <p align="center">
    A local-first, zero-knowledge career equalizer engineered to convert informal coursework into executive ATS bullets, monitor buried recruiter deadlines, and paste winning applications with single-click velocity.
  </p>

  <p align="center">
    <a href="https://github.com/TarequeSyed/Apply-Bridge"><img src="https://img.shields.io/badge/Devpost-Ctrl%2BV%20Hackathon%202026-bef264?style=for-the-badge&logo=devpost&logoColor=0f172a" alt="Devpost Hackathon" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-0f172a?style=for-the-badge&labelColor=bef264&color=0f172a" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Security-AES--256--GCM-16a34a?style=for-the-badge&logo=shield&logoColor=white" alt="Web Crypto AES-256" />
    <img src="https://img.shields.io/badge/Architecture-100%25%20Zero--Knowledge-lime?style=for-the-badge" alt="Zero-Knowledge" />
  </p>

  <p align="center">
    <a href="#-inspiration--the-why">Inspiration</a> •
    <a href="#-superpowers--key-features">Key Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quickstart--installation">Quickstart</a> •
    <a href="#-multi-model-ai-engine">Multi-Model AI</a> •
    <a href="#-zero-knowledge-security">Security</a> •
    <a href="#-license">License</a>
  </p>
</div>

---

## 💡 Inspiration & The "Why"

> *"Ctrl+V shouldn't just be about copy-pasting text—it should be about pasting down barriers to career mobility."*

When starting out in tech from a **Tier 3 college**, the barriers to entry feel invisible yet insurmountable. Without tech mentors, alumni networks, or corporate insiders, non-traditional candidates have to teach themselves corporate jargon, Applicant Tracking System (ATS) nuances, and interview etiquette from scratch.

### The Problem:
* **The Gatekeeping Jargon Gap:** Students build real, functional software (e.g. Discord bots, community tools, web scrapers), but automated ATS scanners reject their resumes because they lack specific corporate buzzwords.
* **Application Burnout:** Candidates waste hundreds of hours manually typing the same answers (*"Why do you want to work here?"*, *"Tell me about a time you resolved conflict"*) across dozens of fractured job portals.
* **Buried Deadlines & Silent Rejections:** Critical 48-hour technical assessments and interview invitations get lost in spam folders and crowded inboxes.
* **Privacy Exploitation:** Traditional job tracker extensions scrape candidate inboxes and sell personal communication and resume data to third parties.

**ApplyBridge was built to change this.** It acts as an **air-gapped, zero-knowledge equalizer** that automates the tedious mechanics of job hunting, decrypts recruitment gatekeeping, and protects candidate privacy with hardware-accelerated local encryption.

---

## ⚡ Superpowers & Key Features

### 1. 🪄 The Experience Translator & PDF Studio (Jargon Decryptor)
* **Client-Side PDF Parsing:** Drop your actual PDF resume into the browser; parsed 100% locally via dynamic Web Worker execution without uploading your document to remote servers.
* **Job Description Calibration:** Paste any target Job Description (JD) to run instant keyword overlap analysis and receive an **ATS Match Score (0–100%)**.
* **3 STAR Bullet Variants:** Generates three executive, recruiter-calibrated bullet formats:
  * 🎯 **Option A (Impact & Metrics-Driven):** Highlights scale, throughput, and quantitative percentages.
  * ⚙️ **Option B (Technical Depth & Architecture):** Emphasizes concurrency, caching, data structures, and latency.
  * 👥 **Option C (Leadership & Ownership):** Showcases cross-functional empathy, accessibility (WCAG AA), and mentoring.
* **1-Click Copy:** Each calibrated bullet has an instant `[Ctrl+V]` copy pill ready to paste directly into your resume or application form.

### 2. 📋 Ctrl+V Floating Smart Clipboard Dock
* **Contextual Answer Library:** Instant 1-click access to verified, high-converting screening responses (*Elevator Pitch*, *Why This Company?*, *Conflict Resolution*, *Technical Adversity*).
* **Dynamic Interpolation:** Automatically injects the target company's name, engineering values, and required tech stack into the boilerplate text with zero manual editing.
* **Always Accessible:** Floats seamlessly across all dashboard views for friction-free multitasking.

### 3. 📡 Recruiter Action Radar & Real Gmail PKCE Protocol
* **Browser-Native OAuth 2.0 PKCE:** Connects directly to Google Identity Services with client-side Proof Key for Code Exchange (PKCE).
* **Strictly Bounded Whitelist Queries:** Never reads your general inbox, personal chats, or bank statements. ApplyBridge queries Gmail **exclusively** for addresses matching recruiters on your active pipeline cards (e.g., `from:recruiter@stripe.com OR to:recruiter@stripe.com`).
* **Urgency & Action Item Extraction:** Automatically detects buried 48-hour take-home deadlines, technical challenge links, and interview availability requests.
* **1-Click Quick Replies:** Generates polite, professional confirmation responses ready to send.

### 4. 📅 Interactive In-App Interview Scheduler
* **Zero 404 Links:** No broken or expired third-party scheduling links.
* **In-App Booking Experience:** Candidates select interview dates and time slots directly in a modal with live calendar previews.
* **Pipeline Synchronization:** Locking in a slot automatically updates the application's Kanban stage, logs the confirmation in the communication ledger, exports a 1-click Google Calendar event, and triggers celebration confetti.

### 5. 👻 The Ghosting Sentinel & Polite Nudge Engine
* **Automated Silence Tracking:** Monitors elapsed days since last recruiter contact and calculates ghosting risk levels (Normal, Attention Needed, Critical Ghosting).
* **1-Click Polite Nudge Generator:** Crafts customized, respectful check-in follow-up emails tailored to the specific company and role.

### 6. 🔒 Air-Gapped Web Crypto AES-256 Vault
* **Zero-Knowledge Guarantee:** Job applications contain private Personal Identifiable Information (PII) including legal names, addresses, and compensation history. ApplyBridge encrypts sensitive fields locally using **AES-256-GCM** with PBKDF2 key derivation.
* **Local IndexedDB Storage:** All notes, applications, and recruiter emails stay in your browser via Dexie.js. **0 bytes of candidate data are sent to any remote database.**

### 7. 🎨 High-Precision Neo-Brutalist Design System
* **Aesthetic:** Custom Neo-Brutalist UI featuring Electric Lime (`#bef264` / `#84cc16`), deep ink borders (`#0f172a`), 3D hard-shadow offset buttons, and geometric cards.
* **Typography:** Universally styled with Google Poppins (`300` to `900` weight) for crisp legibility.
* **Branding:** Custom 3D folded geometric origami ribbon "A" logo and matching vector favicons.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          APPLYBRIDGE CLIENT                            │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ Neo-Brutalist UI      │  │ Experience      │  │ Ctrl+V Smart     │  │
│  │ (Bento Grid + Poppins)│  │ Decryptor Studio│  │ Clipboard Dock   │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
│              │                       │                    │            │
│  ┌───────────▼───────────────────────▼────────────────────▼─────────┐  │
│  │                Universal Multi-Model AI Router                   │  │
│  │  (Google Gemini Flash · Hugging Face API · Groq LPUs · Local)    │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
│                                      │                                 │
│  ┌───────────────────────────────────▼──────────────────────────────┐  │
│  │                   Client-Side Security Sandbox                   │  │
│  │  • Regex PII Sanitizer & Masker   • Whitelist Gmail Query Engine │  │
│  │  • PDF.js Dynamic ESM Loader      • Web Crypto AES-256-GCM Vault │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
│                                      │                                 │
│  ┌───────────────────────────────────▼──────────────────────────────┐  │
│  │               Encrypted Local IndexedDB (Dexie.js)               │  │
│  │               (0 Bytes Transmitted to Cloud DBs)                 │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
                      Direct Client-to-Provider APIs
                     (No Intermediary Backend Server)
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
   ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
   │ Google OAuth  │           │ AI Providers  │           │ Firebase Auth │
   │ 2.0 PKCE      │           │ Gemini / HF / │           │ (Zero-Trust   │
   │ (Gmail API)   │           │ Groq / Local  │           │ SDK Sandbox)  │
   └───────────────┘           └───────────────┘           └───────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript** | High-performance reactive UI and strict type safety |
| **Build Tool & Bundler** | **Vite 8** | Sub-second HMR and optimized production bundling |
| **Styling & Design** | **Tailwind CSS v4** + **Neo-Brutalism** | Electric lime palette, tactile ink-borders, and responsive grid layouts |
| **Typography** | **Google Poppins** | Modern geometric sans-serif across all views |
| **Local Persistence** | **Dexie.js (IndexedDB)** + `dexie-react-hooks` | Local-first, offline-capable candidate database |
| **Cryptography & Security** | **Web Crypto API (SubtleCrypto)** | Hardware-accelerated AES-256-GCM encryption and PBKDF2 derivation |
| **Document Processing** | **PDF.js (`pdfjs-dist`)** | Dynamic ESM client-side PDF resume parsing |
| **Authentication** | **Firebase Auth** | Zero-trust authentication with Google Sign-In & Email/Password |
| **Third-Party APIs** | **Gmail REST API** + **Google Identity Services** | Client-side OAuth 2.0 PKCE for bounded recruiter query monitoring |
| **Micro-Interactions** | **Canvas-Confetti** + **Lucide React** | Visual delight, application success celebrations, and iconography |
| **Linting & Code Quality** | **Oxlint** | High-speed Rust-based linting engine |

---

## 🚀 Quickstart & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/TarequeSyed/Apply-Bridge.git
cd Apply-Bridge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create your local `.env` file from the provided template:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
# Firebase Authentication Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google OAuth 2.0 PKCE Client ID (For Recruiter Gmail Radar)
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# AI Provider Keys (Provide ANY ONE of these models and ApplyBridge auto-runs it!)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
VITE_GROQ_API_KEY=your_groq_api_key
```

> [!NOTE]
> **Zero-Setup Local Quickstart:** If you don't have Firebase or Google OAuth credentials yet, you can still test ApplyBridge locally! Simply run `npm run dev` and click **"Instant Demo"** or enter any name and email to enter the local offline sandbox with full Dexie.js persistence.
> 
> **Google Cloud Console OAuth Setup:** When creating your Web application OAuth Client ID:
> * **Authorized JavaScript Origins:** `http://localhost:5173` (local dev) and `https://apply-bridge-pi.vercel.app` (production Vercel) — *do not include trailing slashes*.
> * **Authorized Redirect URIs:** `http://localhost:5173` (local dev callback) and `https://applybridge2.firebaseapp.com/__/auth/handler` (production Vercel & Firebase Auth callback).
> * *Pro-Tip:* Adding both origins and both redirect URIs to the same OAuth client allows one single Client ID to work everywhere without re-configuration!
> 
> All credentials are strictly read at build/runtime from `.env`. Client-side tampering of credentials in production is disabled, and `.env` is fully excluded from git tracking.

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🧠 Multi-Model AI Engine

ApplyBridge features a **Universal Multi-Model Auto-Detection Engine**. You can provide the API key for **any single model provider**, and ApplyBridge will automatically detect and route all resume tailoring, JD analysis, and experience translation through that model:

| Engine | Default Model | Speed / Limits | Setup |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `gemini-1.5-flash` | Ultra-fast, generous token limits | Set `VITE_GEMINI_API_KEY` |
| **Hugging Face** | `mistralai/Mistral-7B-Instruct-v0.3` | Generous free community tier | Set `VITE_HUGGINGFACE_API_KEY` |
| **Groq LPU** | `llama-3.1-8b-instant` | Instantaneous LPU inference (~500 T/s) | Set `VITE_GROQ_API_KEY` |
| **Offline Heuristic** | Built-in Rule Engine | Zero API key needed, 100% offline | Automatically runs as fallback |

> [!TIP]
> **Zero-Key Mode:** If you do not have any API keys, ApplyBridge automatically falls back to its deterministic rule-based NLP engine so every feature remains 100% usable!

---

## 🔐 Zero-Knowledge Security & Privacy Architecture

Job seekers routinely paste unredacted resumes containing full legal names, phone numbers, residential addresses, and private correspondence. ApplyBridge enforces an uncompromising **air-gapped security model**:

1. **Client-Side AES-256-GCM Vault:** All candidate data is encrypted using native Web Crypto APIs before being stored in browser IndexedDB.
2. **SHA-256 Hashed Credential Storage:** Google OAuth Client IDs entered via the UI are salted and hashed on the host machine.
3. **Zero-Knowledge Gmail PKCE:** The Gmail integration uses client-side Proof Key for Code Exchange. Query filters are mathematically bound to recruiters on your active cards (`from:recruiter@...`). Your general mailbox is never scanned, and access tokens never touch a third-party server.
4. **Row-Level Security (RLS):** Strict rules in `firestore.rules` and `storage.rules` ensure no unauthenticated user can read or write any cloud resources.

---

## 🏆 Devpost Ctrl+V Hackathon Alignment

ApplyBridge was created specifically for the **Devpost Ctrl+V Hackathon 2026** under the theme **"Making Access Easier"**:

* **Breaking the "Hidden Curriculum":** Demystifies corporate recruiting for Tier 3, first-generation, and non-traditional candidates.
* **1-Click Velocity:** Replaces repetitive manual form-filling with contextual, verified answers via the Ctrl+V Dock.
* **Preventing Lost Opportunities:** Eliminates buried 48-hour assessment deadlines and lost interview invites.
* **100% Free & Open Source:** Empowers students globally without paywalls or subscription gates.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ and determination by <b>Tareque Syed</b> for the <b>Devpost Ctrl+V Hackathon 2026</b>.</sub>
</div>

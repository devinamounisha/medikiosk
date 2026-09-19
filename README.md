# 🏥 MediKiosk

### AI-Assisted Clinical Intake & OPD Triage System

MediKiosk is a smart **AI-assisted patient intake and clinical history collection system** designed to improve the outpatient department (OPD) workflow.

It allows patients to enter their details, provide consent, complete an AI-guided clinical interview, and automatically make the collected information available to doctors through a dedicated dashboard.

## 🚀 Live Demo

🌐 **Deployed Application:**
[https://medikiosk-mauve.vercel.app/](https://medikiosk-mauve.vercel.app/?utm_source=chatgpt.com)

---

## 📌 Problem Statement

In high-volume hospitals and OPDs, doctors often spend significant time collecting basic patient information and medical history before beginning the actual consultation.

This can result in:

* Long patient waiting times
* Repetitive data collection
* Increased workload for doctors
* Incomplete patient history
* Difficulty managing OPD queues
* Delays in clinical decision-making

MediKiosk aims to streamline this initial process through a digital kiosk and AI-assisted clinical interview.

---

## 💡 Solution

MediKiosk provides a digital workflow where:

```text
Patient
   ↓
Language Selection
   ↓
Patient Identification
   ↓
Consent
   ↓
AI-Assisted Clinical Interview
   ↓
Clinical History Collection
   ↓
Doctor Dashboard
   ↓
Doctor Review & Consultation
```

The system separates **patient intake** from the doctor's consultation, allowing doctors to review the collected information before interacting with the patient.

---

## ✨ Key Features

### 👤 Patient Kiosk

* Language selection
* Patient registration
* Patient identification
* Age and gender collection
* Phone number and ABHA ID support
* Emergency contact information
* Digital consent
* AI-assisted clinical interview
* Step-by-step intake process

### 🤖 AI-Assisted Clinical Interview

The system guides patients through a structured clinical history.

It can collect information related to:

* Chief complaint
* History of present illness
* Past medical history
* Medications
* Allergies
* Other relevant clinical information

The collected responses are associated with the patient's specific clinical case.

### 👨‍⚕️ Doctor Dashboard

Doctors can:

* View the OPD queue
* Search patients
* Filter cases by status
* View triage priority
* Review patient details
* Review clinical interview responses
* Monitor intake progress
* Review collected clinical information
* Update case status

### 🚨 Triage Support

Cases can be categorized based on priority:

* Routine
* Urgent
* Emergency

This helps organize the OPD workflow according to the configured triage priority.

---

## 🏗️ System Architecture

```text
                  ┌──────────────────────┐
                  │    Patient Kiosk     │
                  │   React + TypeScript │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      REST API        │
                  │   Node.js + Express  │
                  └──────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐          ┌─────────────────┐
     │    Supabase     │          │   AI Service    │
     │    Database     │          │     Groq        │
     └─────────────────┘          └─────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
                  ┌──────────────────────┐
                  │   Doctor Dashboard   │
                  │  Queue + Case Review │
                  └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs

### Database

* Supabase
* PostgreSQL

### AI

* Groq API
* AI-assisted clinical question generation

### Deployment

* Vercel

---

## 📂 Project Structure

```text
MediKiosk/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── kiosk/
│   │   │   └── doctor/
│   │   │
│   │   ├── pages/
│   │   │   ├── KioskPage.tsx
│   │   │   └── DoctorDashboardPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── package.json
│
└── README.md
```

---

## 🔄 Application Workflow

### Step 1 — Language Selection

The patient selects their preferred language before beginning the registration process.

### Step 2 — Patient Identification

The patient enters basic information such as:

* Full name
* Age
* Gender
* Phone number
* ABHA ID
* Emergency contact

### Step 3 — Consent

The patient provides consent for AI-assisted clinical history collection.

### Step 4 — Patient Case Creation

A clinical case is created and assigned an OPD token.

### Step 5 — AI Clinical Interview

The AI asks structured questions based on the patient's chief complaint and previous responses.

### Step 6 — Doctor Review

The collected information becomes available in the doctor dashboard.

### Step 7 — Consultation

The doctor reviews the information and continues with the clinical consultation.

---

## 🔐 Privacy & Security

The application is designed with healthcare data privacy in mind.

Key considerations include:

* Patient consent before AI-assisted history collection
* Role-based doctor access
* Separate patient cases
* Controlled API access
* Structured clinical records
* Secure database storage through Supabase

> **Note:** This project is a prototype and should undergo appropriate security, privacy, clinical validation, and regulatory review before use with real patient data.

---

## ⚙️ Environment Variables

### Frontend

Create a `.env` file inside the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend

Configure the required environment variables for:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

Do **not** commit API keys or other secrets to GitHub.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MediKiosk
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 5. Start the backend

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

The backend will normally run on:

```text
http://localhost:5000
```

---

## 🩺 Main Modules

| Module                 | Purpose                         |
| ---------------------- | ------------------------------- |
| Patient Kiosk          | Patient registration and intake |
| Language Selection     | Select preferred language       |
| Patient Identification | Capture patient information     |
| Consent                | Record patient consent          |
| AI Interview           | Collect clinical history        |
| OPD Queue              | Manage patient cases            |
| Doctor Dashboard       | Review incoming cases           |
| Case Drawer            | Inspect patient information     |
| Triage                 | Prioritize clinical cases       |
| Clinical Pipeline      | Track intake progress           |

---

## 🎯 Project Goals

MediKiosk is designed to:

* Reduce repetitive administrative work
* Improve OPD workflow efficiency
* Collect structured patient history
* Give doctors information before consultation
* Reduce manual data entry
* Improve patient flow
* Support scalable digital healthcare workflows

---

## 🔮 Future Enhancements

Possible future improvements include:

* Multilingual AI voice interaction
* Speech-to-text patient responses
* Automatic clinical summarization
* Integration with hospital EMR/HMIS systems
* Doctor prescription module
* Appointment scheduling
* Advanced triage assistance
* Patient history timeline
* QR-based patient identification
* ABDM/ABHA integration
* Real-time doctor notifications
* Improved accessibility for elderly patients

---

## 📊 Project Status

**Status:** 🚧 Prototype / Development

The current version demonstrates the core patient intake, AI-assisted interview, case management, and doctor dashboard workflow.

---

## 👩‍💻 Project

**MediKiosk — AI-Assisted Clinical Intake & OPD Triage System**

**SIH 2026 Prototype — PS 26047**

---

## 🌐 Live Application

Visit the deployed application:

[MediKiosk Live Demo](https://medikiosk-mauve.vercel.app/?utm_source=chatgpt.com)

---

## 📄 License

This project is currently develop

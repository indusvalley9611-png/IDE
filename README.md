# 🏥 SwasthyaSetu — स्वास्थ्यसेतू
> Digital Health Bridge for Rural Maharashtra

## Problem Statement
Rural healthcare in India suffers from fragmented records, delayed referrals, and communication gaps between village health workers and district hospitals. When a pregnant woman in a remote village develops complications, the referral process through multiple tiers of healthcare can take hours, risking lives.

## Our Solution
SwasthyaSetu is an integrated, offline-first healthcare coordination platform that connects ASHA workers in remote villages to PHC doctors and District Hospital specialists through a single digital bridge.

## Key Features
- 🤖 AI-Powered Symptom Checker with triage recommendations
- 🏥 Smart Referral System with GIS-based facility routing
- 📊 Real-time Analytics Dashboard for district health monitoring
- 🔴 NEWS2-based Clinical Triage Engine (RED/YELLOW/GREEN priority)
- 🛏️ Live Bed Matrix tracking (ICU, Ventilator, Oxygen, General)
- 💊 Drug Stock Management with emergency transfer protocols
- 📱 Offline-First PWA — works without internet in remote areas
- 🆔 ABHA ID integration (India's digital health identity)
- 📹 Teleconsultation between PHC doctors and specialists
- 🚨 Emergency SOS with 108 Ambulance integration
- 🗺️ Maharashtra GIS Network Map with Leaflet
- 🔒 Role-Based Access Control with audit trail

## Supported Roles
| Role | Access Level | Key Functions |
|------|-------------|---------------|
| ASHA Worker | Field | Patient screening, maternal care, offline data entry |
| PHC Doctor | Facility | OPD consultation, prescriptions, referrals, teleconsult |
| Specialist | District Hospital | Referral review, admission, discharge, teleconsult |
| District Health Officer | District | Analytics, resource allocation, epidemic tracking |

## Tech Stack
- **Frontend:** Next.js 16.3.4 + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet.js
- **PDF Generation:** pdf-lib
- **QR Codes:** qrcode
- **Icons:** Lucide React
- **Storage:** IndexedDB + LocalStorage (Offline-first)
- **Deployment:** Vercel

## Architecture
```
Village (ASHA)  →  PHC (Doctor)  →  District Hospital (Specialist)
     ↑                    ↑                        ↑
     └──── Offline PWA ───┴──── Smart Referral ────┘
                              ↓
                    DHO Command Center
                    (Analytics + Alerts)
```

## Getting Started
```bash
git clone https://github.com/indusvalley9611-png/Swasthyasetu.git
cd Swasthyasetu
npm install
npm run dev
```
Open http://localhost:3000

## Demo Mode
Click 'Quick Demo' on the landing page to instantly log in as an ASHA worker and experience the full patient referral journey.

## Demo Credentials
The app uses OTP-based authentication. In demo mode, use OTP: `123456` for any role.

## Team
Built for IDE Bootcamp 2026

## License
MIT

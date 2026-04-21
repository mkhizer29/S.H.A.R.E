# SHARE - Secure Mental Health Support Platform

SHARE is a premium, privacy-first mental health platform designed for the Pakistani market. It enables users to connect with verified mental health professionals securely and pseudonymously.

## 🌟 Key Features

- **Privacy-First Design**: Users connect under pseudonyms (aliases), protecting their social identity.
- **End-to-End Encryption**: All text chats are encrypted locally before transmission.
- **Voice-First Sessions**: High-quality, secure voice calls without the pressure of video.
- **Local Language Support**: Seamlessly find professionals who speak Urdu, Punjabi, Sindhi, and other local languages.
- **Localized Payments**: Support for local bank transfers (HBL/IBAN) and standard credit/debit cards.
- **Crisis Monitor**: Real-time admin monitoring for high-risk keywords to ensure user safety.

## 🛠 Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend/Auth**: Firebase (Auth & Firestore) - *Demo mode includes mock fallback*
- **Encryption**: TweetNaCl (Local E2E)
- **Icons**: Lucide React

## 🚀 Portals

1. **Patient Portal**: Dashboard, Professional Directory, Encrypted Chat, Mood Tracking, and Booking Management.
2. **Professional Portal**: Patient Inbox, Appointment Calendar, Client Management, and Revenue Dashboard.
3. **Admin Terminal**: Specialist Verification, Analytics, Crisis Monitoring, and Platform Configuration.

## 📂 Project Structure

```bash
src/
├── components/        # Reusable UI components and layouts
├── data/              # Mock data for professionals and settings
├── hooks/             # Custom hooks (e.g., useRTC for voice sessions)
├── lib/               # Utility libraries (Firebase, Crypto, Stripe)
├── pages/             # Portal-specific page components
└── stores/            # Zustand stores (Auth, Chat, Booking, Mood)
```

## ⚠️ Demo Mode Notice

This application is currently in a high-fidelity **Demo Mode**. 
- Voice calls and Chat are simulated to showcase the end-to-end encrypted experience.
- Authentication falls back to demo accounts if Firebase keys are not provided.
- Payment processing is simulated through a secure checkout UI.

---
*Built with care for a safer, more supportive world.*

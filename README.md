<div align="center">
  <img src="client/assets/icon.png" alt="Antinode Logo" width="120" />
  <h1>Antinode</h1>
  <p><strong>Manage your Notes and documents in one place.</strong></p>
</div>

---

## 📖 Overview

**Antinode** is a modern, high-performance mobile application designed to centralize your note-taking and document management. Built with a focus on premium aesthetics and seamless user experience, Antinode ensures your most important files are always organized, accessible, and securely backed up to the cloud.

Whether you're managing personal notes, academic documents, or professional files, Antinode provides a clean, distraction-free environment to get things done.

## ✨ Key Features

- 🔐 **Secure Authentication:** Robust user registration and login system powered by JWT (JSON Web Tokens).
- 📂 **Smart File Management:** Create folders, upload documents, and organize your notes with an intuitive UI.
- ☁️ **Cloud-Powered:** Fully connected to a live AWS EC2 backend, ensuring your data is persistently saved and instantly retrieved.
- 🎨 **Premium Aesthetics:** Features a beautiful, minimalist design system, smooth micro-animations, and a custom native splash screen.
- 📱 **Cross-Platform Compatibility:** Built with React Native and Expo, offering a native feel on Android devices.

## 🛠️ Technology Stack

**Frontend (Mobile App)**
- [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/) for type safety
- React Navigation for seamless routing
- GSAP & React Native Animated for smooth micro-interactions

**Backend (Cloud Server)**
- Node.js & Express API
- Hosted on AWS EC2 (Windows Server instance)
- Nginx for robust reverse-proxy routing

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine
- Expo CLI
- Android Studio (for local Android builds)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rumman2004/Antinode.git
   cd Antinode
   ```

2. **Setup the Mobile App:**
   ```bash
   cd client
   npm install
   ```

3. **Run locally via Expo Go:**
   ```bash
   npx expo start
   ```

4. **Build Android APK locally:**
   ```bash
   npx expo prebuild --clean
   cd android
   ./gradlew assembleRelease
   ```

## 🤝 Motivation

Antinode was developed to solve the fragmentation of digital workspaces. The primary motive is to provide a unified, highly responsive platform where users don't have to jump between multiple apps to view a PDF, write a quick note, or organize project folders. By leveraging a custom AWS backend, Antinode guarantees privacy and total ownership of your data structure.

---
<div align="center">
  <p>Built with ❤️ by Rumman Ahmed.</p>
</div>

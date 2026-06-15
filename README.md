#  Social Connect App

A minimal social media mobile application built using **React Native**. Social Connect allows users to create profiles, share posts, interact with others through likes and comments, and receive real-time updates.

---

## Features

### Authentication

* User Sign Up & Login
* Forgot Password functionality
* Form validation using Formik & Yup
* Firebase Authentication integration

### User Profile

* Create and edit profile
* Add bio and profile picture
* View other users' profiles

### Home Feed

* Create text posts with optional images
* Scrollable post feed using FlatList
* Display timestamps

### Interactions

* Like and unlike posts
* Comment on posts (modal or separate screen)

###  Real-Time Features

* Live updates for likes and comments
* Firebase Realtime Database / Socket.io integration

###  Notifications

* Get notified when someone likes or comments on your post
* Firebase Cloud Messaging / Expo Notifications

### UI & Animations
* Smooth navigation using React Navigation
* Animations using Reanimated / Lottie
* Responsive design for multiple devices

##  Tech Stack

* **Frontend:** React Native
* **Navigation:** React Navigation (Stack & Tab)
* **State Management:** Redux Toolkit / Context API
* **Backend:** Firebase (Authentication, Firestore, Realtime DB)
* **Form Handling:** Formik + Yup
* **Media Upload:** react-native-image-picker
* **Notifications:** Firebase Cloud Messaging / Expo Notifications
* 
## Project Structure
```
SocialConnect/
│── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── redux/ or context/
│   ├── services/
│── assets/
│── App.js
│── package.json
```

##  Installation & Setup
1. Clone the repository:
```bash
git clone https://github.com/your-username/social-connect.git
cd social-connect
```
2. Install dependencies:
```bash
npm install
```
3. Run the app:
```bash
npx react-native run-android
```

## Environment Setup
* Configure Firebase project
* Add your Firebase config in the project
* Enable Authentication and Firestore/Realtime DB
 
##  Author
Developed as part of a **Mobile App Development Internship Task**.

## License
This project is for educational purposes.

﻿import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC3H7d94_dy5KQhDK-8KYqYDHiOb-sA3qQ",
    authDomain: "gyz-floorball-league.firebaseapp.com",
    projectId: "gyz-floorball-league",
    storageBucket: "gyz-floorball-league.appspot.com",
    messagingSenderId: "294187826654",
    appId: "1:294187826654:web:35428fa2ecf926f578f14f",
    measurementId: "G-26TE8X5W1X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
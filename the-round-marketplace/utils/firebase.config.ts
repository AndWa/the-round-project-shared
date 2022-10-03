import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {};

if (!getApps.length) {
  initializeApp(firebaseConfig);
}

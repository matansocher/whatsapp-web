// Import the functions you need from the SDKs you need
import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAozm8A5S1XMiEEgQIGRZV-JDakdGYfTB4",
  authDomain: "whatsapp-web-e8adc.firebaseapp.com",
  projectId: "whatsapp-web-e8adc",
  storageBucket: "whatsapp-web-e8adc.appspot.com",
  messagingSenderId: "888993938367",
  appId: "1:888993938367:web:f5ac492e32689897097f0a"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

const database = firebaseApp.firestore();
const auth = firebase.auth();

export { database, auth };

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import "firebase/storage";
import dotenv from "dotenv";
//import params from "../../config/firebase";

dotenv.config();
const params = {
    apiKey: "AIzaSyA3hAImaUfe30ISl0z5PMxjw9SloKT8KTE",
    authDomain: "superchat-f279e.firebaseapp.com",
    projectId: "superchat-f279e",
    storageBucket: "superchat-f279e.appspot.com",
    messagingSenderId: "21649455285",
    appId: "1:21649455285:web:d0d4e68770137cc77226fc",
    measurementId: "G-C439PF8EQF"
  };
firebase.initializeApp(params);

firebase.analytics();

export default firebase;

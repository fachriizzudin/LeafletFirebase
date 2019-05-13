
var admin = require("firebase-admin");

var serviceAccount = require("../firestore/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sig-kriminalitas.firebaseio.com"
});

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBmo1IBULQht8jVo3gTDaZv0YnSWo4JVSY",
    authDomain: "sig-kriminalitas.firebaseapp.com",
    databaseURL: "https://sig-kriminalitas.firebaseio.com",
    projectId: "sig-kriminalitas",
    storageBucket: "sig-kriminalitas.appspot.com",
    messagingSenderId: "1002325018706",
    appId: "1:1002325018706:web:94814bce23554a9e"
  };
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const db = firebase.firestore();
  

// getting data
db.collection('kriminalitas').get().then(snapshot => {
  snapshot.docs.forEach(doc => {
      console.log(doc);      
  });
});
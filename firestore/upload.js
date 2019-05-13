// Importing firebase-admin library
const admin = require('firebase-admin');

// Importing service account key information
const serviceAccount = require("./serviceAccountKey.json");

// Importing JSON data file
// const data = require("./data.json");
const data = require("./wilayah.json");

//name of the collection
// const collectionKey = "kriminalitas";
const collectionKey = "wilayah";

// Initialising admin sdk
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sig-kriminalitas.firebaseio.com"
  });

// Setting up Firestore property
const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

// Checking if any data exists in data file and if it is object type
if (data && (typeof data === "object")) {
    // Loop on data object
    Object.keys(data).forEach(docKey => {
        // Calling Firestore API to store each document
        // Setting collection name
        // Setting document name/key. Please do not provide document key if you want auto generated document key.
        firestore.collection(collectionKey).doc(docKey).set(data[docKey]).then((res) => {
            console.log("Document " + docKey + " successfully written!");
        }).catch((error) => {
            console.error("Error writing document: ", error);
        });
    });
}

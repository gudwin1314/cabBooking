import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "ApI key is here now removed because of security issues",
  authDomain: "cabbooking-b38bc.firebaseapp.com",
  projectId: "cabbooking-b38bc",
  storageBucket: "cabbooking-b38bc.appspot.com",
  messagingSenderId: "784385068364",
  appId: "1:784385068364:web:42335368349f6cd9b213e9"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth };

// api key here
// AIzaSyA7UqbLDhoMhfvKgJItISPu2MauxAOZTnw
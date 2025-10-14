// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, where, orderBy, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGDY_ij0EjS-RDSXF0RQCyoc6yYLXyPXE",
  authDomain: "oilgram.firebaseapp.com",
  projectId: "oilgram",
  storageBucket: "oilgram.firebasestorage.app",
  messagingSenderId: "555429946689",
  appId: "1:555429946689:web:a23a918ca6ceb3e8936dc0",
  measurementId: "G-BSEWJHYD29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_PASSWORD = "oilteam2025";

const reservedNumbers = [
  "6660000000","6661111111","6662222222","6663333333","6664444444","6665555555","6666666666","6667777777","6668888888","6669999999"
];

function normalizeNumber(n){ return String(n||"").replace(/\D/g,"").slice(0,10); }
function isValidCodeFormat(n){ return /^666\d{7}$/.test(normalizeNumber(n)); }

window.signup = async function(email, password, requestedCode){
  const cred = await createUserWithEmailAndPassword(auth,email,password);
  const uid = cred.user.uid;
  let finalCode = requestedCode && isValidCodeFormat(requestedCode) && !reservedNumbers.includes(requestedCode) ? requestedCode : "666" + Math.floor(Math.random()*9000000+1000000);
  await setDoc(doc(db,"users", uid), { email, createdAt: serverTimestamp(), code: finalCode });
  await setDoc(doc(db,"userCodes", finalCode), { uid, code: finalCode, createdAt: serverTimestamp() });
};
window.login = async function(email,password){ await signInWithEmailAndPassword(auth,email,password); };
window.logout = async function(){ await signOut(auth); };

let publicUnsub = null;
window.startPublicListener = function(renderFn){
  if(publicUnsub) publicUnsub();
  const q = query(collection(db,"publicMessages"), orderBy("createdAt","asc"));
  publicUnsub = onSnapshot(q, snap=>{
    const arr = snap.docs.map(d=>({ id:d.id,...d.data() }));
    if(renderFn) renderFn(arr);
  });
};
window.stopPublicListener = function(){ if(publicUnsub) publicUnsub

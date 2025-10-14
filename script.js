// script.js (module)
// Shared Firebase + App logic for index.html and oilgram.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot,
  query, where, serverTimestamp, orderBy, updateDoc, getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ---------- Firebase config (your project) ---------- */
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

/* ---------- Configuration & reserved numbers ---------- */
const ADMIN_PASSWORD = "oilteam2025";

// explicit reserved codes (from your list)
const reservedNumbers = [
  "6660000000","6661111111","6662222222","6663333333","6664444444","6665555555","6666666666","6667777777","6668888888","6669999999",
  "6660001111","6660002222","6660003333","6660004444","6660005555","6660006666","6660007777","6660008888","6660009999",
  "6661110000","6662220000","6663330000","6664440000","6665550000","6666660000","6667770000","6668880000","6669990000",
  "6661000000","6662000000","6663000000","6664000000","6665000000","6666000000","6667000000","6668000000","6669000000"
];

// helper utilities
function normalizeNumber(n){ return String(n||"").replace(/\D/g,"").slice(0,10); }
function isValidCodeFormat(n){ const s = normalizeNumber(n); return /^666\d{7}$/.test(s); }
// check if after 666 there is any sequence of >=3 identical digits
function hasTripleAfter666(n){
  const s = normalizeNumber(n);
  if(!/^666\d{7}$/.test(s)) return false;
  const tail = s.slice(3);
  return /(.)\1\1/.test(tail);
}

/* ---------- Expose helpers to pages (attach to window) ---------- */

// generate available random code (tries several random attempts then scans)
window.generateAvailableCode = async function(){
  // try random attempts
  for(let i=0;i<50;i++){
    const r = "666" + String(Math.floor(Math.random()*9000000)+1000000).padStart(7,"0");
    if(reservedNumbers.includes(r)) continue;
    // check uniqueness
    const q = query(collection(db,"userCodes"), where("code","==", r));
    const s = await getDocs(q);
    if(s.empty) return r;
  }
  // fallback linear scan - might be slow but last resort
  for(let i=0;i<10000000;i++){
    const r = "666" + String(i).padStart(7,"0");
    if(reservedNumbers.includes(r)) continue;
    const q = query(collection(db,"userCodes"), where("code","==", r));
    const s = await getDocs(q);
    if(s.empty) return r;
  }
  throw new Error("No available codes");
};

// Signup (email, password) and optional requested code
window.signup = async function(email, password, requestedCode){
  if(!email || !password || password.length < 6) throw new Error("Provide valid email and password (min 6).");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  // pick code
  let finalCode = null;
  if(requestedCode){
    const cleaned = normalizeNumber(requestedCode);
    if(cleaned.length===10 && cleaned.startsWith("666") && !reservedNumbers.includes(cleaned) && !hasTripleAfter666(cleaned)){
      // check uniqueness
      const snap = await getDoc(doc(db,"userCodes", cleaned));
      if(!snap.exists()) finalCode = cleaned;
    }
  }
  if(!finalCode) finalCode = await window.generateAvailableCode();
  // store user & mapping
  await setDoc(doc(db,"users", uid), { email, createdAt: serverTimestamp(), code: finalCode });
  await setDoc(doc(db,"userCodes", finalCode), { uid, code: finalCode, createdAt: serverTimestamp() });
  return { uid, code: finalCode };
};

// Login & logout wrappers
window.login = async function(email, password){
  await signInWithEmailAndPassword(auth, email, password);
};
window.logout = async function(){
  await signOut(auth);
};

/* ---------- Real-time listeners for public messages (used by UI) ---------- */
let publicUnsub = null;
window.startPublicListener = function(renderFn){
  if(publicUnsub) publicUnsub();
  const q = query(collection(db,"publicMessages"), orderBy("createdAt","asc"));
  publicUnsub = onSnapshot(q, snap=>{
    const arr = snap.docs.map(d=>({ id: d.id, ...d.data() }));
    if(typeof renderFn === "function") renderFn(arr);
  });
};
window.stopPublicListener = function(){ if(publicUnsub) publicUnsub(); publicUnsub = null; };

/* send public message */
window.sendPublicMessage = async function(text, currentUser){
  if(!currentUser) throw new Error("Not authenticated");
  if(!text || !text.trim()) return;
  await addDoc(collection(db,"publicMessages"), {
    uid: currentUser.uid,
    email: currentUser.email,
    code: currentUser.code || null,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
};

/* ---------- Private chat (P2P) ---------- */
// deterministic convo id from two uids
function convoId(u1,u2){ return [u1,u2].sort().join("_"); }

let privateUnsub = null;
window.openPrivateRoom = async function(myUid, otherUid, renderFn){
  if(privateUnsub) privateUnsub();
  const id = convoId(myUid, otherUid);
  const q = query(collection(db,"privateMessages"), where("convoId","==",id), orderBy("createdAt","asc"));
  privateUnsub = onSnapshot(q, snap=>{
    const arr = snap.docs.map(d=>({ id: d.id, ...d.data() }));
    if(typeof renderFn === "function") renderFn(arr);
  });
  return id;
};
window.closePrivateRoom = function(){ if(privateUnsub) privateUnsub(); privateUnsub = null; };

window.sendPrivateMessage = async function(convoIdStr, text, currentUser){
  if(!convoIdStr) throw new Error("Open a private convo first");
  if(!currentUser) throw new Error("Not authenticated");
  if(!text || !text.trim()) return;
  await addDoc(collection(db,"privateMessages"), {
    convoId: convoIdStr,
    uid: currentUser.uid,
    code: currentUser.code || null,
    email: currentUser.email,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
};

/* ---------- utility: find user by code ---------- */
window.findUserByCode = async function(code){
  const clean = normalizeNumber(code);
  if(clean.length !== 10) return null;
  const snap = await getDoc(doc(db,"userCodes", clean));
  if(!snap.exists()) return null;
  return snap.data(); // { uid, code, ... }
};

/* ---------- Admin client toggle (local) ---------- */
window._adminLogged = false;
window.adminLogin = function(pass){
  if(pass === ADMIN_PASSWORD){ window._adminLogged = true; return true; }
  return false;
};
window.adminLogout = function(){ window._adminLogged = false; };

/* ---------- lock code for auction (client demo) ---------- */
window.lockCodeForAuction = async function(code){
  const clean = normalizeNumber(code);
  if(clean.length !== 10) throw new Error("Invalid code");
  // save to auctions collection (demo)
  await setDoc(doc(db,"auctions", clean), { code: clean, lockedAt: serverTimestamp(), lockedByClientDemo: true });
  if(!reservedNumbers.includes(clean)) reservedNumbers.push(clean);
  return true;
};

/* ---------- Expose helpers for UI debug / lists ---------- */
window.getReservedNumbers = ()=>reservedNumbers;

/* ---------- Auth observer: attach user info to window.currentUserData ---------- */
onAuthStateChanged(auth, async (u) => {
  if(!u){ window.currentUser = null; window.currentUserData = null; window.currentUserCode = null; return; }
  window.currentUser = u;
  const ud = await getDoc(doc(db,"users", u.uid));
  if(ud.exists()) {
    window.currentUserData = ud.data();
    window.currentUserCode = ud.data().code || null;
  } else {
    // fallback assign code if missing (should rarely happen)
    const newCode = await window.generateAvailableCode();
    await setDoc(doc(db,"users", u.uid), { email: u.email, createdAt: serverTimestamp(), code: newCode });
    await setDoc(doc(db,"userCodes", newCode), { uid: u.uid, code: newCode, createdAt: serverTimestamp() });
    window.currentUserData = { email: u.email, code: newCode };
    window.currentUserCode = newCode;
  }
});

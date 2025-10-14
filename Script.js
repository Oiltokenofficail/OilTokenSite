// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, push, onChildAdded } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGDY_ij0EjS-RDSXF0RQCyoc6yYLXyPXE",
  authDomain: "oilgram.firebaseapp.com",
  databaseURL: "https://oilgram-default-rtdb.firebaseio.com",
  projectId: "oilgram",
  storageBucket: "oilgram.firebasestorage.app",
  messagingSenderId: "555429946689",
  appId: "1:555429946689:web:a23a918ca6ceb3e8936dc0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// =============== Helper Functions =================

// Check if number is valid and not locked
function isValidNumber(num) {
  if (!/^666\d{7}$/.test(num)) return false; // must start with 666 and be 10 digits
  if (/(\d)\1\1/.test(num.slice(3))) return false; // 3 repeated digits
  return true;
}

// =============== Auth & Registration =================
window.signUp = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const userNumber = document.getElementById("userNumber").value.trim();

  if (!isValidNumber(userNumber)) {
    alert("⚠️ Invalid or locked number. Try another one.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Save user data to database
    await set(ref(db, "users/" + userId), {
      email: email,
      number: userNumber,
      createdAt: new Date().toISOString()
    });

    alert("✅ Registration successful!");
  } catch (error) {
    alert("❌ " + error.message);
  }
};

window.signIn = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Welcome back!");
  } catch (error) {
    alert("❌ " + error.message);
  }
};

window.logOut = async function () {
  await signOut(auth);
  alert("👋 Logged out!");
};

// =============== Public Chat =================
const chatRef = ref(db, "publicChat");

window.sendMessage = async function () {
  const msg = document.getElementById("chatInput").value.trim();
  const user = auth.currentUser;

  if (!user || msg === "") return;

  await push(chatRef, {
    uid: user.uid,
    message: msg,
    time: new Date().toISOString()
  });

  document.getElementById("chatInput").value = "";
};

// Listen for new messages
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  const div = document.createElement("div");
  div.textContent = `${data.message}`;
  document.getElementById("chatBox").appendChild(div);
});

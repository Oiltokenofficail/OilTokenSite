// oilgram-main.js
// Main logic for Oilgram: Auth, Firestore chat (public/private), user codes, WebRTC signalling.
// Expects firebase SDKs already loaded and firebaseConfig to be available at window.__FIREBASE_CONFIG

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot,
  query, where, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

(async function initOilgram(){
  // --- firebaseConfig should be provided via window.__FIREBASE_CONFIG ---
  if(!window.__FIREBASE_CONFIG || Object.keys(window.__FIREBASE_CONFIG).length===0){
    console.error("Firebase config missing. Create private-config.js and set window.__FIREBASE_CONFIG.");
    document.getElementById('oilgramStatus').textContent = 'Firebase configuration missing. Upload private-config.js (see README).';
    return;
  }

  const app = initializeApp(window.__FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // constants
  const ADMIN_PASSWORD = "Oilcoin1378";
  const reservedSet = new Set([
    // explicit reserved ones you gave
    "6660000000","6661111111","6662222222","6663333333","6664444444","6665555555","6666666666",
    "6667777777","6668888888","6669999999",
    "6660001111","6660002222","6660003333","6660004444","6660005555","6660006666","6660007777","6660008888","6660009999",
    "6661110000","6662220000","6663330000","6664440000","6665550000","6666660000","6667770000","6668880000","6669990000",
    "6661000000","6662000000","6663000000","6664000000","6665000000","6666000000","6667000000","6668000000","6669000000"
  ]);

  // helpers
  const $ = id => document.getElementById(id);
  const normalize = s => String(s||"").replace(/\D/g,'').slice(0,10);
  const isValidCode = s => /^666\d{7}$/.test(normalize(s));
  const hasTriple = s => /(.)\1\1/.test(normalize(s).slice(3));
  const escapeHtml = s => String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // UI elements (must exist in oilgram.html)
  const statusEl = $('oilgramStatus');
  const profileBox = $('profileBox');
  const meEmail = $('meEmail');
  const meCode = $('meCode');
  const signUpBtn = $('btn-signup');
  const loginBtn = $('btn-login');
  const logoutBtn = $('btn-logout');
  const publicMessages = $('publicMessages');
  const publicSend = $('publicSend');
  const publicInput = $('publicInput');
  const chosenNumber = $('chosenNumber');
  const checkBtn = $('btn-check-number');
  const assignBtn = $('btn-assign-number');
  const numberFeedback = $('numberFeedback');
  const startPrivateBtn = $('startPrivate');
  const privateRecipientCode = $('privateRecipientCode');
  const privateWith = $('privateWith');
  const privateMessages = $('privateMessages');
  const privateSend = $('privateSend');
  const openPublic = $('openPublic');
  const openPrivate = $('openPrivate');
  const adminLoginBtn = $('adminLogin');
  const adminLogoutBtn = $('adminLogout');
  const adminPassInput = $('adminPass');
  const adminConsole = $('adminConsole');
  const adminLock = $('adminLock');
  const adminLockCode = $('adminLockCode');
  const reservedListEl = $('reservedList');
  statusEl.textContent = 'Initializing...';

  // Render reserved list
  function renderReserved(){
    reservedListEl.innerHTML = '';
    Array.from(reservedSet).slice(0,200).forEach(code=>{
      const d = document.createElement('div'); d.className='small'; d.textContent = code;
      reservedListEl.appendChild(d);
    });
  }
  renderReserved();

  // ---------- Auth flows ----------
  signUpBtn.addEventListener('click', async ()=>{
    const email = $('su-email').value.trim();
    const pass = $('su-pass').value;
    const chosen = normalize($('su-code').value);
    if(!email || pass.length < 6){ alert('Enter email and password (>=6 chars)'); return; }
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      // choose code: if user provided & valid & not reserved & not taken => use it; otherwise generate
      let final = null;
      if(chosen && isValidCode(chosen) && !reservedSet.has(chosen) && !hasTriple(chosen)){
        const docSnap = await getDoc(doc(db,'userCodes',chosen));
        if(!docSnap.exists()) final = chosen;
      }
      if(!final){
        final = await generateAvailableCode(db, reservedSet);
      }
      await setDoc(doc(db,'users',uid), { email, code: final, createdAt: serverTimestamp() });
      await setDoc(doc(db,'userCodes',final), { uid, code: final, createdAt: serverTimestamp() });
      alert('Account created — your code: ' + final);
    }catch(e){
      alert('Sign up error: ' + (e.message||e));
      console.error(e);
    }
  });

  loginBtn.addEventListener('click', async ()=>{
    const email = $('li-email').value.trim();
    const pass = $('li-pass').value;
    if(!email || !pass){ alert('Enter email & pass'); return; }
    try{
      await signInWithEmailAndPassword(auth, email, pass);
    }catch(e){ alert('Login error: ' + (e.message||e)); console.error(e); }
  });

  logoutBtn.addEventListener('click', ()=> signOut(auth));

  onAuthStateChanged(auth, async user=>{
    if(user){
      profileBox.classList.remove('hidden');
      const ud = await getDoc(doc(db,'users', user.uid));
      const data = ud.exists()?ud.data():{};
      meEmail.textContent = user.email;
      meCode.textContent = data.code ? ('Code: ' + data.code) : 'Code: not assigned';
      statusEl.textContent = 'Signed in';
      startPublicListener();
    } else {
      profileBox.classList.add('hidden');
      statusEl.textContent = 'Signed out';
      stopPublicListener();
      privateMessages.innerHTML = '';
      publicMessages.innerHTML = '';
    }
  });

  // ---------- Number assignment helpers ----------
  async function generateAvailableCode(db, reservedSet){
    for(let i=0;i<50;i++){
      const r = "666" + String(Math.floor(Math.random()*9000000)+1000000).padStart(7,'0');
      if(reservedSet.has(r)) continue;
      const snap = await getDoc(doc(db,'userCodes',r));
      if(!snap.exists()) return r;
    }
    // fallback linear scan (short range)
    for(let i=0;i<100000;i++){
      const r = "666" + String(i).padStart(7,'0');
      if(reservedSet.has(r)) continue;
      const snap = await getDoc(doc(db,'userCodes',r));
      if(!snap.exists()) return r;
    }
    throw new Error("No codes available");
  }

  checkBtn.addEventListener('click', async ()=>{
    const raw = normalize(chosenNumber.value);
    if(!isValidCode(raw)){ numberFeedback.textContent = 'Format invalid'; numberFeedback.style.color='red'; return; }
    if(reservedSet.has(raw) || hasTriple(raw)){ numberFeedback.textContent='Reserved for auction'; numberFeedback.style.color='red'; return; }
    const snap = await getDoc(doc(db,'userCodes',raw));
    if(snap.exists()){ numberFeedback.textContent='Taken'; numberFeedback.style.color='red'; return; }
    numberFeedback.textContent = 'Available ✅'; numberFeedback.style.color='green';
  });

  assignBtn.addEventListener('click', async ()=>{
    const user = auth.currentUser;
    if(!user){ alert('Login first'); return; }
    const raw = normalize(chosenNumber.value);
    if(!isValidCode(raw)){ numberFeedback.textContent='Format invalid'; numberFeedback.style.color='red'; return; }
    if(reservedSet.has(raw) || hasTriple(raw)){ numberFeedback.textContent='Reserved for auction'; numberFeedback.style.color='red'; return; }
    const taken = await getDoc(doc(db,'userCodes',raw));
    if(taken.exists()){ numberFeedback.textContent='Taken'; numberFeedback.style.color='red'; return; }
    await setDoc(doc(db,'userCodes',raw), { uid: user.uid, code: raw, createdAt: serverTimestamp() });
    await setDoc(doc(db,'users',user.uid), { email: user.email, code: raw, assignedAt: serverTimestamp() }, { merge: true });
    numberFeedback.textContent = 'Assigned ✅'; numberFeedback.style.color='green';
    meCode.textContent = 'Code: ' + raw;
  });

  // ---------- Public chat ----------
  let publicUnsub = null;
  function startPublicListener(){
    const col = collection(db,'publicMessages');
    if(publicUnsub) publicUnsub();
    const q = query(col, orderBy('createdAt','desc'));
    publicUnsub = onSnapshot(q, snap=>{
      publicMessages.innerHTML = '';
      snap.docs.slice().reverse().forEach(docSnap=>{
        const v = docSnap.data();
        const div = document.createElement('div'); div.className='msg';
        div.innerHTML = `<div class="small">${escapeHtml(v.code||v.email||'')}</div><div>${escapeHtml(v.text)}</div>`;
        publicMessages.appendChild(div);
      });
      publicMessages.scrollTop = publicMessages.scrollHeight;
    });
  }
  function stopPublicListener(){ if(publicUnsub) publicUnsub(); publicMessages.innerHTML=''; }

  publicSend.addEventListener('click', async ()=>{
    const txt = publicInput.value.trim(); if(!txt) return;
    if(!auth.currentUser){ alert('Login to send'); return; }
    const ud = await getDoc(doc(db,'users', auth.currentUser.uid));
    await addDoc(collection(db,'publicMessages'), { uid: auth.currentUser.uid, email: auth.currentUser.email, code: ud.data()?.code||null, text: txt, createdAt: serverTimestamp() });
    publicInput.value = '';
  });

  openPublic.addEventListener('click', ()=> $('publicSection').classList.toggle('hidden'));

  // ---------- Private chat ----------
  let currentConvo = null;
  let privateUnsub = null;

  startPrivateBtn.addEventListener('click', async ()=>{
    const code = normalize(privateRecipientCode.value);
    if(!isValidCode(code)){ alert('Enter valid code'); return; }
    const targetSnap = await getDoc(doc(db,'userCodes', code));
    if(!targetSnap.exists()){ alert('User not found'); return; }
    const target = targetSnap.data();
    if(target.uid === auth.currentUser.uid){ alert('Cannot chat with yourself'); return; }
    const convoId = [auth.currentUser.uid, target.uid].sort().join('_');
    currentConvo = convoId;
    $('privateArea').classList.remove('hidden');
    privateWith.textContent = code;
    if(privateUnsub) privateUnsub();
    const q = query(collection(db,'privateMessages'), where('convoId','==', convoId), orderBy('createdAt','desc'));
    privateUnsub = onSnapshot(q, snap=>{
      privateMessages.innerHTML = '';
      snap.docs.slice().reverse().forEach(d=>{
        const v = d.data();
        const div = document.createElement('div'); div.className='msg';
        div.innerHTML = `<div class="small">${escapeHtml(v.code||v.email||'')}</div><div>${escapeHtml(v.text)}</div>`;
        privateMessages.appendChild(div);
      });
      privateMessages.scrollTop = privateMessages.scrollHeight;
    });
  });

  privateSend.addEventListener('click', async ()=>{
    const txt = $('privateInput').value.trim(); if(!txt) return;
    if(!currentConvo){ alert('Open private chat first'); return; }
    const ud = await getDoc(doc(db,'users', auth.currentUser.uid));
    await addDoc(collection(db,'privateMessages'), { convoId: currentConvo, uid: auth.currentUser.uid, email: auth.currentUser.email, code: ud.data()?.code||null, text: txt, createdAt: serverTimestamp() });
    $('privateInput').value = '';
  });

  openPrivate.addEventListener('click', ()=> $('privateSection').classList.toggle('hidden'));

  // ---------- Admin local toggle ----------
  window._adminLogged = false;
  adminLoginBtn.addEventListener('click', ()=>{
    const p = adminPassInput.value;
    if(p === ADMIN_PASSWORD){ window._adminLogged = true; adminConsole.classList.remove('hidden'); statusEl.textContent = 'Admin enabled (client)'; }
    else alert('Wrong admin password');
  });
  adminLogoutBtn.addEventListener('click', ()=>{ window._adminLogged = false; adminConsole.classList.add('hidden'); statusEl.textContent = ''; });

  adminLock.addEventListener('click', async ()=>{
    const code = normalize(adminLockCode.value);
    if(!isValidCode(code)) return alert('Enter valid code');
    reservedSet.add(code);
    await setDoc(doc(db,'auctions', code), { code, locked: true, createdAt: serverTimestamp() });
    renderReserved();
    alert('Locked for auction (client record)');
  });

  // ---------- WebRTC (signalling) ----------
  // Simple 1:1 calls using Firestore: 'calls' collection; this code requires HTTPS and camera/mic permission.
  let pc=null, localStream=null, remoteStream=null, callDoc=null;
  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  async function startLocalMedia(){
    if(localStream) return;
    try{
      localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      const localVideo = $('localVideo'); localVideo.srcObject = localStream;
    }catch(e){ alert('Cannot access camera/mic: ' + e.message); throw e; }
  }

  function setupPc(pc){
    remoteStream = new MediaStream(); $('remoteVideo').srcObject = remoteStream;
    pc.ontrack = event => event.streams[0].getTracks().forEach(t=>remoteStream.addTrack(t));
    pc.onconnectionstatechange = ()=> console.log('pc state', pc.connectionState);
  }

  $('btn-create-call').addEventListener('click', async ()=>{
    try{
      await startLocalMedia();
      pc = new RTCPeerConnection(servers);
      setupPc(pc);
      localStream.getTracks().forEach(track=>pc.addTrack(track, localStream));
      // create call doc
      callDoc = doc(collection(db,'calls'));
      const offerCandidates = collection(callDoc,'offerCandidates');
      const answerCandidates = collection(callDoc,'answerCandidates');

      pc.onicecandidate = e => { if(e.candidate) addDoc(offerCandidates, e.candidate.toJSON()); };

      const offerDesc = await pc.createOffer();
      await pc.setLocalDescription(offerDesc);
      await setDoc(callDoc, { offer: { type: offerDesc.type, sdp: offerDesc.sdp }, createdAt: serverTimestamp() });

      // listen for answer
      onSnapshot(callDoc, snap=>{
        const data = snap.data();
        if(data && data.answer && !pc.currentRemoteDescription){
          pc.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(console.error);
        }
      });

      // listen for answer candidates
      onSnapshot(collection(callDoc,'answerCandidates'), snap=>{
        snap.docChanges().forEach(ch=>{
          if(ch.type==='added'){ pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(console.error); }
        });
      });

      $('callArea').classList.remove('hidden');
      $('callIdInput').value = callDoc.id;
      alert('Call created. Share ID: ' + callDoc.id);
    }catch(e){ console.error(e); }
  });

  $('btn-join-call').addEventListener('click', async ()=>{
    const id = prompt('Enter call ID to join'); if(!id) return;
    try{
      await startLocalMedia();
      pc = new RTCPeerConnection(servers);
      setupPc(pc);
      localStream.getTracks().forEach(track=>pc.addTrack(track, localStream));
      callDoc = doc(db,'calls', id);
      const callSnap = await getDoc(callDoc);
      if(!callSnap.exists()){ alert('Call not found'); return; }
      const data = callSnap.data();
      // listen to offerCandidates
      onSnapshot(collection(callDoc,'offerCandidates'), snap=>{
        snap.docChanges().forEach(ch=>{ if(ch.type==='added') pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(console.error); });
      });
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answerDesc = await pc.createAnswer();
      await pc.setLocalDescription(answerDesc);
      await updateDoc(callDoc, { answer: { type: answerDesc.type, sdp: answerDesc.sdp } });
      pc.onicecandidate = e => { if(e.candidate) addDoc(collection(callDoc,'answerCandidates'), e.candidate.toJSON()); };
      $('callArea').classList.remove('hidden');
      $('callIdInput').value = id;
      alert('Joined call');
    }catch(e){ console.error(e); alert('Join error: ' + e.message); }
  });

  $('btnHangup').addEventListener('click', async ()=>{
    if(pc){ pc.close(); pc=null; }
    if(localStream){ localStream.getTracks().forEach(t=>t.stop()); localStream=null; }
    $('callArea').classList.add('hidden');
    // note: not deleting call doc here; server-side cleanup recommended
  });

  // small alias for addDoc to avoid name conflict with local fn
  async function addDoc(colRef, data){ return await addDoc(colRef, data); }

  // done
  statusEl.textContent = 'Ready';
})();

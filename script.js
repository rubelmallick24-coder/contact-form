// scripts/script.js (module) - Frontend Stage 1
// - Dark/light theme toggle saved to localStorage
// - Floating labels (placeholder trick)
// - Confetti on success
// - spinner on submit
// - Collects small browser info (userAgent, screen) to include with saved doc
// IMPORTANT: Replace firebaseConfig with your project's config.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

/* ---------- Firebase config (replace) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBlP8bfxpzl16R_VuRG939NvEaUNJFe5n0",
  authDomain: "contact-form-1caa4.firebaseapp.com",
  projectId: "contact-form-1caa4",
  storageBucket: "contact-form-1caa4.firebasestorage.app",
  messagingSenderId: "249270327381",
  appId: "1:249270327381:web:12e8d7ff5e9c4582611cdc"
};
/* ------------------------------------------------ */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const submissionsCol = collection(db, "contact_submissions");

/* DOM */
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const btnSpinner = document.getElementById("btnSpinner");
const statusEl = document.getElementById("formStatus");
const successBox = document.getElementById("successBox");
const sendAnother = document.getElementById("sendAnother");
const yearSpan = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");

/* init */
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
initTheme();
enhanceFloatingLabels();

/* helper: set status */
function setStatus(text, isError = false){
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#ff9b9b" : "";
}

/* form submit */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");
  setLoading(true);

  const data = {
    name: form.name.value.trim(),
    mobile: form.mobile.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    subscribe: !!form.subscribe.checked,
    // small analytics: UTM + source
    utm: getUTMParams(),
    sourcePath: location.pathname,
    userAgent: navigator.userAgent || "unknown",
    screen: `${screen.width}x${screen.height}`
  };

  if (!data.name || !data.email || !data.message) {
    setStatus("Please fill required fields.", true);
    setLoading(false);
    return;
  }

  try {
    // save to Firestore (client)
    await addDoc(submissionsCol, {
      ...data,
      createdAt: serverTimestamp()
    });

    // request server to send admin email + auto-reply (server side handles auto-reply in later stage)
    const resp = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        message: data.message,
        subscribe: data.subscribe,
        utm: data.utm,
        sourcePath: data.sourcePath
      })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(()=>"Server error");
      console.error("email send failed:", errText);
      // still show success (we saved to Firestore), but inform admin send failed:
      setStatus("Saved but failed to send admin email. We'll retry.", true);
    } else {
      setStatus("");
    }

    form.reset();
    floatLabelUpdateAll(); // reset labels
    showSuccessAndConfetti();
  } catch (err) {
    console.error(err);
    setStatus("Error sending message. Try again later.", true);
  } finally {
    setLoading(false);
  }
});

/* loading state */
function setLoading(isLoading){
  if (isLoading){
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
}

/* success UI + confetti */
function showSuccessAndConfetti(){
  document.getElementById("contactForm").classList.add("hidden");
  successBox.classList.remove("hidden");
  successBox.setAttribute("aria-hidden", "false");
  // slide in
  successBox.animate([{ transform: "translateY(10px)", opacity:0 }, { transform:"translateY(0)", opacity:1 }], { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" });

  // confetti burst using canvas-confetti (cdn)
  try {
    if (window.confetti) {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.4 }
      });
      confetti({
        particleCount: 30,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  } catch (err){
    // ignore confetti errors
    console.warn("confetti error", err);
  }
}

sendAnother?.addEventListener("click", () => {
  successBox.classList.add("hidden");
  successBox.setAttribute("aria-hidden", "true");
  document.getElementById("contactForm").classList.remove("hidden");
  document.getElementById("name").focus();
});

/* ---------- THEME TOGGLE ---------- */
function initTheme(){
  const saved = localStorage.getItem("rbl_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "dark"); // default to dark for trading vibe
  applyTheme(theme);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("rbl_theme", next);
  });
}
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  // toggle icon color; (optional)
  themeToggle.classList.toggle("is-light", t === "light");
}

/* ---------- FLOATING LABELS ENHANCEMENTS ---------- */
/* We use placeholder=" " in HTML so :placeholder-shown works.
   But after programmatic reset, need to update label positions */
function enhanceFloatingLabels(){
  const inputs = Array.from(document.querySelectorAll(".field input, .field textarea"));
  inputs.forEach(inp => {
    // on input change update label
    inp.addEventListener("input", floatLabelUpdate);
    // on blur also update (handles autofill)
    inp.addEventListener("blur", floatLabelUpdate);
  });
  // initial
  setTimeout(floatLabelUpdateAll, 30);
}
function floatLabelUpdate(e){
  const el = e.target;
  const hasValue = String(el.value).trim().length > 0;
  if (hasValue) {
    el.classList.add("has-value");
  } else {
    el.classList.remove("has-value");
  }
}
function floatLabelUpdateAll(){
  const inputs = Array.from(document.querySelectorAll(".field input, .field textarea"));
  inputs.forEach(i => {
    if (String(i.value).trim().length > 0) i.classList.add("has-value");
    else i.classList.remove("has-value");
  });
}

/* ---------- UTM PARSER ---------- */
function getUTMParams(){
  try {
    const url = new URL(location.href);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    const out = {};
    keys.forEach(k => {
      const v = url.searchParams.get(k);
      if (v) out[k] = v;
    });
    return Object.keys(out).length ? out : null;
  } catch(e){
    return null;
  }
}

/* ------------- small safety: beforeunload prompt if user typed something ------------- */
let formTouched = false;
form.addEventListener("input", () => { formTouched = true });
window.addEventListener("beforeunload", (e) => {
  if (formTouched && !document.querySelector(".hidden")) {
    e.preventDefault();
    e.returnValue = "";
  }
});

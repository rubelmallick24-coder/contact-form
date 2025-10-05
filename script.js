// Dark / Light theme toggle
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Form handler (just demo — replace with Firebase/Email API later)
const form = document.getElementById("contactForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.innerText = "Sending...";
  setTimeout(() => {
    btn.innerText = "Submit";
    alert("✅ Message sent successfully!");
    form.reset();
  }, 1200);
});

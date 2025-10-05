// Theme toggle with localStorage
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
});

// Contact form demo success
const form = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Add loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
    form.reset();
    successMessage.style.display = "block";

    // Hide after 3s
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 59000);
  }, 1500);
});



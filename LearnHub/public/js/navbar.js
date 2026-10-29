// mobile menu toggle
const menuIcon = document.getElementById("menuIcon");
const navbar = document.getElementById("navbar");

if (menuIcon && navbar) {
  menuIcon.addEventListener("click", () => {
    navbar.classList.toggle("show");
    menuIcon.textContent = navbar.classList.contains("show") ? "✖" : "☰";
  });
}

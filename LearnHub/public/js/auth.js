// login / register: show the small hint under a field when it is wrong,
// and only let the form go to the server when everything is fine
const form = document.getElementById("loginForm") || document.getElementById("registerForm");

function show(input, bad) {
  input.nextElementSibling.style.display = bad ? "block" : "none";
  return !bad;
}

form.addEventListener("submit", function (e) {
  let valid = true;
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  if (name) valid = show(name, name.value.trim() === "") && valid;
  valid = show(email, !email.value.includes("@")) && valid;
  valid = show(password, password.value.length < 6) && valid;
  if (confirmPassword) {
    valid = show(confirmPassword, confirmPassword.value !== password.value || confirmPassword.value === "") && valid;
  }

  if (!valid) e.preventDefault();
});

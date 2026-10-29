// flash messages: close button + disappear after 6 seconds
document.querySelectorAll(".flash").forEach((flash) => {
  const close = () => flash.remove();
  flash.querySelector("button").addEventListener("click", close);
  setTimeout(close, 6000);
});

// "Are you sure?" on every delete form
document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    if (!confirm(form.dataset.confirm)) {
      e.preventDefault();
    }
  });
});

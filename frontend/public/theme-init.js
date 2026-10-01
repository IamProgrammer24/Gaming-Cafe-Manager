// Sets the saved theme before the page paints. It is a separate file because the
// server's security rules do not allow inline scripts.
try {
  document.documentElement.dataset.theme =
    localStorage.getItem("theme") || "dark";
} catch (e) {
  document.documentElement.dataset.theme = "dark";
}

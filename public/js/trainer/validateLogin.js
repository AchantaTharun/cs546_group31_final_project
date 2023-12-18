document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorContainer = document.getElementById("errorContainer");

    errorContainer.hidden = true;
    errorContainer.innerHTML = "";

    if (!validateEmail(emailInput.value)) {
      displayError("Please enter a valid email address.");
      return;
    }

    if (passwordInput.value.trim() === "") {
      displayError("Please enter your password.");
      return;
    }

    loginForm.submit();
  });
});

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function displayError(message) {
  const errorContainer = document.getElementById("errorContainer");
  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorContainer.appendChild(errorMessage);
  errorContainer.hidden = false;
}

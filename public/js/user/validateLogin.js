document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("user-login");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const errors = [];

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (document.querySelector(".error-message")) {
      document.querySelector(".error-message").remove();
    }
    if (!email || !password) {
      errors.push("Please fill out all fields");
    }
    if (email.search(/@/) < 0) {
      errors.push("Email must contain an @");
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (password.search(/[a-z]/i) < 0) {
      errors.push("Password must contain at least one letter");
    }
    if (password.search(/[0-9]/) < 0) {
      errors.push("Password must contain at least one digit");
    }
    if (!document.getElementById("getCoord")) {
      errors.push(
        "you have disabled client side js scripts,you won't be able to submit this form without enabling it"
      );
    }

    if (errors.length > 0) {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("danger");
      errorDiv.classList.add("error-message");
      errorDiv.innerHTML = "";
      errors.forEach((error) => {
        const errorP = document.createElement("p");
        errorP.innerText = error;
        errorDiv.appendChild(errorP);
      });
      form.prepend(errorDiv);
      return;
    }
    const btn = document.getElementById("loading");
    btn.toggleAttribute("hidden");
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.toggleAttribute("hidden");

    setLocation()
      .then((location) => {
        form.submit();
      })
      .catch((error) => {
        btn.toggleAttribute("hidden");
        submitBtn.toggleAttribute("hidden");

        alert("Error getting location, try again ");
        //console.log(error);
      });
  });
});

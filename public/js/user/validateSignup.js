document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("user-signup");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const errors = [];

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const userName = document.getElementById("userName").value;
    const favoriteWorkout = document.getElementById("favoriteWorkout").value;
    if (document.querySelector(".error-message")) {
      document.querySelector(".error-message").remove();
    }
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !passwordConfirm ||
      !userName ||
      !favoriteWorkout
    ) {
      errors.push("Please fill out all fields");
    }
    if (email.search(/@/) < 0) {
      errors.push("Email must contain an @");
    }
    if (firstName.length < 2) {
      errors.push("First name must be at least 2 characters");
    }
    if (lastName.length < 2) {
      errors.push("Last name must be at least 2 characters");
    }
    if (firstName.search(/[0-9]/) >= 0) {
      errors.push("First name cannot contain numbers");
    }
    if (lastName.search(/[0-9]/) >= 0) {
      errors.push("Last name cannot contain numbers");
    }
    if (firstName.length > 20) {
      errors.push("First name must be less than 20 characters");
    }
    if (lastName.length > 20) {
      errors.push("Last name must be less than 20 characters");
    }
    if (userName.length < 2) {
      errors.push("User name must be at least 2 characters");
    }
    if (userName.length > 20) {
      errors.push("User name must be less than 20 characters");
    }
    if (userName.search(/[0-9]/) < 0) {
      errors.push("User name must contain at least one number");
    }
    if (userName.search(/[a-z]/i) < 0) {
      errors.push("User name must contain at least one letter");
    }
    if (
      favoriteWorkout !== "cardio" &&
      favoriteWorkout !== "strength" &&
      favoriteWorkout !== "flexibility" &&
      favoriteWorkout !== "sport" &&
      favoriteWorkout !== "crossFit" &&
      favoriteWorkout !== "bodyWeight"
    ) {
      errors.push("Please select a valid workout type");
    }
    if (password !== passwordConfirm) {
      errors.push("Passwords do not match");
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
    if (!document.getElementById("validateSignUp")) {
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

    getLocation()
      .then((location) => {
        const hiddenLat = document.createElement("input");
        hiddenLat.setAttribute("type", "hidden");
        hiddenLat.setAttribute("name", "latitude");
        hiddenLat.setAttribute("value", location.lat);
        form.appendChild(hiddenLat);

        const hiddenLng = document.createElement("input");
        hiddenLng.setAttribute("type", "hidden");
        hiddenLng.setAttribute("name", "longitude");
        hiddenLng.setAttribute("value", location.lng);
        form.appendChild(hiddenLng);
        form.submit();
      })
      .catch((error) => {
        btn.toggleAttribute("hidden");
        submitBtn.toggleAttribute("hidden");
        alert("Error getting location,cannot submit form");
      });
  });
});

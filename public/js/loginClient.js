async function handleLogin(email, password, userType) {
  try {
    email = email.trim();
    let errors = [];
    if (!isValidEmail(email)) {
      errors.push('Invalid email format');
    }
    if (!password || password.trim() === '') {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      const errorContainer = document.getElementById('errorContainer');
      errorContainer.innerHTML = `
          <div class='error-message'>
            <p>Please fix the following errors:</p>
            <ul>
              ${errors.map((error) => `<li>${error}</li>`).join('')}
            </ul>
          </div>
        `;
      return;
    }

    const apiUrl = `/${userType}/login`;
    const credentials = {
      email: email,
      password: password,
    };

    const response = await apiRequest('post', apiUrl, credentials);
    //sessionStorage.setItem('jwt', response.token);
    window.location.href = `/${userType}/dashboard`;
  } catch (error) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `<div class='error-message'><p>${error}</p></div>`;
  }
}

document.getElementById('loginButton').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const userType = document.getElementById('userType').value;

  handleLogin(email, password, userType);
});

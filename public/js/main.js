function submitAccountLoginForm() {
  const userType = document.getElementById('userType').value;
  const form = document.getElementById('loginForm');
  form.action = `/login`;
  form.submit();
}

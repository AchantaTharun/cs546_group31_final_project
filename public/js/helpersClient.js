async function apiRequest(method, path, data = null, headers = {}) {
  try {
    const response = await axios({
      method,
      url: `/api/v1${path}`,
      data,
      headers,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidTrainerPassword(password) {
  const passwordRegex =
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$";
  return passwordRegex.test(password);
}

function isValidZip(zip) {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zip);
}

function isValidPhone(phone) {
  const phoneRegex =
    /^\+?\d{1,4}[-.\s]?\(?\d{1,}\)?[-.\s]?\d{1,}[-.\s]?\d{1,}[-.\s]?\d{1,}$/;
  return phoneRegex.test(phone);
}

function closeAlert() {
  document.getElementByID("errrDiivv").style.display = "none";
}

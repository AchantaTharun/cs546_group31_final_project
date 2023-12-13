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

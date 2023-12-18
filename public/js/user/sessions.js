let registerbtns = document.querySelectorAll(".register-btn");
if (registerbtns) {
  registerbtns.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const sessionId = e.target.dataset.sessionid;
      console.log(sessionId);
      try {
        const response = await apiRequest(
          "POST",
          `/session/${sessionId}/register`
        );
        window.location.reload();
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
}

let unregisterbtns = document.querySelectorAll(".remove-btn");

if (unregisterbtns) {
  unregisterbtns.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const sessionId = e.target.dataset.sessionid;
      console.log(sessionId);
      try {
        const response = await apiRequest(
          "POST",
          `/session/${sessionId}/unregister`
        );
        console.log(response);
        window.location.reload();
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
}

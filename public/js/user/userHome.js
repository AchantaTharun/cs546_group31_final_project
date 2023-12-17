const followButtons = document.querySelectorAll(".follow-btn");

followButtons.forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = e.target.dataset.userid;
    const userType = e.target.dataset.type;
    console.log(userId);
    try {
      const response = await fetch(`/user/follow/${userId}/${userType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.id) {
        const message = document.createElement("span");
        message.textContent = "Following";
        message.classList.add("following-message");

        button.parentNode.replaceChild(message, button);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

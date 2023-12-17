function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      reject("Geolocation is not supported");
    }
  });
}

async function setLocation() {
  try {
    const location = await getLocation();
    localStorage.setItem("lat", location.lat);
    localStorage.setItem("lng", location.lng);
  } catch (error) {
    //console.log(error);
  }
}

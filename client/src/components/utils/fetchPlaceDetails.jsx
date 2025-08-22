






const fetchPlacesValue = (input, mapRef, callback) => {
  const service = new window.google.maps.places.PlacesService(mapRef.current);

  if (typeof input === "string") {
    // Agar name ya placeId he
    service.findPlaceFromQuery(
      { query: input, fields: ["name", "geometry", "formatted_address", "rating", "user_ratings_total", "photos", "place_id"] },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
          callback({
            name: results[0].name,
            address: results[0].formatted_address,
            rating: results[0].rating,
            totalRatings: results[0].user_ratings_total,
            photos: results[0].photos,
            location: results[0].geometry.location,
          });
        } else {
          callback(null);
        }
      }
    );
  } else if (input.lat && input.lng) {
    // Agar lat/lng aya he
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(input.lat), lng: parseFloat(input.lng) };

 geocoder.geocode({ location: latlng }, (results, status) => {
  if (status === "OK") {
    if (results[0]) {
      console.log("Location found:", results[0].formatted_address);
    } else {
      console.log("No results found");
    }
  } else {
    console.log("Geocoder failed due to:", status);
  }
});
  }
}

export default fetchPlacesValue
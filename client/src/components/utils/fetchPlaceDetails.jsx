// utils/fetchPlacesValue.js
const fetchPlacesValue = async (input, mapRef, callback, isCustom = false) => {
  // ======================
  // Case 1: Custom Location (DB wali)
  // ======================
  const API_URL = import.meta.env.VITE_APP_URL;
if (isCustom) {
    try {
      // Custom backend request
      const res = await fetch(`${API_URL}/api/locations`);
      const data = await res.json();

      console.log("Custom API Response:", data);

      if (data && data.data && data.data.length > 0) {
        // Example: pick first matching location, ya map/filter laga ke choose karo
        const place = data.data.find(p =>
          p.name.toLowerCase().includes(input.toLowerCase())
        );

        if (!place) {
          console.log("No matching custom location found");
          callback(null);
          return;
        }

        // Extract images properly
        const photos = place.place_images
          ? place.place_images.map(img => `${img.image_url}`)
          : [];

        // console.log("Custom place photos:", photos);

        callback({
          name: place.name,
          address: place.address,
          rating: place.rating || null,
          totalRatings: place.totalRatings || null,
          photos: photos,
          location: {
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
          },
        });
      } else {
        console.log("No location data received from backend");
        callback(null);
      }
    } catch (err) {
      console.error("Custom location fetch error:", err);
      callback(null);
    }
    return;
  }


  // ======================
  // Case 2: Google Place Query se
  // ======================
  if (typeof input === "string") {
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    service.findPlaceFromQuery(
      {
        query: input,
        fields: ["place_id"],
      },
      (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results[0]
        ) {
          const placeId = results[0].place_id;

          service.getDetails(
            {
              placeId,
              fields: [
                "name",
                "formatted_address",
                "geometry",
                "photos",
                "rating",
                "user_ratings_total",
              ],
            },
            (details, detailsStatus) => {
              if (
                detailsStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                details
              ) {
                const photos =
                  details.photos?.map((p) =>
                    p.getUrl({ maxWidth: 500, maxHeight: 400 })
                  ) || [];

                callback({
                  name: details.name,
                  address: details.formatted_address,
                  location: details.geometry.location,
                  rating: details.rating,
                  totalRatings: details.user_ratings_total,
                  photos,
                });
              } else {
                console.error("Google details error:", detailsStatus);
                callback(null);
              }
            }
          );
        } else {
          console.error("Google query error:", status);
          callback(null);
        }
      }
    );
    return;
  }

  // ======================
  // Case 3: Google lat/lng se
  // ======================
  if (input.lat && input.lng) {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(input.lat), lng: parseFloat(input.lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback({
          name: results[0].formatted_address,
          address: results[0].formatted_address,
          location: latlng,
          rating: null,
          totalRatings: null,
          photos: [], // photos nahi mil rahe lat/lng se
        });
      } else {
        console.log("Geocoder failed:", status);
        callback(null);
      }
    });
    return;
  }

  // Agar kuch bhi match na kare
  callback(null);
};

export default fetchPlacesValue;

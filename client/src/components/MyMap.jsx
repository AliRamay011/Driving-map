// MyMap.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios"
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
   InfoWindow
} from "@react-google-maps/api";
import Menu from "./Menu";
import MapSearchBox from "./MapOverlayCard"; // bottom card
import L from 'leaflet';

const containerStyle = {
  width: "100%",
  height: "633px",
};

const defaultCenter = {
  lat: 33.6844,
  lng: 73.0479,
};

const LIBRARIES = ["places"];

function MyMap() {
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [location, setLocation] = useState(defaultCenter);
  const [showTraffic, setShowTraffic] = useState(false);
  const [directions, setDirections] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [originInfo, setOriginInfo] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [map, setMap] = useState(null);
  const userMarkerRef = useRef(null);
  const [customLocations, setCustomLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const API_URL = import.meta.env.VITE_APP_URL ;
  
  useEffect(() => {
    axios.get(`${API_URL}/api/locations`)
      .then(res => {
        console.log("Data from SQL:", res.data);
        setCustomLocations(res.data);
      })
      .catch(err => console.error(err));
  }, []);


const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});


const mapRef = useRef(null); // 👈 Map ref

const onLoad = useCallback((map) => {
  mapRef.current = map;
}, []);

const panTo = (location) => {
  if (mapRef.current && location) {
    mapRef.current.panTo(location);
    mapRef.current.setZoom(15); // or whatever zoom
  }
};

  // Pan map when location changes (only before directions are shown)
  useEffect(() => {
    if (location && mapRef.current && !directions) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(14);
    }
  }, [location, directions]);

  // 🚗 Search for directions + place info
const handleSearch = async (fromLocation, toLocation) => {
  if (!fromLocation || !toLocation) return;

  const directionsService = new window.google.maps.DirectionsService();
  const placesService = new window.google.maps.places.PlacesService(
    document.createElement("div")
  );

 directionsService.route(
  {
    origin: fromLocation,
    destination: toLocation,
    travelMode: window.google.maps.TravelMode.DRIVING,
  },
  async (result, status) => {
    if (status === "OK") {
      setDirections(result);
      setRoutes(result.routes);

      const leg = result?.routes?.[0]?.legs?.[0];
      if (!leg) {
        console.error("Leg not found in directions");
        return;
      }

      const originLocation = leg.start_location;
      const destinationLocation = leg.end_location;

      const fetchPlaceDetails = (query, callback) => {
        placesService.findPlaceFromQuery(
          {
            query,
            fields: [
              "place_id",
              "name",
              "formatted_address",
              "geometry",
            ],
          },
          (results, placeStatus) => {
            if (
              placeStatus === window.google.maps.places.PlacesServiceStatus.OK &&
              results.length > 0
            ) {
              const place = results[0];
              const request = {
                placeId: place.place_id,
                fields: [
                  "name",
                  "formatted_address",
                  "geometry",
                  "photos",
                  "rating",
                  "user_ratings_total",
                ],
              };

              placesService.getDetails(request, (details, detailsStatus) => {
                if (
                  detailsStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                  details
                ) {
                  const photos =
                    details.photos?.slice(0, 6).map((p) =>
                      p.getUrl({ maxWidth: 500, maxHeight: 400 })
                    ) || [];

                  callback({
                    name: details.name,
                    address: details.formatted_address,
                    location: details.geometry?.location,
                    rating: details.rating,
                    totalRatings: details.user_ratings_total,
                    photos,
                  });
                } else {
                  console.error("Place details not found:", detailsStatus);
                  callback(null);
                }
              });
            } else {
              console.error("Place not found from query:", query);
              callback(null);
            }
          }
        );
      };

      // Fetch origin info
      fetchPlaceDetails(fromLocation.name || fromLocation, (originInfo) => {
        if (originInfo) {
          setOriginInfo(originInfo);

          // Fetch destination info
          fetchPlaceDetails(toLocation.name || toLocation, (destinationInfo) => {
            if (destinationInfo) {
              setDestinationInfo(destinationInfo);

              // Set final route info
              setRouteInfo({
                name: destinationInfo.name,
                address: destinationInfo.address,
                distance: leg.distance.text,
                duration: leg.duration.text,
                location: destinationLocation,
                rating: destinationInfo.rating,
                totalRatings: destinationInfo.totalRatings,
                photos: destinationInfo.photos,
                origin: originLocation,
              });

              // Fit map bounds
              const bounds = new window.google.maps.LatLngBounds();
              result.routes[0].overview_path.forEach((point) =>
                bounds.extend(point)
              );
              mapRef.current.fitBounds(bounds);
            }
          });
        }
      });
    } else {
      alert("Could not find directions: " + status);
    }
  }
);

};




  // 🚦 Toggle traffic layer
  useEffect(() => {
    let trafficLayer;

    if (mapRef.current && showTraffic) {
      trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapRef.current);
    }

    return () => {
      if (trafficLayer) {
        trafficLayer.setMap(null);
      }
    };
  }, [showTraffic]);



  useEffect(() => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = { lat: latitude, lng: longitude };

          // User ka marker show karo
          const marker = new window.google.maps.Marker({
            position: pos,
            map,
            title: "You are here",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
          });

          userMarkerRef.current = marker;

          // Map ko pehle center kar do user pe (but auto follow off)
          map.setCenter(pos);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, [map]);
  return (
    <>
      <Menu />
     
 <MapSearchBox
  from={origin}
  to={destination}
  setFrom={setOrigin}
  setTo={setDestination}
  onSearch={handleSearch}
  onSelect={setLocation}
  showTraffic={showTraffic}
  setShowTraffic={setShowTraffic}
  routeInfo={routeInfo} // ⬅️ important
  //  selectedPlaceInfo={selectedPlaceInfo}
   routes={routes}
   hasRoute={!!directions}
    onLoad={onLoad}
    panTo={panTo}
    originInfo={originInfo}
    destinationInfo={destinationInfo}
    customLocations={customLocations}
    mapInstance={mapRef} 
    setCustomLocations={setCustomLocations}

/>

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={LIBRARIES}
      > 
      
        <GoogleMap
          mapContainerStyle={containerStyle}
          // onLoad={(map) => (mapRef.current = map)}
          ref={mapRef}
          center={directions ? undefined : location}
          zoom={10}
          options={{
            minZoom: 8,
            maxZoom: 20,
            fullscreenControl: false,
            mapTypeControl: false,
            gestureHandling: "greedy",
            disableDefaultUI: false,
            zoomControl: true,
            draggable: true,
            enableHighAccuracy : true 
          }}
          onLoad={(mapInstance) => {
    mapRef.current = mapInstance;   // ✅ set ref
    setMap(mapInstance);            // ✅ set state
  }}
        >
          
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: "#1E90FF",
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                },
              }}
            />
          )}


{/* // Markers with onClick handler to set selectedLocation */}
{!directions && Array.isArray(customLocations) && customLocations.map((loc, idx) => (
  <Marker
  key={`custom-${idx}`}
  position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
  onClick={() => setSelectedLocation(loc)} 
  icon ={homeIcon}  
  />
))}

{/* // InfoWindow rendered conditionally outside Marker  */}
{selectedLocation && (
  <InfoWindow
    position={{ lat: parseFloat(selectedLocation.lat), lng: parseFloat(selectedLocation.lng) }}
    onCloseClick={() => setSelectedLocation(null)}
  >
    <div>
      <strong>{selectedLocation.name}</strong><br />
      {selectedLocation.address}<br />
      {selectedLocation.description}
    </div>
  </InfoWindow>
)}






         
        </GoogleMap>
      </LoadScript>
    </>
  );
}

export default MyMap;

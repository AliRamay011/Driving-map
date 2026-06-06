import React, { useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { MdMyLocation } from "react-icons/md";
import { GrLocation } from "react-icons/gr";
import { FaSearchLocation, FaMapMarkedAlt } from "react-icons/fa";
import { LuArrowUpDown } from "react-icons/lu";
import { FaLocationCrosshairs } from "react-icons/fa6";
import Sidebar from "./SideBar";
import BottomLocationPanel from "./BottomPlaceCard";
import logo from "../img/logo.png";
import toast from "react-hot-toast";
import { FaDirections, FaShareAlt, FaSave } from "react-icons/fa";
import PhotoSlider from "./PhotoSlider";
import { IoMdClose } from "react-icons/io";
import ProfileDropdown from "./ProfileDropdown";
import AuthModal from "../components/login"; // ✅ tumhara modal import karo
import { useAuth } from "./CustomLocationContext";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
library.add(faRoute);
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';

function MapSearchBox({
  from,
  to,
  setFrom,
  setTo,
  onSearch,
  onSelect,
  showTraffic,
  setShowTraffic,
  panTo,
  routes,
  hasRoute,
  routeInfo,
  destinationInfo,
  originInfo,
  customLocations,
  mapInstance,
  setRouteInfo,
  suggestionMarkersRef,
  fetchNearbyGasStations,
  setShowGasStations,
  setGasStations,
  map,
  showGasStations,
  location,
  setIsNavigating,
  routePath,
  setRoutePath,
  autoLocationMarkerRef,
  userToRoadRef,
  remainingRouteRef,
  setOriginInfo,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeInput, setActiveInput] = useState("from");
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const userMarkerRef = useRef(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [UrlLocation, setUrlLocation] = useState("");
  const lastClosestIndex = useRef(0);
  const previousSnappedPos = useRef(null);
  const previousIndexRef = useRef(0); // Initial index 0 se start
  const lastPanPosition = useRef(null);
  const MIN_MOVE_DISTANCE = 3; // meters
  const lastRecalcTimeRef = useRef(0);
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isLogin, setIsLogin, setUser, authInitialized } = useAuth();
 const isNavigatingRef = useRef(false);
  useEffect(() => {
    if (!inputValue) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = () => {
      const service = new window.google.maps.places.AutocompleteService();

      service.getPlacePredictions(
        { input: inputValue },
        (predictions, status) => {
          const googleResults =
            status === window.google.maps.places.PlacesServiceStatus.OK
              ? predictions.map((p) => ({ ...p, type: "google" }))
              : [];

          const locArray = Array.isArray(customLocations)
            ? customLocations
            : [];
          const backendMatches = locArray
            .filter(
              (loc) =>
                loc.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                loc.address.toLowerCase().includes(inputValue.toLowerCase()) ||
                (loc.keywords &&
                  loc.keywords.toLowerCase().includes(inputValue.toLowerCase()))
            )
            .map((loc) => ({
              description: `${loc.name} - ${loc.address}`,
              type: "custom",
              data: {
                lat: parseFloat(loc.latitude),
                lng: parseFloat(loc.longitude),
                name: loc.name,
                description: loc.description,
                address: loc.address,
                photos: loc.images ? loc.images.split(",") : [],
                keywords: loc.keywords || "",
              },
            }));

          setSuggestions([...backendMatches, ...googleResults]);
        }
      );
    };

    const handler = setTimeout(fetchSuggestions, 200); // debounce
    return () => clearTimeout(handler);
  }, [inputValue, customLocations]);

  //  ===========  getArrivalTimeText ==============

  const getArrivalTimeText = (route) => {
    if (!route?.legs?.[0]?.duration?.value) return "";

    const now = new Date();
    const durationInSeconds = route.legs[0].duration.value;
    const arrivalTime = new Date(now.getTime() + durationInSeconds * 1000);

    const hours = arrivalTime.getHours();
    const minutes = arrivalTime.getMinutes();
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `Arrive at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  //  ======================= sendMyLocation ==================

  const sendMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        console.log("Share this location:\n" + mapsLink);
        // You can also copy to clipboard or send via WhatsApp, etc.
        setUrlLocation(mapsLink);
        setShareLocation(true);
      },
      (error) => {
        alert("Location access failed: " + error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );
  };

  let watchId = null;

  // Function to recenter map on user's current location (when navigation not started)
  const HandlePanToZoom = () => {
  if (isNavigatingRef.current) {
    console.log("Navigation active, pan/zoom disabled ✅");
    return;
  }  if (watchId !== null) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };

      if (!autoLocationMarkerRef.current) {
        const shadowMarker = new window.google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 24,
            fillColor: "rgba(66,133,244,0.4)",
            fillOpacity: 0.9,
            strokeWeight: 0,
          },
          zIndex: 0,
        });

        const mainMarker = new window.google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          zIndex: 1,
        });

        autoLocationMarkerRef.current = { shadowMarker, mainMarker };

        // Animate shadow
        let growing = true;
        let scale = 24;
        setInterval(() => {
          scale = growing ? scale + 0.3 : scale - 0.3;
          if (scale >= 28) growing = false;
          if (scale <= 20) growing = true;
          shadowMarker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            scale,
            fillColor: "rgba(66,133,244,0.4)",
            fillOpacity: 0.8,
            strokeWeight: 0,
          });
        }, 50);
      } else {
        autoLocationMarkerRef.current.shadowMarker.setPosition(pos);
        autoLocationMarkerRef.current.mainMarker.setPosition(pos);
      }

      // Pan & zoom to user location regardless of route
      if (mapInstance.current) {
        mapInstance.current.setZoom(24);
        mapInstance.current.panTo(pos);
      }
    },
    (err) => console.error("Geolocation error:", err),
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 }
  );
};

  // ===== CurrentLocation =====

  useEffect(() => {
    if (!isMobile || !navigator.geolocation || !mapInstance.current) return;

    const geo = new window.google.maps.Geocoder();
    const placesService = new window.google.maps.places.PlacesService(
      mapInstance.current
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("📍 GPS:", origin);
mapInstance.current.panTo(origin);
mapInstance.current.setZoom(18);

        // ✅ Marker create/update
        if (!autoLocationMarkerRef.current) {
          const shadowMarker = new window.google.maps.Marker({
            position: origin,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 24,
              fillColor: "rgba(66,133,244,0.4)",
              fillOpacity: 0.9,
              strokeWeight: 0,
            },
            zIndex: 0,
          });

          const mainMarker = new window.google.maps.Marker({
            position: origin,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
            zIndex: 1,
          });

          autoLocationMarkerRef.current = { shadowMarker, mainMarker };
        } else {
          autoLocationMarkerRef.current.shadowMarker.setPosition(origin);
          autoLocationMarkerRef.current.mainMarker.setPosition(origin);
        }

        // ✅ Reverse Geocode for place_id
        geo.geocode({ location: origin }, (results, status) => {
          if (status === "OK" && results[0]) {
            const place = results[0];

            if (place.place_id) {
              // ✅ Now fetch place details (for photos, ratings, etc.)
              placesService.getDetails(
                {
                  placeId: place.place_id,
                  fields: [
                    "name",
                    "formatted_address",
                    "geometry",
                    "photos",
                    "rating",
                    "user_ratings_total",
                  ],
                },
                (details, status) => {
                  if (
                    status ===
                      window.google.maps.places.PlacesServiceStatus.OK &&
                    details
                  ) {
                    const photos = details.photos
                      ? details.photos.map((p) =>
                          p.getUrl({ maxWidth: 500, maxHeight: 500 })
                        )
                      : [
                          "https://tse3.mm.bing.net/th/id/OIP.-hK87w5Y8xidgmeqv8DVjgHaEf?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
                        ]; // fallback image

                    console.log("photos ", photos);

                    setOriginInfo({
                      name: details.name || "Your Location",
                      address: details.formatted_address,
                      location: origin,
                      rating: details.rating,
                      totalRatings: details.user_ratings_total,
                      photos, // ✅ ab photos aa jayengi
                    });
                  }
                }
              );
            } else {
              // fallback if no placeId
              setOriginInfo({
                name: "Your Location",
                address: place.formatted_address,
                location: origin,
                photos: [],
              });
            }
          } else {
            console.error("Geocoder failed:", status);
          }
        });
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, [mapInstance.current]);

  const handleRecenter = () => {
    if (!mapInstance.current || !userMarkerRef.current) return;

    const position = userMarkerRef.current.getPosition();
    if (position) {
      mapInstance.current.panTo(position); // map ko user location pe move kar do
      mapInstance.current.setZoom(18); // ya jo zoom tum chahte ho
      console.log("Map recentered to user position ✅");
    }
  };
  // ============  handleDestinationSelect ===================

  const handleDestinationSelect = (place) => {
    if (!isLogin && !authInitialized) {
      setIsAuthOpen(true);
      return;
    }
    if (!isMobile) return;
    if (!place) return;

    const destinationData = place.geometry
      ? {
          name: place.name,
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          type: "google",
        }
      : place;

    setToLocation(destinationData);
    setIsDestinationSelected(true);

    const fetchAndDrawRoute = (origin) => {
      setFromLocation(origin); // update state
      onSearch(origin, destinationData); // route draw
    };

    if (fromLocation) {
      // ✅ Already available
      fetchAndDrawRoute(fromLocation);
    } else if (navigator.geolocation) {
      // ✅ Not ready yet, fetch current location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          fetchAndDrawRoute(origin);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Location access denied.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  // ============  checkRouteDevitaion ==================

  const checkRouteDeviation = (userPos, routePath) => {
    if (!routePath || routePath.length === 0) return false;

    // ✅ AGAR LAST CLOSEST INDEX NAHI HAI TOH 0 SE START KARO
    const currentIndex = lastClosestIndex.current || 0;

    // ✅ SEARCH WINDOW DEFINE KARO
    const SEARCH_WINDOW = 100; // 100 points check karo
    const startIndex = Math.max(0, currentIndex - 10);
    const endIndex = Math.min(routePath.length, currentIndex + SEARCH_WINDOW);

    let minDistance = Infinity;

    for (let i = startIndex; i < endIndex; i++) {
      const point = routePath[i];

      // ✅ DIRECT CALCULATION - Google LatLng object banane ki zaroorat nahi
      const distance =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(userPos.lat, userPos.lng),
          new window.google.maps.LatLng(point.lat, point.lng)
        );

      if (distance < minDistance) {
        minDistance = distance;

        // ✅ OPTIONAL: AGAR BOHOT CLOSE POINT MIL JAYE TOH BREAK KARO
        if (minDistance < 10) break; // 10m se kam distance mil gaya toh ruk jao
      }
    }

    console.log(`📍 Closest point: ${minDistance.toFixed(1)}m away`);

    const DEVIATION_THRESHOLD = 10; // meters
    return minDistance > DEVIATION_THRESHOLD;
  };

  //  ============= RecalculateRoute =====================

  const recalculateRoute = async (currentPosition, destination) => {
    try {
      console.log("🔄 Recalculating route from:", currentPosition);

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: currentPosition,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            console.log("✅ New route calculated");

            const steps = result.routes[0].legs[0].steps;
            const newAccuratePath = [];
            steps.forEach((step) => {
              step.path.forEach((p) => {
                newAccuratePath.push({ lat: p.lat(), lng: p.lng() });
              });
            });

            // ✅ New route draw karo
            const newPolyline = new window.google.maps.Polyline({
              path: newAccuratePath,
              strokeColor: "#4285F4",
              strokeOpacity: 1,
              strokeWeight: 8,
              map: mapInstance.current,
            });

            // Purana route hatao ab
            if (remainingRouteRef.current) {
              remainingRouteRef.current.setMap(null);
              remainingRouteRef.current = null;
            }

            remainingRouteRef.current = newPolyline;

            // ✅ Reset tracking
            setRoutePath(newAccuratePath);
            lastClosestIndex.current = 0;
            previousIndexRef.current = 0;

            console.log("🚗 New route updated from current position!");
          } else {
            console.error("❌ Route recalculation failed:", status);
          }
        }
      );
    } catch (error) {
      console.error("Error recalculating route:", error);
    }
  };

  const checkArrival = (userPos, destination) => {
    const distance =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userPos.lat, userPos.lng),
        new window.google.maps.LatLng(destination.lat, destination.lng)
      );
    return distance < 30; // 30m ke andar destination reached
  };

  //  ================= handleStartNavigation ========================
// ✅ Dynamic MIN_MOVE_DISTANCE based on speed
const getDynamicMoveDistance = (speed) => {
  if (!speed || speed <= 1) return 3; // standing or walking
  if (speed <= 5) return 5;            // slow traffic / city drive
  if (speed <= 15) return 8;           // medium drive
  return 12;                           // highway speed
};


  const handleStartNavigation = () => {
      isNavigatingRef.current = true;
    if (!isMobile) return;

    if (!mapInstance.current || !toLocation || !fromLocation) {
      console.log("Navigation: Missing prerequisites");
      return;
    }

    if (autoLocationMarkerRef.current) {
      autoLocationMarkerRef.current.shadowMarker.setMap(null);
      autoLocationMarkerRef.current.mainMarker.setMap(null);
      autoLocationMarkerRef.current = null;
      console.log("Current location marker removed ✅");
    }
    if (userToRoadRef.current) {
      userToRoadRef.current.setMap(null);
      userToRoadRef.current = null;
    }
    let watchId = null;

    let deviationCheckInterval = null;

    console.log("Navigation: Starting...");

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          if (checkArrival(userPos, toLocation)) {
            console.log("🎉 Arrived at destination!");

            // Navigation stop
            navigator.geolocation.clearWatch(watchId);
            if (userMarkerRef.current) userMarkerRef.current.setMap(null);
            if (remainingRouteRef.current)
              remainingRouteRef.current.setMap(null);

            // UI update
            toast.success("You have arrived at your destination!"); // 👈 isko rakho

            return;
          }

          if (routePath && routePath.length > 0) {
const userPos = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };
              const snappedPos = snapToRoute(userPos, routePath);
  console.log("Navigation: Snapped user position to road", snappedPos);

            if (snappedPos) {
              const heading = pos.coords.heading || 0;

              // ✅ Create user marker if doesn't exist
              if (!userMarkerRef.current) {
                console.log("Navigation: Creating user marker");
                userMarkerRef.current = new window.google.maps.Marker({
                  position: snappedPos,
                  map: mapInstance.current,
                  icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6, // Size increase karo
                    fillColor: "#EA4335", // Red color - car jaisa
                    fillOpacity: 1,
                    strokeColor: "black",
                    strokeWeight: 2,
                    rotation: heading,
                    anchor: new window.google.maps.Point(0, 0),
                  },
                  optimized: false,
                });
              } else {
                // ✅ Smoothly update marker position
                console.log("Navigation: Moving marker smoothly");
                  moveMarkerSmooth(userMarkerRef.current, snappedPos, pos.coords.heading || 0);


              }

              if (!lastPanPosition.current) {
                lastPanPosition.current = snappedPos;
                mapInstance.current.setZoom(18); // sirf pehli baar zoom
                mapInstance.current.panTo(snappedPos);
              } else {
                const distance =
                  window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(
                      snappedPos.lat,
                      snappedPos.lng
                    ),
                    new window.google.maps.LatLng(
                      lastPanPosition.current.lat,
                      lastPanPosition.current.lng
                    )
                  );
              const dynamicMove = getDynamicMoveDistance(pos.coords.speed);
if (distance > dynamicMove) {
  mapInstance.current.panTo(snappedPos);
  lastPanPosition.current = snappedPos;
}


              }
const isDeviated = checkRouteDeviation(snappedPos, routePath);
              if (isDeviated) {
                console.log("User deviated from route!");

                // Marker ko actual position pe move karo
                 moveMarkerSmooth(userMarkerRef.current, snappedPos, pos.coords.heading || 0);


                // ✅ Cooldown ke sath recalc
                const now = Date.now();
                const COOLDOWN = 5000; // 5 sec

                if (now - lastRecalcTimeRef.current > COOLDOWN) {
                  lastRecalcTimeRef.current = now;

                  console.log("Recalculating route...");
             recalculateRoute(userPos, toLocation, (newRoute) => {
  if (newRoute && newRoute.length > 0) {
    routePath = newRoute;
    previousIndexRef.current = 0;

    // ✅ Agar purani polyline exist karti hai to hatao
    if (remainingRouteRef.current) {
      remainingRouteRef.current.setMap(null);
    }

    // ✅ Nayi polyline draw karo
    remainingRouteRef.current = new window.google.maps.Polyline({
      path: newRoute,
      strokeColor: "#4285F4",
      strokeOpacity: 1,
      strokeWeight: 8,
      map: mapInstance.current,
    });

    // ✅ Marker ko nayi route ke start pe snap karo (road ke center pe)
    const startPoint = newRoute[0];
    if (userMarkerRef.current) {
      moveMarkerSmooth(userMarkerRef.current, startPoint, 0);
    }

    // ✅ Map ko naye route ke start pe pan & zoom karo
    mapInstance.current.panTo(startPoint);
    mapInstance.current.setZoom(18);

    console.log("🚗 New route drawn & marker moved to new start point");
  }
});

                } else {
                  console.log("⏳ Cooldown active, skipping recalculation");
                }
              }

              // ✅ Update remaining polyline
              const closestIndex = findClosestIndex(snappedPos, routePath);
              console.log(
                "Navigation: Closest Index",
                closestIndex,
                "Previous Index",
                previousIndexRef.current
              );

              if (remainingRouteRef.current) {
                const remainingRoute = [
                  snappedPos,
                  ...routePath.slice(closestIndex + 1),
                ];
                remainingRouteRef.current.setPath(remainingRoute);
                previousIndexRef.current = closestIndex;

                console.log(
                  "Polyline updated: remaining points",
                  remainingRoute.length
                );
              } else {
                console.log("Navigation: No polyline update needed");
              }
            } else {
              console.log("Navigation: No snapped position found");
            }
          } else {
            console.log("Navigation: No route path available");
          }
        },
        (err) => {
          console.error("Navigation: Geolocation error:", err);
          if (err.code === 1) {
            alert(
              "Location permission denied. Please enable location services."
            );
          }
        },
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 }
      );
    } else {
      console.error("Navigation: Geolocation not supported");
      alert("Geolocation is not supported by your browser.");
    }

    // ✅ Return cleanup function
    return () => {
      console.log("Navigation: Cleaning up...");

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        if (deviationCheckInterval) clearInterval(deviationCheckInterval);

        console.log("Navigation: Watch cleared");
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
        console.log("Navigation: User marker removed");
      }

      if (remainingRouteRef.current) {
        remainingRouteRef.current.setMap(null);
        remainingRouteRef.current = null;
        console.log("Navigation: Remaining polyline removed");
      }

      previousIndexRef.current = 0;
      console.log("Navigation: Cleanup completed");
    };
  };

  // =====================
  // Helper: Find closest index on route
  // =====================

  const findClosestIndex = (pos, path, lastIndex = 0) => {
    let minDist = Infinity;
    let closestIdx = lastIndex; // start from last index (so it won't go backward)

    for (let idx = lastIndex; idx < path.length; idx++) {
      const p = path[idx];
      const dLat = p.lat - pos.lat;
      const dLng = p.lng - pos.lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    }

    return closestIdx;
  };

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function shortestAngleDiff(a, b) {
    // a, b in degrees
    let diff = ((b - a + 540) % 360) - 180;
    return diff;
  }

  function moveMarkerSmooth(
    marker,
    targetPos,
    targetHeading = 0,
    minDuration = 150,
    maxDuration = 1200
  ) {
    if (!marker) return;

    // cancel previous animation
    if (marker.animationId) {
      cancelAnimationFrame(marker.animationId);
      marker.animationId = null;
    }

    const startLatLng = marker.getPosition();
    const startLat = startLatLng.lat();
    const startLng = startLatLng.lng();

    const endLat = targetPos.lat;
    const endLng = targetPos.lng;

    // compute distance to pick duration (meters -> ms)
    const startPoint = new window.google.maps.LatLng(startLat, startLng);
    const endPoint = new window.google.maps.LatLng(endLat, endLng);
    const distance =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        startPoint,
        endPoint
      );

    // duration mapping: small distances animate faster, bigger distances a bit longer
    let duration = Math.min(
      maxDuration,
      Math.max(minDuration, 200 + distance * 8)
    ); // tweak multiplier as needed

    const startHeading = marker._heading != null ? marker._heading : 0;
    const angleDiff = shortestAngleDiff(startHeading, targetHeading);

    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const easeT = easeOutQuad(t);

      const lat = startLat + (endLat - startLat) * easeT;
      const lng = startLng + (endLng - startLng) * easeT;
      marker.setPosition(new window.google.maps.LatLng(lat, lng));

      // smooth heading
      const heading = startHeading + angleDiff * easeT;
      marker.setIcon({
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#EA4335",
        fillOpacity: 1,
        strokeColor: "black",
        strokeWeight: 2,
        rotation: heading,
        anchor: new window.google.maps.Point(0, 0),
      });

      marker._heading = heading;

      if (t < 1) {
        marker.animationId = requestAnimationFrame(animate);
      } else {
        marker.animationId = null;
      }
    }

    marker.animationId = requestAnimationFrame(animate);
  }

  // Updated snapToRoute function
  function snapToRoute(position, polylinePath) {
    try {
      if (
        !polylinePath ||
        !Array.isArray(polylinePath) ||
        polylinePath.length === 0
      ) {
        return position;
      }

      if (!lastClosestIndex.current && lastClosestIndex.current !== 0) {
        lastClosestIndex.current = 0;
      }
      if (!previousSnappedPos.current) {
        previousSnappedPos.current = position;
      }

      const MOBILE_SNAP_DISTANCE = 200; // ✅ Increased to 200m for better snapping
      const MAX_DEVIATION_DISTANCE = 500; // ✅ Only recalculate if really far

      let minDist = Infinity;
      let nearestPoint = null;
      let nearestIndex = -1;

      // ✅ Search in larger radius around last known position
      const currentIndex = Math.max(
        0,
        Math.min(lastClosestIndex.current, polylinePath.length - 1)
      );
      const searchRadius = 100; // ✅ Increased search radius to 100 points
      const startIdx = Math.max(0, currentIndex - searchRadius);
      const endIdx = Math.min(polylinePath.length, currentIndex + searchRadius);

      console.log(
        `Snap searching from ${startIdx} to ${endIdx}, current index: ${currentIndex}`
      );

      for (let i = startIdx; i < endIdx; i++) {
        const point = polylinePath[i];
        if (
          !point ||
          typeof point.lat !== "number" ||
          typeof point.lng !== "number"
        ) {
          continue;
        }

        const dist =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(position.lat, position.lng),
            point
          );

        if (dist < minDist) {
          minDist = dist;
          nearestPoint = point;
          nearestIndex = i;
        }
      }

      console.log(
        `Closest point at index ${nearestIndex}, distance: ${minDist}m`
      );

      // ✅ ALWAYS SNAP if within reasonable distance (even if inside house)
      if (nearestIndex !== -1 && minDist <= MOBILE_SNAP_DISTANCE) {
        lastClosestIndex.current = nearestIndex;
        previousSnappedPos.current = nearestPoint;
        console.log(`✅ Snapped to route at index ${nearestIndex}`);
        return nearestPoint;
      }
      // ✅ Only trigger recalculation if REALLY far away
      else if (minDist > MAX_DEVIATION_DISTANCE) {
        console.log("🚨 User too far from route - triggering recalculation");
        return position; // Return actual position to trigger deviation
      }
      // ✅ If moderately far, still snap but use previous position as fallback
      else {
        console.log("⚠️ Moderate distance - using previous snapped position");
        return previousSnappedPos.current || position;
      }
    } catch (error) {
      console.error("Error in snapToRoute:", error);
      return position;
    }
  }

  const selectSuggestion = (suggestion) => {
    console.log("👉 selectSuggestion called with:", suggestion);

    setSuggestions([]);
    setShowSuggestions(false);

    // ===== CUSTOM LOCATION =====
    if (suggestion.type === "custom") {
      const { lat, lng, name, address, description, photos } =
        suggestion.data || {};
      if (!lat || !lng)
        return console.log("Latitude ya Longitude missing for custom location");

      const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
      const fullName = `${name}, ${address}`;
      const customData = {
        name,
        address,
        description: description || "",
        photos: photos || [],
        type: "custom",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      handleDestinationSelect(customData);

      if (mapInstance?.current) {
        // Remove all previous suggestion markers
        suggestionMarkersRef.current.forEach((m) => m.setMap(null));
        suggestionMarkersRef.current = [];

        const marker = new window.google.maps.Marker({
          position: latLng,
          map: mapInstance.current,
          title: customData.name,
          draggable: true,
        });

        // Push marker into ref array
        suggestionMarkersRef.current.push(marker);
        userMarkerRef.current = marker;

        marker.addListener("dragend", (event) => {
          const newLatLng = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: newLatLng }, (results, status) => {
            if (status === "OK" && results.length > 0) {
              const address = results[0].formatted_address;
              if (activeInput === "from") {
                setFrom(address);
                setFromLocation({ ...customData, ...newLatLng, address });
              } else {
                setTo(address);
                setToLocation({ ...customData, ...newLatLng, address });
              }
              if (fromLocation && toLocation) {
                onSearch(
                  { ...fromLocation, ...newLatLng },
                  { ...toLocation, ...newLatLng }
                );
              }
            }
          });
        });

        mapInstance.current.panTo(latLng);
        mapInstance.current.setZoom(20);
      }

      if (activeInput === "from") {
        setFrom(fullName);
        setFromLocation(customData);
        setInputValue(suggestion.description);
        if (toLocation) onSearch(customData, toLocation);
      } else {
        setTo(fullName);
        setToLocation(customData);
        setInputValue(suggestion.description);

        if (fromLocation) onSearch(fromLocation, customData);
      }

      setSuggestions([]);
      setKeyboardIndex(-1);
      if (onSelect) onSelect(customData);
      return;
    }

    // ===== GOOGLE PLACE SUGGESTION =====
    if (!suggestion.place_id)
      return alert("Place ID missing for Google place suggestion");

    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
    console.log("🚀 getDetails called for placeId:", suggestion.place_id);

    placesService.getDetails(
      {
        placeId: suggestion.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "photos",
          "rating",
          "user_ratings_total",
          "reviews",
        ],
      },

      (place, status) => {
        console.log("📌 getDetails response:", status, place);
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          return alert("Failed to get location details. Try again.");
        }
        console.log("✅ handleDestinationSelect called with:", place); // 🔥 yaha

        handleDestinationSelect(place);

        const latLng = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name,
          address: place.formatted_address,
          photos: place.photos?.map((p) => p.getUrl()) || [],
          rating: place.rating,
          totalRatings: place.user_ratings_total,
          reviews: place.reviews,
        };

        if (mapInstance?.current) {
          // Remove previous suggestion markers
          suggestionMarkersRef.current.forEach((m) => m.setMap(null));

          const marker = new window.google.maps.Marker({
            position: latLng,
            map: mapInstance.current,
            title: place.name,
          });

          // Push marker into ref array
          suggestionMarkersRef.current.push(marker);
          mapInstance.current.panTo(latLng);
          mapInstance.current.setZoom(20);
        }

        if (activeInput === "from") {
          setFrom(suggestion.description);
          setFromLocation(latLng);
          setInputValue(suggestion.description);
          if (toLocation) onSearch(latLng, toLocation);
        } else {
          setTo(suggestion.description);
          setToLocation(latLng);
          setInputValue(suggestion.description);
          if (fromLocation) onSearch(fromLocation, latLng);
        }

        setSuggestions([]);
        setKeyboardIndex(-1);
        if (onSelect) onSelect(latLng);
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setKeyboardIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setKeyboardIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();

      // ✅ Lat/Lng check
      const latLngMatch = inputValue.match(
        /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/
      );

      if (latLngMatch) {
        const lat = parseFloat(latLngMatch[1]);
        const lng = parseFloat(latLngMatch[3]);

        const latLngData = { lat, lng };

        if (activeInput === "from") {
          setFrom(inputValue);
          setFromLocation(latLngData);
        } else {
          setTo(inputValue);
          setToLocation(latLngData);
        }

        // ✅ Agar dono locations hain to route draw
        if (
          (activeInput === "from" ? latLngData : fromLocation) &&
          (activeInput === "to" ? latLngData : toLocation)
        ) {
          onSearch(
            activeInput === "from" ? latLngData : fromLocation,
            activeInput === "to" ? latLngData : toLocation
          );
        }

        handleLatLngInput(lat, lng, activeInput);

        setSuggestions([]);
        setShowSuggestions(false);
        setKeyboardIndex(-1);
        return;
      }

      // ✅ Agar suggestion select karna hai
      if (keyboardIndex >= 0 && suggestions[keyboardIndex]) {
        selectSuggestion(suggestions[keyboardIndex]);
        setInputValue(suggestions[keyboardIndex].description);

        setSuggestions([]);
        setShowSuggestions(false);
        setKeyboardIndex(-1);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setKeyboardIndex(-1);
    }
  };

  const handleLatLngInput = (lat, lng) => {
    const position = { lat, lng };

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      let address = `${lat}, ${lng}`; // default
      if (status === "OK" && results.length > 0) {
        address = results[0].formatted_address;
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      service.nearbySearch(
        { location: position, radius: 1000 },
        (places, placeStatus) => {
          let name = "Custom Location";
          let photos = [];
          let rating = null;
          let totalRatings = null;

          if (
            placeStatus === window.google.maps.places.PlacesServiceStatus.OK &&
            places.length > 0
          ) {
            const place = places[0];
            name = place.name || name;
            photos =
              place.photos
                ?.slice(0, 6)
                .map((p) => p.getUrl({ maxWidth: 500, maxHeight: 400 })) || [];
            rating = place.rating || null;
            totalRatings = place.user_ratings_total || null;
          }

          const locationData = {
            lat,
            lng,
            name,
            address,
            photos,
            rating,
            totalRatings,
          };

          // Marker
          if (mapInstance?.current) {
            if (userMarkerRef.current) userMarkerRef.current.setMap(null);
            // const marker = new window.google.maps.Marker({
            //   position,
            //   map: mapInstance.current,
            //   title: name,
            //   draggable: true,
            // });

            // marker.addListener("dragend", (event) => {
            //   handleLatLngInput(event.latLng.lat(), event.latLng.lng());
            // });

            // userMarkerRef.current = marker;
            mapInstance.current.panTo(position);
            mapInstance.current.setZoom(20);
          }

          // Update state & bottom panel
          if (activeInput === "from") {
            setFrom(`${lat}, ${lng}`);
            setFromLocation(locationData);
            setInputValue(`${lat}, ${lng}`);
          } else {
            setTo(`${lat}, ${lng}`);
            setToLocation(locationData);
            setInputValue(`${lat}, ${lng}`);
          }

          setRouteInfo(locationData);
          //  console.log('location data ' , locationData);

          // Draw route if both locations exist
          if (
            (activeInput === "from" ? locationData : fromLocation) &&
            (activeInput === "to" ? locationData : toLocation)
          ) {
            onSearch(
              activeInput === "from" ? locationData : fromLocation,
              activeInput === "to" ? locationData : toLocation
            );
          }
        }
      );
    });
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  const handleChooseLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latLng = { lat: latitude, lng: longitude };

        // ✅ Sirf tab marker create karo jab pehle se na ho
        if (!autoLocationMarkerRef.current) {
          const shadowMarker = new window.google.maps.Marker({
            position: latLng,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 24,
              fillColor: "rgba(66,133,244,0.4)",
              fillOpacity: 0.9,
              strokeWeight: 0,
            },
            zIndex: 0,
          });

          const mainMarker = new window.google.maps.Marker({
            position: latLng,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
            zIndex: 1,
          });

          autoLocationMarkerRef.current = { shadowMarker, mainMarker };

          // Animate shadow
          let growing = true;
          let scale = 24;
          setInterval(() => {
            if (growing) {
              scale += 0.3;
              if (scale >= 20) growing = false;
            } else {
              scale -= 0.3;
              if (scale <= 14) growing = true;
            }

            shadowMarker.setIcon({
              path: window.google.maps.SymbolPath.CIRCLE,
              scale,
              fillColor: "rgba(66,133,244,0.4)",
              fillOpacity: 0.8,
              strokeWeight: 0,
            });
          }, 50);
        } else {
          // Agar pehle se marker hai, to bas position update karo
          autoLocationMarkerRef.current.shadowMarker.setPosition(latLng);
          autoLocationMarkerRef.current.mainMarker.setPosition(latLng);
        }

        const locationData = {
          lat: latitude,
          lng: longitude,
          name: "Current Location",
          address: "",
          photos: [],
          rating: null,
          totalRatings: null,
          reviews: [],
        };

        // Geocode for address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            locationData.address = results[0].formatted_address;

            // Update input fields
            if (activeInput === "from") {
              setFrom(locationData.address);
              setFromLocation(locationData);
              setInputValue(locationData.address);
            } else if (activeInput === "to") {
              setTo(locationData.address);
              setToLocation(locationData);
            }

            setSuggestions([]);
            setKeyboardIndex(-1);
            if (onSelect) onSelect(locationData);

            // Center map
            if (map) {
              map.setCenter(latLng);
              map.setZoom(18);
            }
          } else {
            toast.error("Unable to detect a usable address.");
          }
        });
      },
      (err) => toast.error(`Location access denied: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobileWidth = width < 768;
      const isMobileUA = /Mobi|Android/i.test(navigator.userAgent);

      setIsMobile(mobileWidth && isMobileUA); // Only true if both width and UA indicate mobile
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateY(${
        expanded ? diff : 150 + diff
      }px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff < -50) setExpanded(true); // swipe up → expand
    else if (diff > 50) setExpanded(false); // swipe down → collapse

    if (cardRef.current) cardRef.current.style.transform = ""; // reset
  };
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLogin(loggedIn);
  }, []);

  // jab signup successful ho jaye:
  const handleSignupSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Signup successful!");
  };

  return (
    <>
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`transition-all duration-300 ease-in-out overflow-hidden z-20 
      ${
        isMobile
          ? `fixed bottom-0 w-[auto] mx-auto right-0 left-0 bg-white rounded-t-3xl shadow-xl overflow-y-auto ${
              expanded ? "h-[450px]" : "h-[80px]"
            }`
          : hasRoute
          ? "fixed top-0 bottom-0 left-0 w-[380px] rounded-none overflow-y-auto"
          : "absolute top-4 left-4   "
      }
    `}
      >
        {isMobile && (
          <>
            <div className="w-12 h-1.5 bg-gray-400 rounded-full  mx-auto mt-2"></div>
            <div className="flex fixed right-3 items-center  gap-20 ml-3 mb-3">
              <button onClick={() => setSidebarOpen(true)}>
                <IoMdMenu className="text-blue text-2xl font-medium" />
              </button>
            </div>

            {!isDestinationSelected && originInfo && (
              <div className="mb-6 mt-5 mx-5">
                <h2 className="text-xl font-semibold mb-1 pr-4">
                  {originInfo.name}
                </h2>
                <p className="text-sm text-gray-600 mb-3 pr-4">
                  {originInfo.address}
                </p>

                {/* Photos */}
                {originInfo?.photos?.length > 0 && (
                  <PhotoSlider photos={originInfo.photos.slice(0, 6)} />
                )}

                {/* Rating */}
              </div>
            )}

            {isDestinationSelected && destinationInfo && (
              <div className="mb-6 mx-5">
                <div className="flex gap-4 text-xl mb-5 mt-5 ml-2 text-blue-600 dark:text-blue-400">
                  <FaShareAlt
                    className="cursor-pointer size-6"
                    title="Share"
                    onClick={sendMyLocation}
                  />
                  <FaDirections
                    className="cursor-pointer size-6"
                    title="Directions"
                    onClick={handleStartNavigation}
                  />
                  <FaSave className="cursor-pointer size-6" title="Save" />
                </div>
                {shareLocation && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white px-2 py-3 rounded-xl mx-3 shadow-lg w-[auto] h-[200px] text-center">
                      <div className="flex justify-end">
                        <button
                          className="flex items-center text-left"
                          onClick={() => setShareLocation(false)}
                        >
                          <IoMdClose />
                        </button>
                      </div>
                      <h2 className="text-sm text-gray-600 font-medium mb-5">
                        Share Location
                      </h2>
                      <div className="block">
                        <div className="flex justify-center flex-wrap items-center text-center">
                          <div className="block">
                            <p className="text-white bg-slate-600 p-3 mb-3 rounded-md  break-all text-xs">
                              {UrlLocation}
                            </p>
                          </div>
                        </div>
                        <div className="block">
                          <button
                            className=" px-4 py-2 bg-gray-500 text-white w-full rounded-md  hover:bg-blue-700"
                            onClick={() => {
                              navigator.clipboard.writeText(UrlLocation);
                              alert("Link copied to clipboard!");
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-1">
                  {destinationInfo.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {destinationInfo.address}
                </p>

                {/* Photos */}
                {destinationInfo.photos?.length > 0 && (
                  <PhotoSlider photos={destinationInfo.photos.slice(0, 6)} />
                )}

                {/* Rating */}
                <p className="text-black dark:text-white">
                  Rating: {destinationInfo.rating || "N/A"}
                </p>
                <p className="text-black dark:text-white">
                  Total Ratings: {destinationInfo.totalRatings || "N/A"}
                </p>

                {/* Reviews */}
                {destinationInfo.reviews?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2">User Reviews</h3>
                    <div className="space-y-3">
                      {destinationInfo.reviews.slice(0, 3).map((review, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {review.profile_photo_url && (
                              <img
                                src={review.profile_photo_url}
                                alt="Author"
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <p className="text-sm font-medium text-black dark:text-white">
                              {review.author_name}
                            </p>
                            <span className="text-xs text-yellow-500 ml-auto">
                              ⭐ {review.rating}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {review.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action icons */}

                <div className="border-b-[1px] pb-4 mt-4">
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <div key={index}>
                        <div className="flex text-center items-center mb-1">
                          <h3 className="bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex justify-center text-center items-center">
                            {index + 1}
                          </h3>
                          <p className="ml-3 text-lg font-bold">
                            {route.legs?.[0]?.duration?.text}
                          </p>
                          <p className="flex justify-center items-end text-xs ml-3">
                            {getArrivalTimeText(route)}
                          </p>
                        </div>

                        <p className="text-sm text-gray-600 ml-9">
                          {route.summary}
                        </p>
                        <p className="ml-9 text-gray-700 text-xs">
                          {route.legs?.[0]?.distance?.text}
                        </p>
                      </div>
                    ))
                  ) : ( 
                    <p className="text-gray-500">No routes available.</p>
                  )}
                </div>
              </div>
            )}
            
          </>
        )}
      </div>
    {isMobile && (
        <div
          onClick={handleRecenter}
          className="fixed bottom-[260px] right-[10px] cursor-pointer flex justify-center items-center 
                  z-10 rounded-full bg-white shadow-lg shadow-gray-600 w-[40px] h-[40px]"
        >
<FontAwesomeIcon icon={["fas", "route"]} />
        </div>
      )}
        {isMobile && (
              <div
                onClick={HandlePanToZoom}
                className="fixed bottom-[210px] right-[10px] cursor-pointer flex justify-center items-center 
                        z-10 rounded-full bg-white shadow-lg shadow-gray-600 w-[40px] h-[40px]"
              >
               <FontAwesomeIcon icon={faCrosshairs} />
              </div>
            )}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showTraffic={showTraffic}
        setShowTraffic={setShowTraffic}
        fetchNearbyGasStations={fetchNearbyGasStations}
        setShowGasStations={setShowGasStations}
        setGasStations={setGasStations}
        map={map}
        showGasStations={showGasStations}
        location={location}
      />

      {!isMobile && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden z-20 
      ${
        hasRoute
          ? "fixed top-0 bg-white bottom-0 left-0 w-[380px] rounded-none overflow-y-auto"
          : "bg-white absolute top-4 left-4 rounded-lg shadow-lg z-20 transition-all overflow-hidden duration-300 py-3 p-0 w-[370px]  "
      }
    `}
        >
          {/* Header */}

          <div className="flex items-center gap-20 ml-3 mb-3">
            <button onClick={() => setSidebarOpen(true)}>
              <IoMdMenu className="text-black text-xl font-medium" />
            </button>
            <h1 className="text-xl text-gray-800 text-center font-normal">
              Driving Details
            </h1>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-[48px_1fr_48px] gap-3 items-center">
            <div className="flex flex-col justify-between items-center h-full space-y-3 py-1">
              <div className="w-10 h-10 flex items-center justify-center text-blue-700">
                <MdMyLocation className="text-xl" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center text-red-500">
                <GrLocation className="text-xl" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                <FaSearchLocation className="text-gray-500 text-base" />
                <input
                  placeholder="Search origin..."
                  value={activeInput === "from" ? inputValue : from}
                  onFocus={() => {
                    setActiveInput("from");
                    setInputValue(from);
                    setShowSuggestions(true);
                  }}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setActiveInput("from");
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm px-3 text-gray-500 placeholder-gray-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                <FaMapMarkedAlt className="text-gray-500 text-base" />
                <input
                  placeholder="Search destination..."
                  value={activeInput === "to" ? inputValue : to}
                  onFocus={() => {
                    setActiveInput("to");
                    setInputValue(to);
                    setShowSuggestions(true);
                  }}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setActiveInput("to");
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-gray-500 ml-2 placeholder-gray-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={handleSwap}>
                <LuArrowUpDown className="text-xl" />
              </button>
            </div>
          </div>

          {/* Your location button */}
          <div
            className="mt-2 flex gap-3 items-center px-4 py-4 cursor-pointer border-b"
            onClick={handleChooseLocation}
          >
            <FaLocationCrosshairs className="text-blue-500 text-lg" />
            <span className="text-sm text-gray-600">Your Location</span>
          </div>

          {/* Suggestions */}
          {showSuggestions &&
            [
              ...new Map(
                suggestions.map((item) => [item.description, item])
              ).values(),
            ].map((suggestion, index) => (
              <div
                key={suggestion.place_id || suggestion.description || index}
                onMouseDown={() => selectSuggestion(suggestion)}
                className={`flex items-center px-4 py-2 cursor-pointer text-sm transition relative ${
                  index === keyboardIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                {suggestion.type === "custom" && (
                  <img
                    src={logo}
                    alt="custom"
                    className="w-5 h-5 mr-3 flex-shrink-0"
                  />
                )}
                <span className="truncate flex-1">
                  {suggestion.description}
                  {suggestion.keywords && ` (${suggestion.keywords})`}
                </span>
                {suggestion.type === "custom" && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    Custom
                  </span>
                )}
                <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
              </div>
            ))}

          {/* BottomLocationPanel embedded for mobile + desktop */}
          {hasRoute && routeInfo && (
            <div
              className={`transition-all overflow-hidden ${
                isMobile
                  ? expanded
                    ? "h-[240px]"
                    : ""
                  : isTablet
                  ? "h-auto" // ✅ Tablet ke liye height
                  : "h-auto" // ✅ Desktop
              }`}
            >
              <BottomLocationPanel
                info={routeInfo}
                routes={routes}
                originInfo={originInfo || fromLocation}
                destinationInfo={destinationInfo || toLocation}
                panTo={panTo}
                setIsNavigating={setIsNavigating}
              />
            </div>
          )}
        </div>
      )}
      <>
        {isMobile && (
          <>
            <div className="fixed left-0 right-0  z-40 top-4 mx-3 w-auto">
              <div
                className={`flex bg-white items-center border-x-2 border-b-0 border-t-2 px-3 text-center py-4 w-[auto] transition-all ${
                  showSuggestions && suggestions.length > 0
                    ? "rounded-t-2xl rounded-b-none border-b-0"
                    : "rounded-full border-0"
                }`}
              >
                <FaMapMarkedAlt className="text-gray-500 text-base" />
                <input
                  placeholder="Search destination..."
                  value={activeInput === "to" ? inputValue : to}
                  onFocus={() => {
                    setActiveInput("to");
                    setInputValue(to);
                    setShowSuggestions(true);
                  }}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setActiveInput("to");
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-gray-500 ml-2 placeholder-gray-300 focus:outline-none"
                  onClick={() => {
                    if (!isLogin) {
                      console.log("click");

                      setIsAuthOpen(true); // ❌ sirf agar login nahi hai tab
                    }
                  }}
                />
                <ProfileDropdown />
                <AuthModal
                  isOpen={isAuthOpen}
                  onClose={() => setIsAuthOpen(false)} // ✅ close button se band hoga
                  setshowProfile={() => {}}
                  setshowButton={() => {}}
                  onLoginSuccess={handleSignupSuccess}
                />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className=" border-x-2  relative top-[-1px]  w-auto bg-white rounded-b-lg rounded-t-none  z-50 max-h-60 overflow-y-auto">
                  {[
                    ...new Map(
                      suggestions.map((item) => [item.description, item])
                    ).values(),
                  ].map((suggestion, index) => (
                    <div
                      key={
                        suggestion.place_id || suggestion.description || index
                      }
                      onMouseDown={() => selectSuggestion(suggestion)}
                      className={`flex items-center px-4 py-2 cursor-pointer text-sm transition ${
                        index === keyboardIndex
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {suggestion.type === "custom" && (
                        <img
                          src={logo}
                          alt="custom"
                          className="w-5 h-5 mr-3 flex-shrink-0"
                        />
                      )}
                      <span className="truncate flex-1">
                        {suggestion.description}
                        {suggestion.keywords && ` (${suggestion.keywords})`}
                      </span>
                      {suggestion.type === "custom" && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </>
    </>
  );
}
export default MapSearchBox;

// MyMap.jsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import Menu from "./Menu";
import MapSearchBox from "./MapOverlayCard"; // bottom card
import { CustomLocationContext } from "./CustomLocationContext";
import fetchPlacesValue from "./utils/fetchPlaceDetails";
import ReportForm from "./ReportForm";
import ProfileDropdown from "./ProfileDropdown";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(faRoute);
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';


const containerStyle = {
  width: "100%",
  height: "100vh",
};

const DEFAULT_CENTER = { lat: 30.0000, lng: 70.0000 };

const LIBRARIES = ["places", "geometry"];

function MyMap() {
  //  console.log("fectplaces" , fetchPlacesValue);
  const [ShowProfile, setshowProfile] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [location, setLocation] = useState();
  const [showTraffic, setShowTraffic] = useState(false);
  const [directions, setDirections] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [originInfo, setOriginInfo] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [map, setMap] = useState(null);
  const userMarkerRef = useRef(null);
  const suggestionMarkersRef = useRef([]);
  const [showGasStations, setShowGasStations] = useState(false);
  const [gasStations, setGasStations] = useState([]);
  const [reports, setReports] = useState([]);
  const remainingRouteRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { customLocations, fetchCustomLocations } = useContext(
    CustomLocationContext
  );
  const [userCurrentPosition, setUserCurrentPosition] = useState(null);
  const userToRoadRef = useRef(null); // top of component

  console.log("Origin ", originInfo);
  console.log("Destination ", destinationInfo);

  const wazeCleanCartoonStyle = [
    // Background
    {
      elementType: "geometry",
      stylers: [{ color: "#faf7ef" }], // soft cream/off-white background
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#636261" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f7f4ef" }], // white outline to separate text
    },
    // Roads
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#777777" }], // light neutral gray for clear visibility
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [
        { color: "#9ba68b" }, // outline         // default 1, increase for zoomed-in clarity
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [{ color: "#a3be8c" }], // pastel green for main/highway roads
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#889977" }], // darker outline on highways
    },
    // Other roads
    {
      featureType: "road.arterial",
      elementType: "geometry.fill",
      stylers: [{ color: "#c2cfae" }], // slightly darker gray for arterial roads
    },
    {
      featureType: "road.local",
      elementType: "geometry.fill",
      stylers: [{ color: "#c9d0c5" }], // lighter gray for local roads
    },
    // Parks & Green Areas
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#cce5a6" }], // bright pastel green parks
    },
    // Water
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#9fd4da" }], // pastel sky-blue water
    },
    // Points of Interest (POI)
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#eaeaea" }], // very light gray for small POIs
    },

    {
      featureType: "poi",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },

    // Hide small street & local labels
  ];

  const [routePath, setRoutePath] = useState([]);

  const mapRef = useRef(null); // 👈 Map ref

  const lastAngle = useRef(null);
  const lastDistanceY = useRef(null);

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;

      // ✅ Location handle karo
      if (location) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(20);
      }

      // ✅ Gesture handle karo
      const mapDiv = map.getDiv();
      mapDiv.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();

            const [t1, t2] = e.touches;

            // 🔄 Rotation
            const dx = t2.clientX - t1.clientX;
            const dy = t2.clientY - t1.clientY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            if (lastAngle.current !== null) {
              let deltaAngle = angle - lastAngle.current;
              let newHeading = map.getHeading() || 0;
              map.setHeading(newHeading + deltaAngle);
            }
            lastAngle.current = angle;

            // ↕️ Tilt
            const distanceY = Math.abs(t2.clientY - t1.clientY);
            if (lastDistanceY.current !== null) {
              let deltaY = distanceY - lastDistanceY.current;
              let newTilt = map.getTilt() || 0;
              newTilt = Math.min(80, Math.max(0, newTilt + deltaY * 0.1));
              map.setTilt(newTilt);
            }
            lastDistanceY.current = distanceY;
          }
        },
        { passive: false }
      );

      mapDiv.addEventListener("touchend", () => {
        lastAngle.current = null;
        lastDistanceY.current = null;
      });
    },
    [location]
  );

  const fetchNearbyGasStations = (map, location) => {
    if (!map || !location) return;

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: location,
      radius: 5000,
      type: "gas_station",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log("🚀 Gas Station Results: ", results); // 👈 check yahan

        setGasStations(results);
      } else {
        console.log("❌ Error: ", status);
      }
    });
  };

  const panTo = (location) => {
    if (mapRef.current && location) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(20); // or whatever zoom
    }
  };

  useEffect(() => {
    if (location && mapRef.current && !directions) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(20);
    }
  }, [location, directions]);

  // 🚗 Search for directions + place info
  const handleSearch = async (fromLocation, toLocation) => {
    if (!fromLocation || !toLocation) return;

    // ❌ Remove all suggestion markers
    if (userMarkerRef && suggestionMarkersRef.current) {
      suggestionMarkersRef.current.forEach((marker) => marker.setMap(null));
      suggestionMarkersRef.current = [];
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: fromLocation,
        destination: toLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK") {
          alert("Could not find directions: " + status);
          return;
        }

        setDirections(result);
        setRoutes(result.routes);

        // ---------------------------
        // High-resolution path using steps
        // ---------------------------
        const steps = result.routes[0].legs[0].steps;
        let accuratePath = [];
        steps.forEach((step) => {
          step.path.forEach((p) => {
            accuratePath.push({ lat: p.lat(), lng: p.lng() });
          });
        });
        setRoutePath(accuratePath);

        // ---------------------------
        // Draw main polyline
        // ---------------------------
        if (remainingRouteRef.current) remainingRouteRef.current.setMap(null);

        remainingRouteRef.current = new window.google.maps.Polyline({
          path: accuratePath,
          strokeColor: "#0f53ff",
          strokeOpacity: 1,
          strokeWeight: Math.max(5, (10 * mapRef.current.getZoom()) / 16),
          map: mapRef.current,
        });

        // ---------------------------
        // Route info
        // ---------------------------
        const leg = result.routes[0].legs[0];

        const originLocation =
          fromLocation?.geometry?.location || leg.start_location;
        const destinationLocation =
          toLocation?.geometry?.location || leg.end_location;

        const isCustomOrigin = fromLocation?.type === "custom";
        const isCustomDest = toLocation?.type === "custom";

        // ---------------------------
        // Fetch origin & destination info
        // ---------------------------
        fetchPlacesValue(
          fromLocation.name || fromLocation,
          mapRef,
          (originInfoData) => {
            if (originInfoData) setOriginInfo(originInfoData);

            fetchPlacesValue(
              toLocation.name || toLocation,
              mapRef,
              (destinationInfoData) => {
                if (destinationInfoData)
                  setDestinationInfo(destinationInfoData);

                if (originInfoData && destinationInfoData) {
                  setRouteInfo({
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    start: leg.start_address,
                    end: leg.end_address,
                    name: destinationInfoData.name,
                    address: destinationInfoData.address,
                    location: destinationLocation,
                    rating: destinationInfoData.rating,
                    totalRatings: destinationInfoData.totalRatings,
                    photos: destinationInfoData.photos,
                    origin: originLocation,
                    originPhotos: originInfoData.photos, // ✅ origin photos
                  });

                  // Fit map bounds
                  const bounds = new window.google.maps.LatLngBounds();
                  accuratePath.forEach((point) => bounds.extend(point));
                  mapRef.current.fitBounds(bounds);
                }
              },
              isCustomDest
            );
          },
          isCustomOrigin
        );

        // ---------------------------
        // Draw dotted line from user location to route start
        // ---------------------------
        // User → road dots (already correct)
        if (userCurrentPosition && accuratePath.length > 0) {
          if (userToRoadRef.current) userToRoadRef.current.setMap(null);

          const start = new window.google.maps.LatLng(
            userCurrentPosition.lat,
            userCurrentPosition.lng
          );
          const end = new window.google.maps.LatLng(
            accuratePath[0].lat,
            accuratePath[0].lng
          );

          userToRoadRef.current = new window.google.maps.Polyline({
            path: [start, end],
            strokeOpacity: 0,
            icons: [
              {
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 4,
                  fillColor: "#bccefb",
                  fillOpacity: 1,
                  strokeWeight: 0,
                },
                offset: "0",
                repeat: "10px",
              },
            ],
            map: mapRef.current,
          });
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
  // Assume NavigationImg imported: const NavigationImg = 'path/to/arrow-icon.png';

  // States
  const [isNavigating, setIsNavigating] = useState(false);
  const autoLocationMarkerRef = useRef(null); // Previous auto marker
  const lastClosestIndex = useRef(0);
  const previousIndexRef = useRef(0); // Initial index 0 se start
  const previousSnappedPos = useRef(null); // Previous snapped position

  // Smoothly move marker along GPS updates
  function moveMarkerSmooth(marker, newPos, heading = 0) {
    if (!marker) return;
    const steps = 20;
    let i = 0;

    // ✅ Rotation ek baar set kar do (har step pe mat karo, performance ke liye)
    marker.setIcon({
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      strokeColor: "#837b7b", // Google ka blue
      strokeWeight: 6,
      fillColor: "#837b7b",
      fillOpacity: 4,
      rotation: heading, // ✅ rotate with heading
      anchor: new window.google.maps.Point(0, 2),
    });

    const interval = setInterval(() => {
      if (i >= steps) {
        clearInterval(interval);
        return;
      }

      // ✅ Current position har interval pe update karo – properties use karo
      const currentPos = marker.getPosition();
      const lat = currentPos.lat(); // ✅ function call
      const lng = currentPos.lng(); // ✅ function call

      const latDiff = (newPos.lat - lat) / (steps - i);
      const lngDiff = (newPos.lng - lng) / (steps - i);

      marker.setPosition({
        lat: lat + latDiff,
        lng: lng + lngDiff,
      });

      i++;
    }, 50);
  }

  // Updated snapToRoute function
  function snapToRoute(position, polylinePath) {
    if (!polylinePath || polylinePath.length === 0) return position;

    // ✅ Threshold: Sirf 5 meters se zyada move pe update karo
    const MIN_MOVE_DISTANCE = 4; // meters, adjust kar sakte ho

    if (previousSnappedPos.current) {
      const prevDist =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(position.lat, position.lng),
          previousSnappedPos.current
        );
      if (prevDist < MIN_MOVE_DISTANCE) {
        // Stationary: Purani position return karo, index mat badhao
        console.log("Stationary: Skipping update (distance < 5m)"); // Debug log
        return previousSnappedPos.current;
      }
    }

    let minDist = Infinity;
    let nearestPoint = null;
    let nearestIndex = -1;

    // ✅ Poora route check karo for accuracy
    // Efficiency ke liye: Agar route lambi hai, to window use karo (uncomment below)
    const startIdx = Math.max(0, findClosestIndex.current - 20); // Peeche 20 points
    const endIdx = Math.min(polylinePath.length, findClosestIndex.current + 50); // Aage 50 points
    for (let i = startIdx; i < endIdx; i++) {
      // Windowed loop for efficiency (better than full scan)
      // Agar full scan chahiye: for (let i = 0; i < polylinePath.length; i++)
      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(position.lat, position.lng),
        polylinePath[i]
      );
      if (dist < minDist) {
        minDist = dist;
        nearestPoint = polylinePath[i];
        nearestIndex = i;
      }
    }

    // ✅ Sirf tab update karo agar actual distance route point se close ho (e.g., 20m ke andar) aur index valid ho
    if (minDist > 20 || nearestIndex === -1) {
      console.log("No valid snap: Distance too far or no point found"); // Debug log
      return previousSnappedPos.current || position; // Fallback, no snap
    }

    findClosestIndex.current = nearestIndex;
    previousSnappedPos.current = nearestPoint; // Track karo
    console.log("Snapped to index:", nearestIndex, "Distance:", minDist); // Debug log
    return nearestPoint;
  }

  useEffect(() => {
    if (!mapRef.current || !isNavigating || !window.google) return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (routePath.length > 0) {
            const snappedPos = snapToRoute(pos, routePath);

            if (snappedPos) {
              const heading = position.coords.heading || 0;

              // ✅ First time marker create
              if (!userMarkerRef.current) {
                userMarkerRef.current = new window.google.maps.Marker({
                  position: snappedPos,
                  map: mapRef.current,
                  icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,

                    scale: 5,
                    strokeColor: "#837b7b", // Google ka blue
                    strokeWeight: 6,
                    fillColor: "#837b7b",
                    fillOpacity: 4,
                    rotation: heading, // ✅ rotate with heading
                    anchor: new window.google.maps.Point(0, 2),
                  },
                });
              } else {
                // ✅ Smoothly move marker along route
                moveMarkerSmooth(userMarkerRef.current, snappedPos, heading);

                console.log("Marker moved smoothly");
              }

              // ✅ Camera follow marker – Hamesha chalao
              mapRef.current.setZoom(20);
              mapRef.current.setTilt(60);
              mapRef.current.panTo(snappedPos);
              mapRef.current.setHeading(heading);

              const closestIndex = findClosestIndex(snappedPos, routePath); // function: find nearest routePath index
              findClosestIndex.current = closestIndex;

              if (closestIndex > previousIndexRef.current) {
                previousIndexRef.current = closestIndex;
                const remainingRoute = routePath.slice(closestIndex);

                if (remainingRouteRef.current) {
                  remainingRouteRef.current.setPath(remainingRoute);
                  console.log(
                    "Polyline updated: remaining points",
                    remainingRoute.length
                  );
                }
              }
            }
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
      );
    }

    // Cleanup
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (remainingRouteRef.current) {
        remainingRouteRef.current.setMap(null);
        remainingRouteRef.current = null;
      }
      if (autoLocationMarkerRef.current) {
        autoLocationMarkerRef.current.setMap(null);
        autoLocationMarkerRef.current = null;
      }

      // Reset refs
      lastClosestIndex.current = 0;
      previousIndexRef.current = 0;
      previousSnappedPos.current = null;
      console.log("Navigation cleaned up");
    };
  }, [isNavigating, routePath]);

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
  useEffect(() => {
    if (!window.google || !window.google.maps) return; // ✅ safe guard

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          const latLng = { lat: latitude, lng: longitude };
          setUserCurrentPosition(latLng);
          setLocation(latLng);
          setOriginInfo({ location: latLng, name: "Your Location" });

          if (!autoLocationMarkerRef.current) {
            // 🔵 Shadow Marker
            
            const shadowMarker = new window.google.maps.Marker({
              position: latLng,
              map: mapRef.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 24,
                fillColor: "rgba(66,133,244,0.4)",
                fillOpacity: 0.9,
                strokeWeight: 0,
              },
              zIndex: 0,
            });

            // 🔵 Main Dot Marker
            const mainMarker = new window.google.maps.Marker({
              position: latLng,
              map: mapRef.current,
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

            // 🌟 Animate Shadow
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
                scale: scale,
                fillColor: "rgba(66,133,244,0.4)",
                fillOpacity: 0.8,
                strokeWeight: 0,
              });
            }, 50); // speed (ms)
          } else {
            autoLocationMarkerRef.current.shadowMarker.setPosition(latLng);
            autoLocationMarkerRef.current.mainMarker.setPosition(latLng);
          }

          mapRef.current.setCenter(latLng);
          mapRef.current.setZoom(16);
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    }
  }, []);

  let watchId = null;

  const HandlePanToZoom = () => {
  if (!navigator.geolocation) return console.error("Geolocation not supported");

  if (watchId !== null) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };

      if (!autoLocationMarkerRef.current) {
        const shadowMarker = new window.google.maps.Marker({
          position: pos,
          map: mapRef.current,
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
          map: mapRef.current,
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
      if (mapRef.current) {
        mapRef.current.setZoom(24);
        mapRef.current.panTo(pos);
      }
    },
    (err) => console.error("Geolocation error:", err),
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 }
  );
};

const RouteZoom = () => {
  if (!navigator.geolocation) return console.error("Geolocation not supported");

  if (watchId !== null) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };

      // ❌ Do not create any new markers
      if (!autoLocationMarkerRef.current) return; // just exit if markers not exist

      // ✅ Update existing marker position
      autoLocationMarkerRef.current.shadowMarker.setPosition(pos);
      autoLocationMarkerRef.current.mainMarker.setPosition(pos);

      // ✅ Snap to route if it exists
      if (routePath && routePath.length > 0) {
        const snappedPos = snapToRoute(pos, routePath);
        const targetPos = snappedPos || pos;

        // Pan + zoom map to include route + snapped position
        if (mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();
          routePath.forEach((point) => bounds.extend(point));
          bounds.extend(targetPos);
          mapRef.current.fitBounds(bounds);

          // Optional min/max zoom
          const MIN_ZOOM = 16;
          const MAX_ZOOM = 24;
          const newZoom = mapRef.current.getZoom();
          if (newZoom > MAX_ZOOM) mapRef.current.setZoom(MAX_ZOOM);
          if (newZoom < MIN_ZOOM) mapRef.current.setZoom(MIN_ZOOM);
        }
      }
    },
    (err) => console.error("Geolocation error:", err),
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 }
  );
};



  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Mobile: 0 - 767px
      // setIsTablet(width >= 768 && width < 1024); // Tablet: 768 - 1023px
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  return (
    <>
      {!isMobile && (
        <div
          onClick={HandlePanToZoom}
          className="fixed cursor-pointer bottom-40  right-[10px] flex justify-center items-center  z-10 rounded-full   bg-white shadow-md  shadow-black w-[40px] h-[40px] "
        >
         <FontAwesomeIcon icon={faCrosshairs} />
        </div>
      )}
    
      {!isMobile && (
        <div
          onClick={RouteZoom}
          className="fixed bottom-[260px] right-[10px] cursor-pointer flex justify-center items-center 
                  z-10 rounded-full bg-white shadow-lg shadow-gray-600 w-[40px] h-[40px]"
        >
<FontAwesomeIcon icon={["fas", "route"]} />
        </div>
      )}

      <Menu setshowProfile={setshowProfile} />
      {ShowProfile && <ProfileDropdown />}
      <ReportForm
        originInfo={originInfo}
        destinationInfo={destinationInfo}
        onReportSubmit={(newReport) =>
          setReports((prev) => [...prev, newReport])
        }
      />
      <MapSearchBox
        snapToRoute={snapToRoute}
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
        fetchCustomLocations={fetchCustomLocations}
        setRouteInfo={setRouteInfo}
        suggestionMarkersRef={suggestionMarkersRef}
        fetchNearbyGasStations={fetchNearbyGasStations}
        setShowGasStations={setShowGasStations}
        setGasStations={setGasStations}
        map={map}
        showGasStations={showGasStations}
        location={location}
        setIsNavigating={setIsNavigating}
        setDestinationInfo={setDestinationInfo}
        routePath={routePath}
        autoLocationMarkerRef={autoLocationMarkerRef}
        previousSnappedPos={previousSnappedPos}
        userToRoadRef={userToRoadRef}
        setRoutePath={setRoutePath}
        remainingRouteRef={remainingRouteRef}
        setOriginInfo={setOriginInfo}
      />

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={LIBRARIES}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          ref={mapRef}
          center={location || DEFAULT_CENTER} // temporary center
          zoom={8}
          options={{
            minZoom: 4,
            maxZoom: 20,
            styles: wazeCleanCartoonStyle,
            mapTypeControl: false,
            mapTypeId: "terrain",
            disableDefaultUI: false,
            zoomControl: false,
            draggable: true,
            gestureHandling: "greedy", // pan, zoom, rotate sab enable
            rotateControl: true, // rotate button enable
            fullscreenControl: false,
          }}
          onLoad={(mapInstance) => {
            mapRef.current = mapInstance;
            setMap(mapInstance);

            // ✅ apply tilt & rotation after load
            mapInstance.setOptions({
              tilt: 45,
              heading: 90,
            });
          }}
        >
          {mapRef.current && directions && (
            <>
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressPolylines: true,
                  suppressMarkers: true,
                  preserveViewport: true, // camera road ke center me adjust ho
                  polylineOptions: { strokeColor: "#FF0000", strokeWeight: 6 }, // ✅ stop default markers
                }}
              />

              {/* ✅ Custom Destination Marker */}
              {destinationInfo?.location && (
                <Marker
                  position={destinationInfo.location} // original user-selected lat/lng
                />
              )}
            </>
          )}

          {/* Reports se markers show */}
          {reports.map((report, index) => (
            <Marker
              key={index}
              position={{ lat: Number(report.lat), lng: Number(report.lng) }}
              icon={{
                url: "https://img.icons8.com/color/48/policeman-male.png",
                scaledSize: new window.google.maps.Size(20, 20),
              }}
            />
          ))}

          {showGasStations &&
            gasStations.map((place, index) => (
              <Marker
                key={index}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }}
                icon={{
                  url: "https://maps.google.com/mapfiles/kml/shapes/gas_stations.png", // petrol pump icon
                  scaledSize: new window.google.maps.Size(30, 30), // size adjust karna ho to change kar lena
                }}
              />
            ))}

          {selectedLocation && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedLocation.lat),
                lng: parseFloat(selectedLocation.lng),
              }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div>
                <strong>{selectedLocation.name}</strong>
                <br />
                {selectedLocation.address}
                <br />
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

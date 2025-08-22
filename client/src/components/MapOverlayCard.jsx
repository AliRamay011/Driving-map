import React, {  useEffect, useRef, useState} from "react";
import { IoMdMenu } from "react-icons/io";
import { MdMyLocation } from "react-icons/md";
import { GrLocation } from "react-icons/gr";
import { FaSearchLocation, FaMapMarkedAlt } from "react-icons/fa";
import { LuArrowUpDown } from "react-icons/lu";
import { FaLocationCrosshairs } from "react-icons/fa6";
import Sidebar from "./SideBar";
import BottomLocationPanel from "./BottomPlaceCard";
import logo from '../img/logo.jpg'
import L from "leaflet";
import toast from "react-hot-toast";

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
  customLocations ,
   mapInstance,
   setRouteInfo ,
   fetchCustomLocations,

}) {
  // console.log("check" , mapInstance)
  // console.log("Origin Info:", originInfo);
  // console.log("Destination Info:", destinationInfo);
  console.log("custom root location" , setRouteInfo) ;
  

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeInput, setActiveInput] = useState("from");
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
const userMarkerRef = useRef(null);
useEffect(() => {
  fetchCustomLocations()
  // console.log("useeffect customlocation" , customLocations);
  
  if (!inputValue) {
    setSuggestions([]);
    return;
  }

  const service = new window.google.maps.places.AutocompleteService();

  service.getPlacePredictions(
    { input: inputValue },
    (predictions, status) => {
      let googleResults = [];
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        googleResults = predictions.map((p) => ({ ...p, type: "google" }));
      }

      // Access the correct array inside customLocations
       const locArray = Array.isArray(customLocations) ? customLocations : [];




        // console.log("locArray" ,locArray);
        
       // Backend Matches filter
const backendMatches = locArray.filter(
    (loc) =>
      loc.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      loc.address.toLowerCase().includes(inputValue.toLowerCase())
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
      photos: loc.images ? loc.images.split(",") : [], // ✅ yaha split karo
    },
  }));

// console.log("backendmatches", backendMatches);
  //  
      // Typed Text Option
      // const typedOption = {
      //   description: `Use "${inputValue}" as custom location`,
      //   type: "typed",
      //   data: { name: inputValue },
      // };

      // console.log("typed" , typedOption);
      
      setSuggestions([...backendMatches, ...googleResults]);
      
    }

  );
}, [inputValue, customLocations , fetchCustomLocations ]);

   const homeIcon = new L.Icon({
     iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
     iconSize: [35, 35],
     iconAnchor: [17, 35],
     popupAnchor: [0, -30],
   });

 
const selectSuggestion = (suggestion) => {
  setShowSuggestions(false);

  // ===== CUSTOM LOCATION =====
  if (suggestion.type === "custom") {
    const { lat, lng, name, address, description, photos } = suggestion.data || {};
    if (!lat || !lng) {
      console.log("Latitude ya Longitude missing hai is custom location ke liye");
      return;
    }

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

    if (mapInstance?.current) {
      // ❌ Remove previous marker before creating new one
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }

      const marker = new window.google.maps.Marker({
        position: latLng,
        map: mapInstance.current,
        title: customData.name,
        icon: homeIcon,
        draggable: true,
      });

      marker.addListener("dragend", (event) => {
        const newLatLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
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

      userMarkerRef.current = marker;
      mapInstance.current.panTo(latLng);
      mapInstance.current.setZoom(16);
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
  if (!suggestion.place_id) {
    alert("Place ID missing for Google place suggestion");
    return;
  }

  const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
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
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
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
          // ❌ Remove previous marker before creating new one
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
            userMarkerRef.current = null;
          }

          const marker = new window.google.maps.Marker({
            position: latLng,
            map: mapInstance.current,
            title: latLng.name,
            icon: homeIcon,
            draggable: true,
          });

          marker.addListener("dragend", (event) => {
            const newLatLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: newLatLng }, (results, status) => {
              if (status === "OK" && results.length > 0) {
                const address = results[0].formatted_address;
                if (activeInput === "from") {
                  setFrom(address);
                  setFromLocation({ ...latLng, ...newLatLng, address });
                  setInputValue(address);
                } else {
                  setTo(address);
                  setToLocation({ ...latLng, ...newLatLng, address });
                  setInputValue(address);
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

          userMarkerRef.current = marker;
          mapInstance.current.panTo(latLng);
          mapInstance.current.setZoom(16);
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
      } else {
        alert("Failed to get location details. Try again.");
      }
    }
  );
};



const handleKeyDown = (e) => {
  if (e.key === "ArrowDown") {
    setKeyboardIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
  } else if (e.key === "ArrowUp") {
    setKeyboardIndex((prev) => Math.max(prev - 1, 0));
  }
  else if (e.key === "Enter") {
  // ✅ Lat/Lng check
  const latLngMatch = inputValue.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);

  if (latLngMatch) {
    const lat = parseFloat(latLngMatch[1]);
    const lng = parseFloat(latLngMatch[3]);

    const latLngData = { lat, lng };

    // ✅ Input me text waise hi rahe
    if (activeInput === "from") setFrom(inputValue);
    else setTo(inputValue);

    // ✅ Location state route draw ke liye set karo
    if (activeInput === "from") setFromLocation(latLngData);
    else setToLocation(latLngData);

    // ✅ Agar dono locations hain to route draw
    if ((activeInput === "from" ? latLngData : fromLocation) &&
        (activeInput === "to" ? latLngData : toLocation)) {
      onSearch(
        activeInput === "from" ? latLngData : fromLocation,
        activeInput === "to" ? latLngData : toLocation
      );
    }

    // ✅ Bottom panel ke liye address/photos fetch
    handleLatLngInput(lat, lng, activeInput);

    setSuggestions([]);
    setShowSuggestions(false);
    setKeyboardIndex(-1);

    // ✅ Ab yahan return karo taki baaki code execute na ho
    return;
  }

  // 🟢 Baaki existing Enter key code waisa hi rahe
  if (keyboardIndex >= 0 && suggestions[keyboardIndex]) {
    e.preventDefault();
    selectSuggestion(suggestions[keyboardIndex]);
    setInputValue(suggestions[keyboardIndex].description);
    setSuggestions([]);
    setShowSuggestions(false);
    setKeyboardIndex(-1);
  }
}


  else if (e.key === "Escape") {
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

    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.nearbySearch({ location: position, radius: 1000 }, (places, placeStatus) => {
      let name = "Custom Location";
      let photos = [];
      let rating = null;
      let totalRatings = null;

      if (placeStatus === window.google.maps.places.PlacesServiceStatus.OK && places.length > 0) {
        const place = places[0];
        name = place.name || name;
        photos = place.photos?.slice(0, 6).map(p => p.getUrl({ maxWidth: 500, maxHeight: 400 })) || [];
        rating = place.rating || null;
        totalRatings = place.user_ratings_total || null;
      }

      const locationData = { lat, lng, name, address, photos, rating, totalRatings };

      // Marker
      if (mapInstance?.current) {
        if (userMarkerRef.current) userMarkerRef.current.setMap(null);
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: name,
          icon: homeIcon,
          draggable: true,
        });

        marker.addListener("dragend", (event) => {
          handleLatLngInput(event.latLng.lat(), event.latLng.lng());
        });

        userMarkerRef.current = marker;
        mapInstance.current.panTo(position);
        mapInstance.current.setZoom(16);
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
      if ((activeInput === "from" ? locationData : fromLocation) &&
          (activeInput === "to" ? locationData : toLocation)) {
        onSearch(
          activeInput === "from" ? locationData : fromLocation,
          activeInput === "to" ? locationData : toLocation
        );
      }
    });
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
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            const preferred =
              results.find((r) => r.types.includes("street_address")) ||
              results.find((r) => r.types.includes("premise")) ||
              results[0];
            const description = preferred.formatted_address;
            const locationData = { ...latLng, name: description };
              if (activeInput === "from") {
                setFrom(description);
                setFromLocation(locationData);
                setActiveInput(suggestions.description) ;
              } else {
                setTo(description);
                setActiveInput(suggestions.description)
                setToLocation(locationData);
              }
              setSuggestions([]);
              setKeyboardIndex(-1);
              if (onSelect) onSelect(locationData);
            
          } else toast.error("Unable to detect a usable address.");
        });
      },
      (err) => toast.error("Location access denied or failed." , err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showTraffic={showTraffic}
        setShowTraffic={setShowTraffic}
        
      />
     
      <div
        className={`${
          hasRoute
            ? "fixed top-0 bottom-0 left-0 w-[400px] rounded-none p-3"
            : "absolute top-4 left-4 rounded-2xl "
        } bg-white  shadow-lg z-20  transition-all overflow-y-auto overflow-hidden duration-300 py-3 px-2 w-[380px]`}
      >
        {" "}
        <div className="flex items-center gap-20 ml-3 mb-3">
          <button onClick={() => setSidebarOpen(true)}>
            <IoMdMenu className="text-black text-xl font-medium" />
          </button>
          <h1 className="text-xl text-gray-800 text-center font-normal">
            Driving Details
          </h1>
        </div>
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
                  setShowSuggestions(true)
                }}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setActiveInput("from");
                  setInputValue(e.target.value); 
                   setShowSuggestions(true)
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm px-3 text-gray-500  placeholder-gray-300 focus:outline-none "
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
                  setShowSuggestions(true)
                }}
                onChange={(e) => {
                  setTo(e.target.value);
                  setActiveInput("to");
                  setInputValue(e.target.value);
                   setShowSuggestions(true)
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
        <div
          className="mt-2 flex gap-3 items-center px-4 py-4 cursor-pointer border-b"
          onClick={handleChooseLocation}
        >
          <FaLocationCrosshairs className="text-blue-500 text-lg" />
          <span className="text-sm text-gray-600">Your Location</span>
        </div>
   {showSuggestions &&
  [...new Map(suggestions.map(item => [item.description, item])).values()].map(
    (suggestion, index) => (
      <div
        key={suggestion.place_id || suggestion.description || index}
        onMouseDown={() => selectSuggestion(suggestion)}
        className={`p-2 cursor-pointer text-sm transition ${
          index === keyboardIndex ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        {suggestion.type === "custom" && <img src={logo} className="w-4 h-4 absolute right-2" />}
        {suggestion.description}
        <div className="border-b border-gray-200 mt-1" />
      </div>
    )
  )}



        {hasRoute && routeInfo && (
         <BottomLocationPanel
  info={routeInfo}
  routes={routes}
  originInfo={fromLocation || originInfo}       // custom location ya fallback
  destinationInfo={toLocation || destinationInfo} // custom location ya fallback
  panTo={panTo}
/>

        )}
      </div>
    </>
  );
}
export default MapSearchBox;

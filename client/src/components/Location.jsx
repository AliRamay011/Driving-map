import React, { useState, useCallback,  useEffect, useRef, useContext } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  CustomLocationContext } from "./CustomLocationContext";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast from "react-hot-toast";
const DEFAULT_CENTER = { lat: 4.2105, lng: 101.9758 }; 


// ----------------------------- SmallMap Component -----------------------------
const SmallMap = React.memo(
  ({
    marker,
    setMarker,
    setSelectedLocation,
    query,
    setQuery,
    suggestions,
    setSuggestions,
    keyboardIndex,
    setKeyboardIndex,
    mapRef,
    isLoaded,
  }) => {
    const inputRef = useRef(null);
    const autocompleteService = useRef(null);

    // Initialize AutocompleteService only once
    useEffect(() => {
      if (isLoaded && window.google && !autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
            // console.log("AutocompleteService initialized", autocompleteService.current);

      }
    }, [isLoaded]);

    // Fetch suggestions whenever query changes
    useEffect(() => {
      if (!query || !autocompleteService.current) {
        
        setSuggestions([]);
        setKeyboardIndex(-1);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          if (
            status ===
              window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
      //       console.log("Predictions:", predictions);  // <-- yaha dekho suggestions
      // console.log("Status:", status);   
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
          setKeyboardIndex(-1);
        }
      );
    }, [query, setSuggestions, setKeyboardIndex]);

    const selectSuggestion = (suggestion) => {
      if (!suggestion.place_id) return;
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      service.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ["name", "geometry", "formatted_address"],
        },
        (place, status) => {
          if (
            status ===
              window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            const data = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setMarker(data);
            setSelectedLocation(data);
            setQuery(place.formatted_address);

            if (mapRef.current) {
              mapRef.current.panTo(data);
              mapRef.current.setZoom(14);
            }
          }
        }
      );
      setSuggestions([]);
      setKeyboardIndex(-1);
    };
// console.log("seset" , selectSuggestion);

    const handleKeyDown = (e) => {
      if (!suggestions.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (keyboardIndex >= 0) selectSuggestion(suggestions[keyboardIndex]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setKeyboardIndex(-1);
      }
    };

    const onMapClick = useCallback((e) => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarker(pos);
      setSelectedLocation(pos);
    }, [setMarker , setSelectedLocation]);

    const mapContainerStyle = { width: "100%", height: "100%" };
    const mapOptions = {
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      fullscreenControl: true,
    };

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
      <div className="relative w-full h-40 rounded-md overflow-hidden border">
       <input
  ref={inputRef}
  type="text"
  value={query}
  placeholder="Search place or enter lat,lng..."
  onChange={(e) => {
    const val = e.target.value;
    setQuery(val);

    // Check if input is in "lat,lng" format
    const latLngMatch = val.match(
      /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
    );
    if (latLngMatch) {
      const lat = parseFloat(latLngMatch[1]);
      const lng = parseFloat(latLngMatch[3]);
      const pos = { lat, lng };
      setMarker(pos);
      setSelectedLocation(pos);
      if (mapRef.current) {
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(14);
      }
      setSuggestions([]); // hide suggestions
      setKeyboardIndex(-1);
    }
  }}
  onKeyDown={handleKeyDown}
  className="w-60 absolute top-3 z-50 left-4 rounded-md px-3 py-2 border-b border-gray-300 focus:outline-none"
/>


       {suggestions.length > 0 && (
  <ul className="absolute top-[50px] left-4 right-4 max-h-20 max-w-64 overflow-y-auto bg-white border border-gray-300 rounded-md z-50 shadow-md mt-1 text-sm">
    {suggestions.map((s, idx) => (
      <li
        key={s.place_id}
        onMouseDown={() => selectSuggestion(s)}
        className={`px-3 py-1 cursor-pointer ${
          idx === keyboardIndex ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        {s.description}
      </li>
    ))}
  </ul>
)}


       <GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={DEFAULT_CENTER}
  zoom={8}
  options={mapOptions}
  onClick={onMapClick}
  onLoad={(map) => (mapRef.current = map)}
>
  {marker && (
    <Marker
      position={marker}
      draggable={true} // ✅ draggable
      onDragEnd={(e) => {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarker(newPos);
        setSelectedLocation(newPos); // ✅ update state
      }}
    />
  )}
</GoogleMap>

      </div>
    );
  }
);

 const libraries = ["places"];
// ----------------------------- Location -----------------------------
export default function Locations() {
  // const [customLocations, setCustomLocations] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const [locationPopUp, setLocationPopUp] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 24.8607,
    lng: 67.0011,
  });
  const [marker, setMarker] = useState(null);
  const [images, setImages] = useState([]);
  const [currentUpdateId, setCurrentUpdateId] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [update, setUpdate] = useState(false);
  const mapRef = useRef(null);
   const API_URL = import.meta.env.VITE_APP_URL ;
      const { customLocations , fetchCustomLocations } = useContext(CustomLocationContext);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ,
    libraries: libraries,
  });
 
  // Fetch Locations
  // useEffect(() => {
  //   axios
  //     .get(`${API_URL}/api/locations`)
  //     .then((res) => setCustomLocations(res.data.data))
  //     .catch((err) => console.error(err));
  // }, []);

  // ----------------------------- Add Location -----------------------------
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !marker)
      return toast.error(
        "Please fill all required fields & select location"
      );

    const fd = new FormData();
    fd.append("name", name);
    fd.append("address", address);
    fd.append("description", description);
    fd.append("latitude", marker.lat);
    fd.append("longitude", marker.lng);
    fd.append("category", category);
    fd.append("keywords", keywords);
    images.forEach((file) => fd.append("images", file));
// console.log(images.forEach((file) => fd.append("images", file)));

    try {
      const res = await fetch(`${API_URL}/api/places`, {
        method: "POST",
        body: fd,
      });
      console.log(res, "response images");
      
      // const data = await res.json();
       const data = await res.json().catch(() => ({})); // safe parse
  console.log(data, "response images"); // yeh JSON print karega
      if (!res.ok) throw new Error(data?.error || "Failed");
      fetchCustomLocations()
      toast.success("Place added successfully!");
      setName("");
      setAddress("");
      setDescription("");
      setMarker(null);
      setImages([]);
      setPreviewUrls([]);
      setLocationPopUp(false);
      // const updated = await axios.get(`${API_URL}/api/locations`);
      // customLocations(updated.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Error adding place");
    }
  };

  // ----------------------------- Delete -----------------------------
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/places/${id}`);
      if (res.data.success) {
        fetchCustomLocations()
        toast.success("Deleted successfully!");
        // setCustomLocations((prev) => prev.filter((loc) => loc.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting location");
    }
  };

  // ----------------------------- Edit/Update -----------------------------
  const EditUpdate = (loc) => {
    setCurrentUpdateId(loc.id);
    setName(loc.name || "");
    setAddress(loc.address || "");
    setDescription(loc.description || "");
    setMarker({ lat: Number(loc.latitude), lng: Number(loc.longitude) });
    setSelectedLocation({ lat: Number(loc.latitude), lng: Number(loc.longitude) });
    setUpdate(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !marker || !currentUpdateId) {
      toast.error("Please fill all required fields and select a location");
      return;
    }

    const updatedData = {
      name,
      address,
      description,
      latitude: marker.lat,
      longitude: marker.lng,
    };

    try {
      const res = await axios.put(
        `${API_URL}/api/update/${currentUpdateId}`,
        updatedData
      );
      if (res.data.success) {
        toast.success("Location updated successfully!");
        fetchCustomLocations()
        // setCustomLocations((prev) =>
        // //   prev.map((loc) =>
        // //     loc.id === currentUpdateId ? { ...loc, ...updatedData } : loc
        // //   )
        // // );
        setUpdate(false);
      } else {
        toast.error("Failed to update location");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Server error while updating location"
      );
    }
  };

 const [category, setCategory] = useState(""); // Dropdown
  const [keywords, setKeywords] = useState("");
 
    


  // ----------------------------- Render -----------------------------
  return (
    <div className="flex bg-gray-50 h-[100vh] w-full">  
    <div className="w-full">
          {/* Add Location */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Add Location</CardTitle>
                <button
                  onClick={() => setLocationPopUp(true)}
                  className="bg-black w-36 h-10 rounded-md text-white"
                >
                  Add Location
                </button>
              </div>

              {locationPopUp && (
                <div className="fixed top-0  inset-0 bg-black/40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-2xl shadow-lg w-[460px] max-h-[640px] p-1 relative">
                    <div className="flex justify-between items-center mb-2 sticky top-0 p-6 bg-white">
                      <h2 className="text-[22px] font-semibold text-black">
                        Add Missing Place
                      </h2>
                      <button
                        onClick={() => setLocationPopUp(false)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <IoMdClose size={26} />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5 overflow-y-auto h-[470px] py-4 px-6"
                      encType="multipart/form-data"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Place Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Place name"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Full address"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add description (optional)"
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                     <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Category *
  </label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    required
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Category</option>
    <option value="shop">Shop</option>
    <option value="restaurant">Restaurant</option>
    <option value="office">Office</option>
    <option value="other">Other</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Keywords
  </label>
  <input
    type="text"
    value={keywords}
    onChange={(e) => setKeywords(e.target.value)}
    placeholder="Comma-separated keywords, e.g., cafe, wifi"
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Location on Map *
                        </label>
                        <SmallMap
                          marker={marker}
                          selectedLocation={selectedLocation}
                          setMarker={setMarker}
                          setSelectedLocation={setSelectedLocation}
                          query={query}
                          setQuery={setQuery}
                          suggestions={suggestions}
                          setSuggestions={setSuggestions}
                          keyboardIndex={keyboardIndex}
                          setKeyboardIndex={setKeyboardIndex}
                          mapRef={mapRef}
                          isLoaded={isLoaded}
                        />
                        {marker && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Add Photos
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="w-full"
                        />
                        {previewUrls.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {previewUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`preview-${idx}`}
                                className="w-full h-16 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
                      >
                        Submit Place
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Table */}
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customLocations.length > 0 ? (
                      customLocations.map((loc, index) => (
                        <tr key={loc.id || index}>
                          <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900">{loc.category}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{loc.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{loc.address}</td>
                          <td className="px-4 py-3 text-sm text-center space-x-2">
                            <button onClick={() => EditUpdate(loc)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(loc.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">No locations added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Update Modal */}
                {update && (
                 <div className="fixed top-0  inset-0 bg-black/40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-2xl shadow-lg w-[460px] max-h-[640px] p-1 relative">
                    <div className="flex justify-between items-center mb-2 sticky top-0 p-6 bg-white">
                      <h2 className="text-[22px] font-semibold text-black">
                        Add Missing Place
                      </h2>
                      <button
                        onClick={() => setLocationPopUp(false)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <IoMdClose size={26} />
                      </button>
                    </div>

                    <form
                      onSubmit={handleUpdateSubmit}
                      className="space-y-5 overflow-y-auto h-[470px] py-4 px-6"
                      encType="multipart/form-data"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Place Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Place name"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Full address"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add description (optional)"
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                     <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Category *
  </label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    required
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Category</option>
    <option value="shop">Shop</option>
    <option value="restaurant">Restaurant</option>
    <option value="office">Office</option>
    <option value="other">Other</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Keywords
  </label>
  <input
    type="text"
    value={keywords}
    onChange={(e) => setKeywords(e.target.value)}
    placeholder="Comma-separated keywords, e.g., cafe, wifi"
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Location on Map *
                        </label>
                        <SmallMap
                          marker={marker}
                          selectedLocation={selectedLocation}
                          setMarker={setMarker}
                          setSelectedLocation={setSelectedLocation}
                          query={query}
                          setQuery={setQuery}
                          suggestions={suggestions}
                          setSuggestions={setSuggestions}
                          keyboardIndex={keyboardIndex}
                          setKeyboardIndex={setKeyboardIndex}
                          mapRef={mapRef}
                          isLoaded={isLoaded}
                        />
                        {marker && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Add Photos
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="w-full"
                        />
                        {previewUrls.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {previewUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`preview-${idx}`}
                                className="w-full h-16 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
                      >
update                      </button>
                    </form>
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}

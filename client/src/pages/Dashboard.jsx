import React, { useState, useCallback,  useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast from "react-hot-toast";

// ----------------------------- SmallMap Component -----------------------------
const SmallMap = React.memo(
  ({
    marker,
    selectedLocation,
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
            console.log("AutocompleteService initialized", autocompleteService.current);

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
            console.log("Predictions:", predictions);  // <-- yaha dekho suggestions
      console.log("Status:", status);   
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
    }, []);

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
          placeholder="Search place..."
         onChange={(e) => {
    console.log("Input changed:", e.target.value);
    setQuery(e.target.value);
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
          center={selectedLocation}
          zoom={14}
          options={mapOptions}
          onClick={onMapClick}
          onLoad={(map) => (mapRef.current = map)}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>
    );
  }
);

 const libraries = ["places"];
// ----------------------------- Dashboard -----------------------------
export default function Dashboard() {
  const [customLocations, setCustomLocations] = useState([]);
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

 
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY",
    libraries: libraries,
  });

  // Fetch Locations
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/locations")
      .then((res) => setCustomLocations(res.data.data))
      .catch((err) => console.error(err));
  }, []);

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
    images.forEach((file) => fd.append("images", file));

    try {
      const res = await fetch("http://localhost:5000/api/places", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      toast.success("Place added successfully!");
      setName("");
      setAddress("");
      setDescription("");
      setMarker(null);
      setImages([]);
      setPreviewUrls([]);
      setLocationPopUp(false);
      const updated = await axios.get("http://localhost:5000/api/locations");
      setCustomLocations(updated.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Error adding place");
    }
  };

  // ----------------------------- Delete -----------------------------
  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/places/${id}`);
      if (res.data.success) {
        toast.success("Deleted successfully!");
        setCustomLocations((prev) => prev.filter((loc) => loc.id !== id));
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
        `http://localhost:5000/api/update/${currentUpdateId}`,
        updatedData
      );
      if (res.data.success) {
        toast.success("Location updated successfully!");
        setCustomLocations((prev) =>
          prev.map((loc) =>
            loc.id === currentUpdateId ? { ...loc, ...updatedData } : loc
          )
        );
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

  // ----------------------------- Render -----------------------------
  return (
    <div className="flex bg-gray-50 h-[100vh]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="py-[22px] px-4 text-xl font-bold border-b">Waze <span className="text-sm text-green-700"> Dashboard
          </span>  </div>
        <nav className="p-4 space-y-3">
          <Button variant="ghost" className="w-full justify-start">
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Avatar>
            <AvatarImage src="https://via.placeholder.com/40" alt="User" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </header>

        <main className="p-6 space-y-6">
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
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
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
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customLocations.length > 0 ? (
                      customLocations.map((loc, index) => (
                        <tr key={loc.id || index}>
                          <td className="px-4 py-3 text-sm text-gray-700">{loc.id || index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{loc.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{loc.address}</td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loc.status === "Completed" ? "bg-green-100 text-green-800" : loc.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{loc.status}</span>
                          </td>
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
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-[460px] max-h-[640px] p-1 relative">
                      <div className="flex justify-between items-center mb-2 sticky top-0 p-6 bg-white">
                        <h2 className="text-[22px] font-semibold text-black">Update Place</h2>
                        <button onClick={() => setUpdate(false)} className="text-gray-600 hover:text-gray-900">
                          <IoMdClose size={26} />
                        </button>
                      </div>

                      <form onSubmit={handleUpdateSubmit} className="space-y-5 overflow-y-auto h-[470px] py-4 px-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Place Name *</label>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add description (optional)" rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map *</label>
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
                          {marker && <p className="mt-2 text-sm text-gray-600">Selected: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</p>}
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md">Update</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

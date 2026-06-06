import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Marker } from "@react-google-maps/api";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell} from '@fortawesome/free-solid-svg-icons';



const ReportForm = ({ onReportSubmit }) => {
  const [distanceType, setDistanceType] = useState("100"); // default 100 meters
  const [customDistance, setCustomDistance] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [heading, setHeading] = useState(null);
  const [reports, setReports] = useState([]);
  const [showform , setShowForm] = useState(true);
  const API_URL = import.meta.env.VITE_APP_URL;


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
  // ✅ Get current user location
 useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
      setHeading(pos.coords.heading || 0); // fallback 0
      console.log("User Location:", pos.coords.latitude, pos.coords.longitude, pos.coords.heading);
    },
    (err) => console.error("Error:", err)
  );
}, []);

// function calculateOffset(lat, lng, heading, side, distanceMeters) {
//   if (!lat || !lng) return { lat, lng };
//   if (!heading) heading = 0;

//   let angle = heading;
//   if (side === "left") angle = heading - 90;
//   else if (side === "right") angle = heading + 90;
//   else if (side === "center") angle = heading;

//   const rad = (Math.PI / 180) * angle;
//   const R = 6378137;

//   const newLat = lat + (distanceMeters * Math.cos(rad)) / R * (180 / Math.PI);
//   const newLng =
//     lng +
//     (distanceMeters * Math.sin(rad)) /
//       (R * Math.cos(lat * Math.PI / 180)) *
//       (180 / Math.PI);

//   return { lat: newLat, lng: newLng };
// }
console.log("Marker report:", reports);



// --- helpers ---
const EARTH_R = 6378137;

function movePoint(lat, lng, bearingDeg, distM) {
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const dr = distM / EARTH_R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(br)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

function haversineM(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sLat1 = (a.lat * Math.PI) / 180;
  const sLat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(sLat1) * Math.cos(sLat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

function bearingDeg(a, b) {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const λ1 = (a.lng * Math.PI) / 180;
  const λ2 = (b.lng * Math.PI) / 180;
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  let θ = (Math.atan2(y, x) * 180) / Math.PI;
  if (θ < 0) θ += 360;
  return θ;
}

// Snap a straight path (current -> forwardGuess) to road,
// then pick point exactly at `distM` along the snapped polyline.
// side: "center" | "left" | "right"
async function snapForwardAlongRoad({ start, headingDeg, distM, side = "center", apiKey }) {
  // 1) forward guess (overshoot little so polyline has length)
  const forwardGuess = movePoint(start.lat, start.lng, headingDeg, Math.max(distM + 40, 70));

  // 2) snap that 2-point path to roads with interpolation
  const url =
    `https://roads.googleapis.com/v1/snapToRoads` +
    `?path=${start.lat},${start.lng}|${forwardGuess.lat},${forwardGuess.lng}` +
    `&interpolate=true&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.snappedPoints || data.snappedPoints.length < 2) {
    // fallback: straight geodesic from start
    const fallback = movePoint(start.lat, start.lng, headingDeg, distM);
    return fallback;
  }

  // 3) build polyline points in order
  const pts = data.snappedPoints.map(p => ({
    lat: p.location.latitude,
    lng: p.location.longitude,
  }));

  // 4) walk along polyline to find exact distM
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const segLen = haversineM(pts[i - 1], pts[i]);
    if (acc + segLen >= distM) {
      // position falls on this segment → interpolate by distance
      const remain = distM - acc;
      const segBearing = bearingDeg(pts[i - 1], pts[i]);
      let centerPoint = movePoint(pts[i - 1].lat, pts[i - 1].lng, segBearing, remain);

      // 5) left/right lateral offset (small, stays visually on road side)
      if (side !== "center") {
        const perp =
          side === "left" ? segBearing - 90 : segBearing + 90;
        const laneOffsetM = 4; // tweak: 3–5m looks good
        centerPoint = movePoint(centerPoint.lat, centerPoint.lng, perp, laneOffsetM);
      }

      return centerPoint;
    }
    acc += segLen;
  }

  // If polyline shorter than distM, use last point (still along same road)
  let last = pts[pts.length - 1];
  if (side !== "center") {
    const segBearing = bearingDeg(pts[pts.length - 2], pts[pts.length - 1]);
    const perp = side === "left" ? segBearing - 90 : segBearing + 90;
    last = movePoint(last.lat, last.lng, perp, 4);
  }
  return last;
}

  // ✅ Submit Report
 // ✅ Submit Report
const handleSubmit = async (e) => {
  e.preventDefault();

   const distance = distanceType === "custom" ? Number(customDistance) : Number(distanceType);
  const side = e.target.direction.value;

 const safeHeading = Number.isFinite(heading) ? heading : 0;

  // 👉 exactly same-road-ahead target (ignores side streets)
  const target = await snapForwardAlongRoad({
    start: { lat: latitude, lng: longitude },
    headingDeg: safeHeading,
    distM: distance,
    side,
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const reportData = {
    type: e.target.type.value,
    distance_meters: distance,
    side,
    description: e.target.notes.value,
    latitude: target.lat,
    longitude: target.lng,
    valid_till: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

try {
    const response = await axios.post(`${API_URL}/api/report`, reportData);

    // marker add
    setReports(prev => [...prev, { lat: target.lat, lng: target.lng, type: reportData.type }]);

    if (onReportSubmit) {
      onReportSubmit({ ...response.data, lat: target.lat, lng: target.lng });
    }

    setShowForm(false);
    toast.success("Report submitted successfully!");
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("Failed to submit report.");
  }
   
};


  return (

 <>

{reports.map((r, i) => (
  <Marker
    key={i}
    position={{ lat: r.lat, lng: r.lng }}
    icon={{
      url: "https://img.icons8.com/color/48/policeman-male.png",
      scaledSize: new window.google.maps.Size(40, 40),
    }}
  />
))}




   
 {!isMobile  && (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed top-4 right-56 z-10 bg-white  text-black rounded-md shadow-md ">
          Report        <FontAwesomeIcon className="text-black" icon={faBell} />       
        </Button>
      </DialogTrigger>
    {showform && (
    
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Incident</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div>
            <Label>Report Type</Label>
            <Select name="type" defaultValue="police">
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accident">🚗 Accident</SelectItem>
                <SelectItem value="police">🚔 Traffic Police</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div>
            <Label>Distance (meters)</Label>
            <Select value={distanceType} onValueChange={(val) => setDistanceType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 meters</SelectItem>
                <SelectItem value="100">100 meters</SelectItem>
                <SelectItem value="200">200 meters</SelectItem>
                <SelectItem value="300">300 meters</SelectItem>
                <SelectItem value="500">500 meters</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {distanceType === "custom" && (
              <Input
                type="number"
                min="0"
                max="500"
                step="1"
                placeholder="Enter custom meters"
                value={customDistance}
                onChange={(e) => setCustomDistance(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Direction */}
          <div>
            <Label>Direction</Label>
            <RadioGroup
              defaultValue="center"
              name="direction"
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="center" />
                <Label htmlFor="center">Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" />
                <Label htmlFor="right">Right</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea name="notes" placeholder="Add details here..." />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Report
          </Button>
        </form>
      </DialogContent>
    
)}
</Dialog>
     )}
     {isMobile &&(
          <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-[160px] right-[10px] z-10  w-[40px] h-[40px] shadow-lg shadow-gray-600 bg-white hover:bg-red-700 text-[25px] rounded-full">
<FontAwesomeIcon className="text-black" icon={faBell} />         
  

        </Button>
      </DialogTrigger>
    {showform && (
    
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Incident</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div>
            <Label>Report Type</Label>
            <Select name="type" defaultValue="police">
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accident">🚗 Accident</SelectItem>
                <SelectItem value="police">🚔 Traffic Police</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div>
            <Label>Distance (meters)</Label>
            <Select value={distanceType} onValueChange={(val) => setDistanceType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 meters</SelectItem>
                <SelectItem value="100">100 meters</SelectItem>
                <SelectItem value="200">200 meters</SelectItem>
                <SelectItem value="300">300 meters</SelectItem>
                <SelectItem value="500">500 meters</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {distanceType === "custom" && (
              <Input
                type="number"
                min="0"
                max="500"
                step="1"
                placeholder="Enter custom meters"
                value={customDistance}
                onChange={(e) => setCustomDistance(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Direction */}
          <div>
            <Label>Direction</Label>
            <RadioGroup
              defaultValue="center"
              name="direction"
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="center" />
                <Label htmlFor="center">Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" />
                <Label htmlFor="right">Right</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea name="notes" placeholder="Add details here..." />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Report
          </Button>
        </form>
      </DialogContent>
    
)}
</Dialog>
     )}
  </>
)};

export default ReportForm;

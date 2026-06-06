import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function PhotoSlider({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return <p className="text-gray-400 text-sm mb-2">No photos</p>;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-56 sm:h-64 mb-4">
      <img
        src={photos[currentIndex]}
        alt="No Photos"
        className="w-full  h-full object-cover rounded-md "
      />

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
      >
        <FaChevronLeft />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
        {photos.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-blue-600" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

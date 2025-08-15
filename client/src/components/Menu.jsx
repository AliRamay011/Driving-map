import React, { useState } from "react";
import menu from "../img/dots-menu.png";
import dots from "../img/dots.png";
import map from "../img/live-map.png";
import edit from "../img/edit-icon.png";
import msg from "../img/msg.png";
import web from "../img/web.png";
import partner from "../img/partner.png";
import Button from "./button";
function Menu() {
  const [isopen, setIsOpen] = useState(false);
 
 
  return (
    <>
      <div
        className="fixed menus top-4 z-10 right-[165px] shadow-lg shadow-gray-500 bg-white rounded-full w-10 h-10 flex justify-center items-center"
        onClick={() => setIsOpen(isopen === "menus" ? null : "menus")}
        checked={isopen}
      >
        <img src={menu} className="w-[16px] h-[16px]" alt="" />
        <div
          className={`w-[240px] h-[300px] bg-white fixed top-[60px] z-50  right-[184px] shadow-md shadow-gray-700 rounded-xl ${
            isopen === "menus"? "flex" : "hidden"
          } `}
        >
            <div className="block">
          <div className="flex items-center w-[240px] px-5 ">
            {/* Image section */}
            <div className="  w-[35px]  flex-shrink-0 flex items-center justify-center">
              <img
                src={map}
                alt="Live Map"
                className="flex  justify-center items-center"
              />
            </div>

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-6">
              <span className="text-[15px] font-medium text-gray-800 leading-none">
                Live Map
              </span>
              <hr className="mt-4 border-gray-300" />
            </div>
          </div>
          <div className="flex items-center w-[240px] px-5 ">
            {/* Image section */}
            <div className="w-[35px]  flex-shrink-0 flex items-center justify-center">
              <img
                src={edit}
                alt="Live Map"
                className="flex  justify-center items-center"
              />
            </div>

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-6">
              <span className="text-[15px] font-medium text-gray-800 leading-none">
                Map Editor
              </span>
              <hr className="mt-4 border-gray-300" />
            </div>
          </div>
          <div className="flex items-center w-[240px] px-5 ">
            {/* Image section */}
            <div className="w-[35px]  flex-shrink-0 flex items-center justify-center">
              <img
                src={msg}
                alt="Live Map"
                className="flex  justify-center items-center"
              />
            </div>

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-6">
              <span className="text-[15px] font-medium text-gray-800 leading-none">
                Forums
              </span>
              <hr className="mt-4 border-gray-300" />
            </div>
          </div>
          <div className="flex items-center w-[240px] px-5 ">
            {/* Image section */}
            <div className="w-[35px]  flex-shrink-0 flex items-center justify-center">
              <img
                src={web}
                alt="Live Map"
                className="flex  justify-center items-center"
              />
            </div>

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-6">
              <span className="text-[15px] font-medium text-gray-800 leading-none">
                WazeOpedia
              </span>
              <hr className="mt-4 border-gray-300" />
            </div>
          </div>
          <div className="flex items-center w-[240px] px-5 ">
            {/* Image section */}
            <div className="w-[35px]  flex-shrink-0 flex items-center justify-center">
              <img
                src={partner}
                alt="Live Map"
                className="flex  justify-center items-center"
              />
            </div>

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-6">
              <span className="text-[15px] font-medium text-gray-800 leading-none">
                Partner hub
              </span>
             
            </div>
          </div>
          </div>
        </div>
      </div>
      <div className="fixed top-4 z-10 dots right-[115px] bg-white shadow-lg shadow-gray-500 rounded-full w-10 h-10 flex justify-center items-center " onClick={() => setIsOpen(isopen === "dots" ? null : "dots")}>
        <img src={dots} className="w-[20px] h-[20px]" alt="" />
          <div
          className={`w-[170px] h-[80px] bg-white fixed top-[60px] z-50  right-[136px] shadow-md shadow-gray-700 rounded-xl ${
            isopen === "dots" ? "flex" : "hidden"
          } `}
        >
            <div className="block">
          <div className="flex items-center px-3 ">

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-4">
              <span className="text-[15px]  text-gray-800 leading-none">
                Help center
              </span>
            </div>
          </div>
          <div className="flex items-center px-3 ">
        

            {/* Text section */}
            <div className="ml-3 flex flex-col justify-center w-full mt-4">
              <span className="text-[15px]  text-gray-800 leading-none">
                Report an issue
              </span>
             
            </div>
          </div>
         
          </div>
        </div>
      </div>
      <Button/>
    </>
  );
}

export default Menu;

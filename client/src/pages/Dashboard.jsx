import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Overview from "../components/Overview";
import User from "../components/User";
import Location from "../components/Location";
import Setting from "../components/Setting";

function Dashboard() {

   const  links =[
       {  name:"Overview" } ,
       {  name:"User" } , 
       {  name:"Add Location" } ,
       {  name:"Setting" }
  ]

  const [activePage , setActivePage] = useState("overview")
 
     const renderContent = () => {

       switch (activePage) {
          case "user" : return <User/>
          case "add location" : return <Location/>
          case "setting" : return <Setting/>
       
        default:
         return <Overview/>
       }
     }
  return (
   <>

    <div className="flex relative bg-gray-50 h-[100vh] w-full">
         {/* Sidebar */}
         <aside className="sticky z-30 top-0 left-0 bottom-0 right-0 w-64 bg-white border-r shadow-sm">
           <div className="py-[22px] px-4 text-xl font-bold border-b">Waze <span className="text-sm text-green-700"> Dashboard
             </span>  </div>
                 <ul>
                   {links.map((link , i ) =>(
                         <li key={i}
                           onClick={() => setActivePage(link.name.toLowerCase())}
                            className={`flex items-center gap-3 px-4 py-2  cursor-pointer transition ${
                   activePage === link.name.toLowerCase()
                     ? "bg-indigo-100 text-indigo-700 font-semibold"
                     : "text-gray-700 hover:bg-gray-100"
                 }`}>
                             <span>{link.name}</span>
                         </li> 
                   ))}
                 </ul>
         </aside>
   
         {/* Main */}
         <div className="flex-1 flex flex-col">
           <header className="sticky z-40 top-0   right-0  flex items-center justify-between p-4 bg-white border-b shadow-sm">
             <h1 className="text-xl font-semibold">Waze</h1>
             <Avatar>
               <AvatarImage src="https://via.placeholder.com/40" alt="User" />
               <AvatarFallback>AK</AvatarFallback>
             </Avatar>
           </header>
   
           <main className="p-6 space-y-6 overflow-y-auto" >
             {/* ............. main .......... */}

             {renderContent()}
          
            
           </main>
         </div>
       </div>
   </>
  )
}

export default Dashboard
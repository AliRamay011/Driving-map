import React, { useState } from "react";
import {  motion ,AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";
import {useNavigate } from "react-router-dom";



export default function VIPLogoutButton({username = "VIP User", avatar = null, className = "" }) {
  const [open, setOpen] = useState(false);
   const navigate = useNavigate(); // ✅

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ remove token
    navigate("/");               // ✅ redirect to login
  };
  return (
    <div className={`fixed left-0 bottom-[1px] ${className}`}>
      {/* Floating VIP logout pill */}
    <motion.button
  onClick={() => setOpen(true)}
  aria-haspopup="dialog"
  className="group relative flex items-center gap-[13px]  px-[17px] py-2  bg-zinc-200 border-t-[1px] border-b-[1px]"
>
  <div className="flex items-center gap-3">
    <div className="p-1 rounded-full bg-black/60 backdrop-blur-sm border border-black/15">
      <LogOut className="w-5 h-5 text-white" />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-black font-semibold text-sm">Logout</span>
      <span className="text-black text-xs">
        Signed in as <span className="font-medium">{username}</span>
      </span>
    </div>
  </div>

  {/* Optional VIP badge */}
  <div className="ml-3 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs font-semibold tracking-tight">
    VIP
  </div>

  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-20 bg-white/10 pointer-events-none mix-blend-screen transition-opacity" />
</motion.button>


      {/* Confirmation Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end md:items-center justify-center p-4 z-50"
            aria-hidden={!open}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md mx-auto rounded-2xl bg-gradient-to-tr from-white/5 to-black/60 border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/90" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-semibold">Ready to sign out?</h3>
                  <p className="text-sm text-white/80">You are signed in as <span className="font-medium">{username}</span>. Confirm to log out of your account.</p>
                </div>

                <div className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-300/20 text-yellow-100 font-semibold">VIP</div>
              </div>

              <div className="mt-5 flex gap-3 justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/6 text-white/80 hover:bg-white/6 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleLogout()}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:brightness-105 shadow-md"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

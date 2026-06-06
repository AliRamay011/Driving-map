import LoginModal from "./login";
import { useAuth } from "../components/CustomLocationContext";

function Button({ setshowProfile, setshowButton }) {
  console.log(setshowProfile, "profile show");
  const { showPopup, setShowPopUp } = useAuth();

  

  return (
    <>
         
        <>
          <div className="fixed top-4 z-20 right-6 ">
            <button
              onClick={() => setShowPopUp(true)}
              className="w-20 h-10 capitalize text-white bg-blue-500 rounded-full"
            >
              login
            </button>
          </div>
          <LoginModal
            setshowProfile={setshowProfile}
            setshowButton={setshowButton}
            isOpen={showPopup}
            onClose={() => setShowPopUp(false)}
          />
        </>
      
          
    </>
  );
}

export default Button;

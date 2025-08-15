import { useState } from 'react';
import LoginModal from './login'


function Button() {

  const [showPopup , setShowPopUp] = useState(false) ;

  return (
    <>
     <div className="fixed top-4 z-10 right-6 ">
        <button onClick={() => setShowPopUp(true)} className='w-20 h-10 capitalize text-white bg-blue-500 rounded-full'>
            login
        </button>
     </div>
     <LoginModal  isOpen={showPopup} onClose={ () => setShowPopUp(false)}/>
    </>
  )
}

export default Button
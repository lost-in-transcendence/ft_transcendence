import { useEffect, useState } from 'react'
import '../App.css'
import Navbar from './Navbar/Navbar'
import Login from './Login/Login'

import './Draft.css'

 function Draft()
 {
  const [chatIsExpanded, setChatIsExpanded] = useState(true);
  return (
    <>
      <Login />
      <Navbar chatIsExpanded={chatIsExpanded} clickHandler={setChatIsExpanded} />
      <div className="wrapper">
        <div className="game">

        </div>
        {
          chatIsExpanded &&
          <div className="chat">

          </div>
        }
      </div>
    </>
  )
 }

export default Draft
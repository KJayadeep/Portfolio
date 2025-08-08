import { useState,useRef} from 'react';
import React from 'react';
import Jd from '../assets/Untitled (91 x 50 px).svg'
import '../css/nav.css'
import '../css/About.css'

function Nav(){

    const [isOpen,setIsOpen] = useState(false);
    const menuRef = useRef(null)

    function handleMenu(){
        setIsOpen(!isOpen);
        if (menuRef.current) {
            menuRef.current.style.right = isOpen ? "-100vw" : "0";
        }
        
    }

    return(
        <nav>
            <div className='logo'>
                <img src={Jd} alt='JD'/>
            </div>
            
            <div  onClick={handleMenu} className='menu'>
                <div className='bar-1'></div>
                <div className='bar-2'></div>
                <div className='bar-3'></div>
            </div>
            <div className='side-menu' ref={menuRef}>
                <div className='logo2'>
                    <img src={Jd} alt='JD'/>
                    <div  onClick={handleMenu} className='menu'>
                        <div className='bar-1'></div>
                        <div className='bar-2'></div>
                        <div className='bar-3'></div>
                    </div>
                </div>
                <div className="cont">
                    <ul onClick={handleMenu}>
                        <li>Home</li>
                        <li><a href="#About-container" >About</a></li>
                        <li><a href="#Skills-container" >Skills</a></li>
                        <li>Contact</li>
                    </ul>
                    <div className='list'>
                        <h2>ADDRESS</h2>
                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestias incidunt porro repudiandae facilis voluptates maxime reiciendis itaque similique, dignissimos quae dolor harum, ut magnam quisquam accusamus eum dolore nostrum. Non?</p>
                        <h2>EMAIL</h2>
                        <p>jayadeep988@gmail.com</p>
                        <h3>CONTACT</h3>
                        <p>+91 8520868967</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Nav
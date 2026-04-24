import '../css/Contact.css'
import React from 'react'

function Contact(){
    return(
        <div id="contact">
            <h1 className='title'>Contact</h1>
            <div className="contact-content">
                <p>Get in touch with me!</p>
                <div className="contact-info">
                    <div className="contact-item">
                        <h3>Email</h3>
                        <p>your.email@example.com</p>
                    </div>
                    <div className="contact-item">
                        <h3>Phone</h3>
                        <p>+91 1234567890</p>
                    </div>
                    <div className="contact-item">
                        <h3>Location</h3>
                        <p>Your City, Country</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;

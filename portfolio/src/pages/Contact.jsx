import '../css/Contact.css'
import React from 'react'

function Contact(){
    return(
        <div id="contact">
            <div className="contact-content">
                <h3>Jaya Deep Kundrapu</h3>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate. Voluptas, voluptate.</p>
                <div className="social-links">
                    <a href="#" className="social-link">GitHub</a>
                    <a href="#" className="social-link">LinkedIn</a>
                    <a href="#" className="social-link">Gmail</a>
                </div>
            </div>
            <footer className="footer">
                <p>&copy; 2026 Jaya Deep Kundrapu. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Contact;

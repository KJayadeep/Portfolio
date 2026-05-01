import { useState, useRef, useEffect } from 'react';
import React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import '../css/nav.css'
import '../css/About.css'

function Nav(){

    const [isOpen,setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const logoRef = useRef(null);
    const logoRef2 = useRef(null);

    function handleMenu(){
        setIsOpen(!isOpen);
        if (menuRef.current) {
            menuRef.current.style.right = isOpen ? "-100vw" : "0";
        }

    }

    // Setup 3D logo with cursor tracking
    useEffect(() => {
        const setupLogo = (container) => {
            if (!container) return;

            // Clear existing content
            container.innerHTML = '';

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
            camera.position.z = 5;

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(100, 100);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Load GLB model
            const loader = new GLTFLoader();
            loader.load('/src/assets/jd3.0 copy.glb', (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                model.rotation.y = Math.PI;
                scene.add(model);

                // Track mouse movement for hover effect
                container.addEventListener('mousemove', (e) => {
                    const rect = container.getBoundingClientRect();
                    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                    model.rotation.y = Math.PI + mouseX * 0.5;
                    model.rotation.x = -mouseY * 0.5;
                });

                container.addEventListener('mouseleave', () => {
                    model.rotation.y = Math.PI;
                    model.rotation.x = 0;
                });
            });

            const animate = () => {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            };
            animate();
        };

        if (logoRef.current) setupLogo(logoRef.current);
        if (logoRef2.current) setupLogo(logoRef2.current);
    }, []);

    return(
        <nav>
            <div className='logo' ref={logoRef}></div>

            <div onClick={handleMenu} className={`menu ${isOpen ? 'open' : ''}`}>
                <div className='bar-1'></div>
                <div className='bar-2'></div>
                <div className='bar-3'></div>
            </div>
            <div className='side-menu' ref={menuRef}>
                <div className='logo2'>
                    <div ref={logoRef2} style={{ width: '100px', height: '100px' }}></div>
                    <div onClick={handleMenu} className={`menu ${isOpen ? 'open' : ''}`}>
                        <div className='bar-1'></div>
                        <div className='bar-2'></div>
                        <div className='bar-3'></div>
                    </div>
                </div>
                <div className="cont">
                    <ul onClick={handleMenu}>
                        <li><a href="#">Home</a></li>
                        <li><a href="#about" >About</a></li>
                        <li><a href="#skills" >Skills</a></li>
                        <li><a href="#contact">Contact</a></li>
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
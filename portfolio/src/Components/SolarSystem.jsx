import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import spaceTexture from "../assets/beautiful-milky-way-night-sky.jpg"; // Add a high-quality galaxy image

const SolarSystem = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load Space Texture (Galaxy)
    const spaceBgTexture = new THREE.TextureLoader().load(spaceTexture);
    scene.background = spaceBgTexture;

    // Create Sun
    const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 1.5 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets data
    const planets = [
      { name: "Mercury", size: 0.6, color: 0xaaaaaa, distance: 7, speed: 0.2, link: "https://en.wikipedia.org/wiki/Mercury_(planet)" },
      { name: "Venus", size: 0.9, color: 0xff9933, distance: 10, speed: 0.15, link: "https://en.wikipedia.org/wiki/Venus" },
      { name: "Earth", size: 1.2, color: 0x3366ff, distance: 14, speed: 0.1, link: "https://en.wikipedia.org/wiki/Earth" },
      { name: "Mars", size: 0.8, color: 0xff3300, distance: 18, speed: 0.07, link: "https://en.wikipedia.org/wiki/Mars" },
    ];

    const planetMeshes = [];
    planets.forEach((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 48, 48);
      const material = new THREE.MeshStandardMaterial({ color: planet.color, emissive: planet.color, emissiveIntensity: 0.3 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = planet.distance;
      scene.add(mesh);
      planetMeshes.push({ mesh, data: planet });
    });

    // Add Stars
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 600; i++) {
      starVertices.push((Math.random() - 0.5) * 800);
      starVertices.push((Math.random() - 0.5) * 800);
      starVertices.push((Math.random() - 0.5) * 800);
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Lights
    const light = new THREE.PointLight(0xffffff, 2, 50);
    light.position.set(0, 0, 0);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Camera Position
    camera.position.z = 30;

    // Raycaster for detecting clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes.map((p) => p.mesh));

      if (intersects.length > 0) {
        const clickedPlanet = planetMeshes.find((p) => p.mesh === intersects[0].object);
        if (clickedPlanet) {
          zoomToPlanet(clickedPlanet);
        }
      }
    }

    function zoomToPlanet(planet) {
      const targetPos = planet.mesh.position.clone();
      let zoomProgress = 0;

      function zoomAnimation() {
        if (zoomProgress < 1) {
          zoomProgress += 0.02;
          camera.position.lerp(targetPos, zoomProgress);
          camera.position.z = Math.max(planet.data.size + 2, camera.position.z * (1 - zoomProgress * 0.2));
          controls.target.lerp(targetPos, zoomProgress);
          controls.update();
          renderer.render(scene, camera);
          requestAnimationFrame(zoomAnimation);
        } else {
          setTimeout(() => {
            window.open(planet.data.link, "_blank");
          }, 500);
        }
      }

      zoomAnimation();
    }

    window.addEventListener("click", onMouseClick);

    // Animation loop
    let angle = 0;
    function animate() {
      requestAnimationFrame(animate);
      angle += 0.02;

      // Move planets
      planetMeshes.forEach(({ mesh, data }) => {
        mesh.position.x = Math.cos(angle * data.speed) * data.distance;
        mesh.position.z = Math.sin(angle * data.speed) * data.distance;
      });

      // Rotate stars for motion effect
      stars.rotation.y += 0.001;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener("click", onMouseClick);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh", display: "block" }} />;
};

export default SolarSystem;

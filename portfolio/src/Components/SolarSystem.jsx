import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const SolarSystem = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Camera position
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);

    // Starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create Sun with detailed surface
    const sunGeometry = new THREE.SphereGeometry(10, 64, 64);

    // Sun surface with noise-like texture effect using shader
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;

        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec3 pos = position * 0.5;
          vNoise = snoise(pos + vec3(time * 0.5));
          vec3 newPosition = position + normal * (vNoise * 0.3);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying float vNoise;

        void main() {
          vec3 sunColor1 = vec3(1.0, 0.9, 0.2);
          vec3 sunColor2 = vec3(1.0, 0.5, 0.0);
          vec3 sunColor3 = vec3(0.8, 0.1, 0.0);

          float noiseVal = vNoise * 0.5 + 0.5;
          vec3 finalColor = mix(sunColor1, sunColor2, noiseVal);
          finalColor = mix(finalColor, sunColor3, noiseVal * 0.3);

          float emissive = 1.0 + vNoise * 0.5;
          gl_FragColor = vec4(finalColor * emissive, 1.0);
        }
      `,
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = true;
    scene.add(sun);

    // Sun glow - inner corona
    const innerGlowGeometry = new THREE.SphereGeometry(11, 64, 64);
    const innerGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: { value: camera.position },
        time: { value: 0 },
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float time;
        varying float intensity;
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 viewDir = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
          intensity = pow(0.65 - dot(vNormal, viewDir), 3.0);
          intensity = intensity * (0.8 + 0.2 * sin(time * 2.0 + position.y * 0.5));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float intensity;
        varying vec3 vNormal;

        void main() {
          vec3 coronaColor = vec3(1.0, 0.6, 0.2) * intensity;
          gl_FragColor = vec4(coronaColor, intensity);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    scene.add(innerGlow);

    // Sun outer corona
    const outerGlowGeometry = new THREE.SphereGeometry(14, 64, 64);
    const outerGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: { value: camera.position },
        time: { value: 0 },
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float time;
        varying float intensity;

        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 viewDir = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
          intensity = pow(0.5 - dot(vNormal, viewDir), 4.0);
          intensity = intensity * (0.5 + 0.5 * sin(time * 1.5 + position.x * 0.3));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float intensity;

        void main() {
          vec3 coronaColor = vec3(1.0, 0.3, 0.1) * intensity * 0.8;
          gl_FragColor = vec4(coronaColor, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    // Sun light
    const sunLight = new THREE.PointLight(0xffffff, 5, 1000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Planet data with realistic properties
    const planets = [
      {
        name: "Mercury",
        size: 1.5,
        distance: 20,
        speed: 0.004,
        color: 0x8c8c8c,
        emissive: 0x1a1a1a,
        rotationSpeed: 0.004,
        section: "about",
        description: "About",
        texture: null,
      },
      {
        name: "Earth",
        size: 1.5,
        distance: 32,
        speed: 0.0025,
        color: 0x6b93d6,
        emissive: 0x102040,
        rotationSpeed: 0.02,
        section: "skills",
        description: "Skills",
        texture: null,
      },
      {
        name: "Mars",
        size: 1.5,
        distance: 44,
        speed: 0.0015,
        color: 0xc1440e,
        emissive: 0x331100,
        rotationSpeed: 0.018,
        section: "contact",
        description: "Contact",
        texture: null,
      },
    ];

    const planetMeshes = [];
    const orbitLines = [];

    // Create text sprite for labels
    function createTextSprite(text) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 128);
      gradient.addColorStop(0, 'rgba(0, 100, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 136, 0.8)');
      ctx.fillStyle = gradient;
      ctx.roundRect(10, 10, 492, 108, 20);
      ctx.fill();

      // Text
      ctx.font = 'Bold 48px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(8, 2, 1);
      return sprite;
    }

    planets.forEach((planetData) => {
      // Create orbit path (visible ring)
      const orbitGeometry = new THREE.RingGeometry(
        planetData.distance - 0.08,
        planetData.distance + 0.08,
        256
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.12,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
      orbitLines.push(orbit);

      // Create planet with detailed shader
      const geometry = new THREE.SphereGeometry(planetData.size, 64, 64);

      // Custom planet shader for surface details
      const planetMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          planetColor: { value: new THREE.Color(planetData.color) },
          emissiveColor: { value: new THREE.Color(planetData.emissive) },
        },
        vertexShader: `
          uniform float time;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;
          varying float vNoise;

          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            vNoise = snoise(position * 2.0 + vec3(time * 0.1));
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 planetColor;
          uniform vec3 emissiveColor;
          varying vec3 vNormal;
          varying float vNoise;
          varying vec3 vPosition;

          void main() {
            float noiseVal = vNoise * 0.5 + 0.5;
            vec3 baseColor = planetColor * (0.7 + 0.3 * noiseVal);

            // Add surface variation
            float variation = sin(vPosition.y * 5.0) * 0.1 + 0.9;
            baseColor *= variation;

            // Add emissive glow on dark side
            vec3 lightDir = normalize(-vPosition);
            float darkness = 1.0 - max(dot(vNormal, lightDir), 0.0);
            vec3 emissive = emissiveColor * darkness * 0.5;

            vec3 finalColor = baseColor + emissive;
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      });

      const mesh = new THREE.Mesh(geometry, planetMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Add section label above planet
      const labelSprite = createTextSprite(planetData.description);
      labelSprite.position.y = planetData.size + 3;
      mesh.add(labelSprite);
      mesh.userData.label = labelSprite;

      // Add atmosphere for Earth
      if (planetData.name === "Earth") {
        const atmosphereGeometry = new THREE.SphereGeometry(
          planetData.size + 0.2,
          64,
          64
        );
        const atmosphereMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.8;
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
        });
        const atmosphere = new THREE.Mesh(
          atmosphereGeometry,
          atmosphereMaterial
        );
        mesh.add(atmosphere);

        // Add clouds layer
        const cloudsGeometry = new THREE.SphereGeometry(
          planetData.size + 0.05,
          64,
          64
        );
        const cloudsMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            varying vec2 vUv;

            float noise(vec2 st) {
              return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
              float cloud = noise(vUv * 10.0);
              cloud = smoothstep(0.4, 0.6, cloud);
              vec3 cloudColor = vec3(1.0, 1.0, 1.0) * cloud * 0.5;
              gl_FragColor = vec4(cloudColor, cloud * 0.4);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
        const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        mesh.add(clouds);
        mesh.userData.clouds = clouds;
      }

      planetMeshes.push({
        mesh,
        data: planetData,
        angle: Math.random() * Math.PI * 2,
        baseAngle: Math.random() * Math.PI * 2,
        isDragging: false,
        dragVelocity: new THREE.Vector3(),
      });
    });

    // Raycaster for click and drag detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let draggedPlanet = null;
    let hasDragged = false;
    let dragOffsetX = 0;
    let dragOffsetZ = 0;

    // Plane for dragging - horizontal XZ plane
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersection = new THREE.Vector3();

    function getMouseOnOrbitPlane(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);

      // Drag on the XZ plane (y=0)
      dragPlane.set(new THREE.Vector3(0, 1, 0), 0);

      if (ray.ray.intersectPlane(dragPlane, planeIntersection)) {
        return planeIntersection.clone();
      }
      return null;
    }

    function onMouseDown(event) {
      if (event.target.tagName !== 'CANVAS') return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        planetMeshes.map((p) => p.mesh),
        true // recursive
      );

      if (intersects.length > 0) {
        // Find which planet was clicked
        let clickedMesh = intersects[0].object;
        while (clickedMesh.parent && clickedMesh.parent !== scene) {
          clickedMesh = clickedMesh.parent;
        }

        const clickedPlanet = planetMeshes.find((p) => p.mesh === clickedMesh);

        if (clickedPlanet) {
          draggedPlanet = clickedPlanet;
          clickedPlanet.isDragging = true;
          clickedPlanet.returningToOrbit = false;
          hasDragged = false;

          // Get mouse position and calculate offset
          const mousePos = getMouseOnOrbitPlane(event);
          if (mousePos) {
            dragOffsetX = clickedPlanet.mesh.position.x - mousePos.x;
            dragOffsetZ = clickedPlanet.mesh.position.z - mousePos.z;
          }

          // Hide label while dragging
          if (clickedPlanet.mesh.userData.label) {
            clickedPlanet.mesh.userData.label.visible = false;
          }
        }
      }
    }

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (draggedPlanet) {
        hasDragged = true;
        const mousePos = getMouseOnOrbitPlane(event);
        if (mousePos) {
          // Planet follows cursor with offset
          draggedPlanet.mesh.position.x = mousePos.x + dragOffsetX;
          draggedPlanet.mesh.position.z = mousePos.z + dragOffsetZ;
          draggedPlanet.mesh.position.y = 0;
        }
      }

      // Update cursor
      if (!draggedPlanet) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          planetMeshes.map((p) => p.mesh),
          true
        );
        canvasRef.current.style.cursor = intersects.length > 0 ? "pointer" : "default";
      } else {
        canvasRef.current.style.cursor = "grabbing";
      }
    }

    function onMouseUp(event) {
      if (draggedPlanet) {
        // Show label again
        if (draggedPlanet.mesh.userData.label) {
          draggedPlanet.mesh.userData.label.visible = true;
        }

        // Calculate return angle based on current position
        const pos = draggedPlanet.mesh.position;
        const returnAngle = Math.atan2(pos.z, pos.x);
        draggedPlanet.returnAngle = returnAngle;
        draggedPlanet.returningToOrbit = true;
        draggedPlanet.isDragging = false;
        draggedPlanet = null;
      }
    }

    function onClick(event) {
      // Only trigger click if we didn't drag
      if (!hasDragged && !draggedPlanet) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          planetMeshes.map((p) => p.mesh),
          true
        );

        if (intersects.length > 0) {
          let clickedMesh = intersects[0].object;
          while (clickedMesh.parent && clickedMesh.parent !== scene) {
            clickedMesh = clickedMesh.parent;
          }

          const clickedPlanet = planetMeshes.find((p) => p.mesh === clickedMesh);
          if (clickedPlanet) {
            scrollToSection(clickedPlanet.data.section);
          }
        }
      }
      hasDragged = false;
    }

    function scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("click", onClick);

    // Handle resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    // Clock for time-based animations
    const clock = new THREE.Clock();

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update sun shader uniforms
      sunMaterial.uniforms.time.value = elapsedTime;
      innerGlowMaterial.uniforms.time.value = elapsedTime;
      outerGlowMaterial.uniforms.time.value = elapsedTime;

      // Rotate sun anticlockwise (opposite to planets)
      sun.rotation.y -= 0.003;

      // Update planet shaders
      planetMeshes.forEach(({ mesh }) => {
        if (mesh.material.uniforms.time) {
          mesh.material.uniforms.time.value = elapsedTime;
        }

        // Update clouds rotation for Earth
        if (mesh.userData.clouds) {
          mesh.userData.clouds.rotation.y += 0.0005;
        }
      });

      // Move planets in orbit
      planetMeshes.forEach((planetObj) => {
        const { mesh, data, angle, isDragging, returningToOrbit } = planetObj;

        if (isDragging) {
          // Planet is being dragged - position is controlled by mouse
          return;
        }

        if (returningToOrbit) {
          // Target position on the orbit at the stored return angle
          const targetDistance = data.distance;
          const targetPos = new THREE.Vector3(
            Math.cos(planetObj.returnAngle) * targetDistance,
            0,
            Math.sin(planetObj.returnAngle) * targetDistance
          );

          // Smoothly interpolate towards orbit position
          mesh.position.lerp(targetPos, 0.05);

          // Check if close enough to orbit
          const dist = Math.sqrt(mesh.position.x * mesh.position.x + mesh.position.z * mesh.position.z);
          if (Math.abs(dist - targetDistance) < 0.3) {
            // Snap to orbit and resume normal motion
            mesh.position.set(
              Math.cos(planetObj.returnAngle) * targetDistance,
              0,
              Math.sin(planetObj.returnAngle) * targetDistance
            );
            planetObj.returningToOrbit = false;
            planetObj.angle = planetObj.returnAngle;
          }

          // Self rotation continues
          mesh.rotation.y += data.rotationSpeed * delta * 60;
          return;
        }

        // Normal orbital motion - planets orbit clockwise when viewed from above
        const newAngle = angle + data.speed * delta * 60;
        mesh.position.x = Math.cos(newAngle) * data.distance;
        mesh.position.z = Math.sin(newAngle) * data.distance;

        // Update the angle for next frame
        planetObj.angle = newAngle;

        // Self rotation (clockwise)
        mesh.rotation.y += data.rotationSpeed * delta * 60;
      });

      // Rotate starfield slowly
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        position: "relative",
      }}
    />
  );
};

export default SolarSystem;

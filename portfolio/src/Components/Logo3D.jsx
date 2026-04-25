import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

function Logo3D({ onHover = false }) {
    const modelRef = useRef();
    const [hovered, setHovered] = useState(false);
    const { scene } = useGLTF('/src/assets/jd3.0 copy.glb');

    useFrame((state) => {
        if (!modelRef.current) return;

        if (onHover && hovered) {
            const mouseX = (state.mouse.x * 0.5);
            const mouseY = (state.mouse.y * 0.5);
            modelRef.current.rotation.y = mouseX;
            modelRef.current.rotation.x = -mouseY;
        } else {
            modelRef.current.rotation.x = 0;
            modelRef.current.rotation.y = 0;
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={0.5}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        />
    );
}

export default Logo3D;

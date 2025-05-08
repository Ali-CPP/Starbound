import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import SolarSystem from "./Solar system/SolarSystem";
import CanvasLoader from "./CanvasLoader";

const Scene = () => {
  const cameraRef = useRef();
  const [keys, setKeys] = useState({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.hasOwnProperty(e.code)) {
        setKeys(prev => ({ ...prev, [e.code]: true }));
      }
    };

    const handleKeyUp = (e) => {
      if (keys.hasOwnProperty(e.code)) {
        setKeys(prev => ({ ...prev, [e.code]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (cameraRef.current) {
      const moveSpeed = 100;
      const verticalSpeed = 50;
      
      if (keys.KeyW) {
        cameraRef.current.position.z -= moveSpeed * delta;
      }
      if (keys.KeyS) {
        cameraRef.current.position.z += moveSpeed * delta;
      }
      if (keys.KeyA) {
        cameraRef.current.position.x -= moveSpeed * delta;
      }
      if (keys.KeyD) {
        cameraRef.current.position.x += moveSpeed * delta;
      }
      if (keys.Space) {
        cameraRef.current.position.y += verticalSpeed * delta;
      }
      if (keys.ShiftLeft) {
        cameraRef.current.position.y -= verticalSpeed * delta;
      }
    }
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[300, 150, 0]} 
        fov={45}
        near={0.1}
        far={100000}
        ref={cameraRef}
      />
      <color attach="background" args={['#000']} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        minDistance={50}
        maxDistance={100000000000}
        target={[0, 0, 0]}
        zoomSpeed={2}
        panSpeed={1}
        rotateSpeed={0.5}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        dampingFactor={0.05}
      />
      
      <pointLight 
        position={[0, 0, 0]} 
        intensity={5} 
        color="#ffd700"
        distance={1000000}
        decay={0.5}
      />
      
      <directionalLight 
        position={[0, 0, 0]} 
        intensity={2} 
        color="#ffd700"
        target-position={[0, 0, 0]}
      />
      
      <ambientLight intensity={0.1} color="#ffd700" />
      
      <directionalLight 
        position={[-1000, -1000, -1000]} 
        intensity={0.2} 
        color="#ffd700"
      />
      
      <fog attach="fog" args={['#000', 2000, 20000]} />
      
      <Suspense fallback={<CanvasLoader />}>
        <SolarSystem />
      </Suspense>
    </>
  )
}

const Galaxy = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  )
}

export default Galaxy; 
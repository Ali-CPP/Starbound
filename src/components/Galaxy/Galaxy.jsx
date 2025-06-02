import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import SolarSystem from "./Solar system/SolarSystem";
import CanvasLoader from "./CanvasLoader";
import Widget from "../Widget";

const PLANET_INFO = {
  mercury: "target is located 57.9 million kilometers from the Sun. Extreme temperature conditions with surface temperatures ranging from -180°C to 430°C. Surface gravity is 38% of Earth's standard. Takes duration of 88 Earth days for one complete orbit. Surface radius is 2,439.7 kilometers. Atmospheric pressure is Near vacuum. Surface composition is Rocky terrain with numerous impact craters.",
  venus: "target is positioned 108.2 million kilometers from the Sun. Surface temperature is 462°C, making it the hottest planet in the system. Surface gravity is 90% of Earth's standard. Takes duration of 225 Earth days for one complete orbit. Surface radius is 6,051.8 kilometers. Atmospheric pressure is 90 times Earth's. Surface composition is Volcanic plains and highland regions.",
  earth: "target is orbiting at 149.6 million kilometers from the Sun. Surface temperature is -88°C to 58°C. Surface gravity is 9.81 m/s². Takes duration of 365.25 Earth days for one complete orbit. Surface radius is 6,371 kilometers. Atmospheric pressure is 1 atm. Surface composition is 71% water, 29% land.",
  mars: "target is located 227.9 million kilometers from the Sun. Surface temperature is -140°C to 20°C. Surface gravity is 38% of Earth's standard. Takes duration of 687 Earth days for one complete orbit. Surface radius is 3,389.5 kilometers. Atmospheric pressure is 0.006 atm. Surface composition is Red iron oxide dust and rocky terrain.",
  jupiter: "target is positioned 778.5 million kilometers from the Sun. Surface temperature is -110°C at cloud tops. Surface gravity is 2.5 times Earth's standard. Takes duration of 4,333 Earth days for one complete orbit. Surface radius is 69,911 kilometers. Atmospheric pressure is Extreme. Surface composition is Gaseous hydrogen and helium.",
  saturn: "target is located 1.4 billion kilometers from the Sun. Surface temperature is -178°C at cloud tops. Surface gravity is 1.06 times Earth's standard. Takes duration of 10,747 Earth days for one complete orbit. Surface radius is 58,232 kilometers. Atmospheric pressure is Extreme. Surface composition is Gaseous hydrogen and helium with distinctive ring system.",
  uranus: "target is positioned 2.9 billion kilometers from the Sun. Surface temperature is -224°C. Surface gravity is 0.89 times Earth's standard. Takes duration of 30,589 Earth days for one complete orbit. Surface radius is 25,362 kilometers. Atmospheric pressure is Extreme. Surface composition is Ice and gas with extreme axial tilt.",
  neptune: "target is located 4.5 billion kilometers from the Sun. Surface temperature is -214°C. Surface gravity is 1.14 times Earth's standard. Takes duration of 59,800 Earth days for one complete orbit. Surface radius is 24,622 kilometers. Atmospheric pressure is Extreme. Surface composition is Ice and gas with strongest winds in the solar system."
};

const PLANET_PLACES = {
  mercury: '/galaxy/mercury',
  venus: '/galaxy/venus',
  earth: '/galaxy/earth',
  mars: '/galaxy/mars',
  jupiter: '/galaxy/jupiter',
  saturn: '/galaxy/saturn',
  uranus: '/galaxy/uranus',
  neptune: '/galaxy/neptune'
};

const Scene = ({ onPlanetSelect }) => {
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
        <SolarSystem onPlanetSelect={onPlanetSelect} />
      </Suspense>
    </>
  )
}

const Galaxy = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handlePlanetSelect = (planetName) => {
    if (selectedPlanet === planetName) {
      setSelectedPlanet(null);
    } else {
      setSelectedPlanet(planetName);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <Canvas>
        <Scene onPlanetSelect={handlePlanetSelect} />
      </Canvas>
      <Widget 
        isVisible={selectedPlanet !== null} 
        planetName={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)}
        info={selectedPlanet ? PLANET_INFO[selectedPlanet.toLowerCase()] : []}
        place={selectedPlanet ? PLANET_PLACES[selectedPlanet.toLowerCase()] : ''}
      />
    </div>
  )
}

export default Galaxy; 
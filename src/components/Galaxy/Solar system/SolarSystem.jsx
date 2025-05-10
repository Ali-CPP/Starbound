import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Basics (affect all)
const SUN_RADIUS = 25;
const ELLIPTICAL_FACTOR = 0.1;
const BASE_LABEL_SIZE = 7;
const MIN_LABEL_SIZE = 3;
const MAX_LABEL_SIZE = 300;
const SUN_MAX_LABEL_SIZE = 10000;

// Visibility
const MIN_SCALE_DISTANCE = 50;
const MAX_SCALE_DISTANCE = 500;
const INNER_PLANETS_HIDE_DISTANCE = 1569;
const OUTER_PLANETS_HIDE_DISTANCE = 4800;

const INNER_PLANETS = ['mercury', 'venus', 'earth', 'mars'];
const OUTER_PLANETS = ['jupiter', 'saturn', 'uranus', 'neptune'];

// orbitals in seconds
const ORBITAL_PERIODS = {
  mercury: 87.97 * 24 * 60 * 60,
  venus: 224.7 * 24 * 60 * 60,
  earth: 365.25 * 24 * 60 * 60,
  mars: 686.98 * 24 * 60 * 60,
  jupiter: 4332.59 * 24 * 60 * 60,
  saturn: 10759.22 * 24 * 60 * 60,
  uranus: 30688.5 * 24 * 60 * 60,
  neptune: 60182 * 24 * 60 * 60
};

// rotation in hours
const ROTATION_PERIODS = {
  mercury: 1407.6,
  venus: 5832.5,
  earth: 23.934,
  mars: 24.623,
  jupiter: 9.925,
  saturn: 10.656,
  uranus: 17.24,
  neptune: 16.11
};

// Calculate planets' current position
const calculateCurrentPosition = (period) => {
  const now = new Date();
  const secondsSinceEpoch = now.getTime() / 1000;
  const orbitsCompleted = secondsSinceEpoch / period;
  return (orbitsCompleted % 1) * Math.PI * 2;
};

// Calculate planets' speed
const calculateRotationSpeed = (periodInHours) => {
  return 2 * Math.PI / (periodInHours * 60 * 60);
};

// Label positions
const LABEL_OFFSET = {
  sun: 50, mercury: 10, venus: 10, earth: 10, mars: 10,
  jupiter: 20, saturn: 20, uranus: 20, neptune: 20
};

const PLANET_COLORS = {
  mercury: '#8c8c8c', venus: '#e6b800', earth: '#4b9fe3', mars: '#ff6b4d',
  jupiter: '#e3a372', saturn: '#f4d03f', uranus: '#73c2fb', neptune: '#3498db'
};

const PLANET_DATA = {
  sun: { 
    radius: SUN_RADIUS, 
    color: '#ffd700', 
    emissive: '#ff8c00', 
    emissiveIntensity: 2.5, 
    rotationSpeed: calculateRotationSpeed(609.12)
  },
  mercury: { 
    distance: 40, 
    radius: 2, 
    color: PLANET_COLORS.mercury, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.mercury),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.mercury,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.mercury)
  },
  venus: { 
    distance: 60, 
    radius: 4, 
    color: PLANET_COLORS.venus, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.venus),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.venus,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.venus)
  },
  earth: { 
    distance: 80, 
    radius: 4.5, 
    color: PLANET_COLORS.earth, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.earth),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.earth,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.earth)
  },
  moon: { 
    distance: 10, 
    radius: 1, 
    color: '#c2c2c2', 
    rotationSpeed: calculateRotationSpeed(655.72),
    orbitSpeed: 2 * Math.PI / (27.32 * 24 * 60 * 60),
    initialAngle: calculateCurrentPosition(27.32 * 24 * 60 * 60)
  },
  mars: { 
    distance: 100, 
    radius: 2.5, 
    color: PLANET_COLORS.mars, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.mars),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.mars,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.mars)
  },
  jupiter: { 
    distance: 200, 
    radius: 12, 
    color: PLANET_COLORS.jupiter, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.jupiter),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.jupiter,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.jupiter)
  },
  saturn: { 
    distance: 300, 
    radius: 10, 
    color: PLANET_COLORS.saturn, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.saturn),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.saturn,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.saturn)
  },
  uranus: { 
    distance: 400, 
    radius: 5, 
    color: PLANET_COLORS.uranus, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.uranus),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.uranus,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.uranus)
  },
  neptune: { 
    distance: 500, 
    radius: 5, 
    color: PLANET_COLORS.neptune, 
    rotationSpeed: calculateRotationSpeed(ROTATION_PERIODS.neptune),
    orbitSpeed: 2 * Math.PI / ORBITAL_PERIODS.neptune,
    initialAngle: calculateCurrentPosition(ORBITAL_PERIODS.neptune)
  }
};

// Orbit paths
const OrbitRing = ({ radius, isHovered, planetName }) => {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius * (1 - ELLIPTICAL_FACTOR), 0, 2 * Math.PI, false, 0);
  const points = curve.getPoints(256);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
      <lineBasicMaterial 
        color={PLANET_COLORS[planetName.toLowerCase()] || 'white'}
        transparent 
        opacity={isHovered ? 0.8 : 0.4}
        linewidth={isHovered ? 4 : 2}
      />
    </line>
  );
};

// Moon
const Moon = ({ data, isHovered }) => {
  const moonRef = useRef();
  const orbitRef = useRef();
  const time = useRef(data.initialAngle);
  const [scale, setScale] = useState(1);
  const [distanceScale, setDistanceScale] = useState(1);

  useFrame((state, delta) => {
    time.current += data.orbitSpeed * delta;
    if (moonRef.current && orbitRef.current) {
      const targetScale = isHovered ? 1.3 : 1;
      setScale(scale + (targetScale - scale) * 0.1);
      moonRef.current.scale.set(scale, scale, scale);

      const targetDistanceScale = isHovered ? 1.3 : 1;
      setDistanceScale(distanceScale + (targetDistanceScale - distanceScale) * 0.1);

      moonRef.current.rotation.y += data.rotationSpeed * delta;
      const x = Math.cos(time.current) * data.distance * distanceScale;
      const z = Math.sin(time.current) * data.distance * distanceScale;
      orbitRef.current.position.set(x, 0, z);
    }
  });

  return (
    <group>
      <Ring args={[data.distance * distanceScale - 0.1, data.distance * distanceScale + 0.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="white" transparent opacity={isHovered ? 0.5 : 0.1} side={2} />
      </Ring>
      <group ref={orbitRef}>
        <Sphere ref={moonRef} args={[data.radius, 32, 32]}>
          <meshStandardMaterial 
            color={data.color}
            roughness={isHovered ? 0.4 : 0.7}
            metalness={isHovered ? 0.6 : 0.3}
            emissiveIntensity={isHovered ? 0.2 : 0}
            emissive={isHovered ? data.color : "#000000"}
          />
        </Sphere>
      </group>
    </group>
  );
};

// Planet labels
const PlanetLabel = ({ name }) => {
  const textRef = useRef();

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.lookAt(camera.position);
      const distance = textRef.current.position.distanceTo(camera.position);

      if (name.toLowerCase() === 'sun') {
        textRef.current.visible = true;
        textRef.current.renderOrder = 999;
      } else {
        const planetName = name.toLowerCase();
        if (INNER_PLANETS.includes(planetName) && distance > INNER_PLANETS_HIDE_DISTANCE) {
          textRef.current.visible = false;
          return;
        }
        if (OUTER_PLANETS.includes(planetName) && distance > OUTER_PLANETS_HIDE_DISTANCE) {
          textRef.current.visible = false;
          return;
        }
        textRef.current.visible = true;
      }

      let scaleFactor = 1;
      if (distance < MIN_SCALE_DISTANCE) {
        scaleFactor = Math.max(0.3, distance / MIN_SCALE_DISTANCE);
      } else if (distance > MAX_SCALE_DISTANCE) {
        scaleFactor = 1 + (distance - MAX_SCALE_DISTANCE) / MAX_SCALE_DISTANCE;
      }

      const newSize = name.toLowerCase() === 'sun' 
        ? Math.min(SUN_MAX_LABEL_SIZE, Math.max(MIN_LABEL_SIZE, BASE_LABEL_SIZE * scaleFactor))
        : Math.min(MAX_LABEL_SIZE, Math.max(MIN_LABEL_SIZE, BASE_LABEL_SIZE * scaleFactor));

      textRef.current.fontSize = newSize;
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, LABEL_OFFSET[name.toLowerCase()] || 40, 0]}
      fontSize={BASE_LABEL_SIZE}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      renderOrder={name.toLowerCase() === 'sun' ? 999 : 1}
      depthTest={false}
      fontWeight={name.toLowerCase() === 'sun' ? 1000 : 900}
    >
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </Text>
  );
};

// Main planet component
const Planet = ({ name, data }) => {
  const planetRef = useRef();
  const orbitRef = useRef();
  const time = useRef(data.initialAngle);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [ringScale, setRingScale] = useState(1);

  const getScalingFactor = () => {
    if (name === 'sun') return 1;
    if (INNER_PLANETS.includes(name.toLowerCase())) return 1.3;
    if (name.toLowerCase() === 'mercury') return 1.4;
    return 1.2;
  };

  useFrame((state, delta) => {
    time.current += data.orbitSpeed * delta;
    if (planetRef.current) {
      const targetScale = isHovered ? getScalingFactor() : 1;
      setScale(scale + (targetScale - scale) * 0.1);
      planetRef.current.scale.set(scale, scale, scale);

      if (name === 'saturn') {
        const targetRingScale = isHovered ? 1.3 : 1;
        setRingScale(ringScale + (targetRingScale - ringScale) * 0.1);
      }

      planetRef.current.rotation.y += data.rotationSpeed * delta;

      if (name !== 'sun' && orbitRef.current) {
        const x = Math.cos(time.current) * data.distance;
        const z = Math.sin(time.current) * data.distance * (1 - ELLIPTICAL_FACTOR);
        orbitRef.current.position.x = x;
        orbitRef.current.position.z = z;
      }
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      {name !== 'sun' && <OrbitRing radius={data.distance} isHovered={isHovered} planetName={name} />}
      <group ref={orbitRef} position={name === 'sun' ? [0, 0, 0] : [data.distance, 0, 0]}>
        <Sphere
          args={[data.radius * 2, 32, 32]}
          onPointerOver={() => {
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <meshBasicMaterial visible={false} />
        </Sphere>

        <PlanetLabel name={name} />
        
        <Sphere ref={planetRef} args={[data.radius, 64, 32]}>
          <meshStandardMaterial 
            color={data.color}
            emissive={data.emissive || (isHovered ? data.color : '#000000')}
            emissiveIntensity={data.emissiveIntensity || (isHovered ? 0.4 : 0)}
            roughness={isHovered ? 0.3 : 0.5}
            metalness={isHovered ? 0.7 : 0.5}
            receiveShadow={true}
            castShadow={true}
          />
        </Sphere>

        {name === 'saturn' && (
          <>
            <Ring args={[data.radius * 1.2 * ringScale, data.radius * 2.2 * ringScale, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial 
                color="#f4d03f"
                transparent
                opacity={isHovered ? 0.9 : 0.8}
                side={THREE.DoubleSide}
                emissive="#f4d03f"
                emissiveIntensity={isHovered ? 0.2 : 0}
                roughness={0.3}
                metalness={0.5}
              />
            </Ring>
            <Ring args={[data.radius * 1.3 * ringScale, data.radius * 1.9 * ringScale, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial 
                color="#c4a63f"
                transparent
                opacity={isHovered ? 0.8 : 0.6}
                side={THREE.DoubleSide}
                emissive="#c4a63f"
                emissiveIntensity={isHovered ? 0.2 : 0}
                roughness={0.3}
                metalness={0.5}
              />
            </Ring>
          </>
        )}

        {name === 'earth' && <Moon data={PLANET_DATA.moon} isHovered={isHovered} />}
      </group>
    </group>
  );
};

// Main solar system component
const SolarSystem = () => {
  return (
    <>
      <group>
        <Stars radius={10000} depth={5000} count={7000} factor={10} saturation={0.5} fade speed={0.5} />
        {Object.entries(PLANET_DATA).map(([name, data]) => {
          if (name !== 'moon') {
            return <Planet key={name} name={name} data={data} />;
          }
          return null;
        })}
      </group>
      <PlanetLabel name="sun" />
    </>
  );
};

export default SolarSystem; 
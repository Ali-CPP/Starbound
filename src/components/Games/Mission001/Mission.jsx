import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import SpaceShip from '../../Models/SpaceShip';
import CanvasLoader from '../../Galaxy/CanvasLoader';

const Mission001 = () => {
  const cameraRef = useRef();
  const [nitroLevel, setNitroLevel] = useState(0);
  const [isWPressed, setIsWPressed] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [speedUnit, setSpeedUnit] = useState('LightYears');
  const [isMissionLogVisible, setIsMissionLogVisible] = useState(true);
  const [isMissionLogDismissed, setIsMissionLogDismissed] = useState(false);
  const { progress } = useProgress();
  const returnTimerRef = useRef(null);
  const defaultCameraPosition = new THREE.Vector3(-2, 8, -216);
  const defaultTarget = new THREE.Vector3(0, 5, -200);
  const [fadeOut, setFadeOut] = useState(false);
  const [spaceshipZ, setSpaceshipZ] = useState(-200);
  const [shouldMove, setShouldMove] = useState(false);
  
  // Sound refs
  const engineSoundRef = useRef(null);

  const handlePanStart = () => {
    setIsPanning(true);
    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    returnTimerRef.current = setTimeout(() => {
      if (cameraRef.current) {
        // Smoothly animate camera back to default position
        const controls = cameraRef.current;
        const startPosition = controls.object.position.clone();
        const startTarget = controls.target.clone();
        const duration = 1000; // 1 second animation
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease in-out function for smooth animation
          const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          // Interpolate position and target
          controls.object.position.lerpVectors(startPosition, defaultCameraPosition, easeProgress);
          controls.target.lerpVectors(startTarget, defaultTarget, easeProgress);
          controls.update();

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        animate();
      }
    }, 1000);
  };

  useEffect(() => {
    // Show level indicator after 1 second
    const showTimer = setTimeout(() => {
      setShowLevel(true);
    }, 3000);

    // Hide level indicator after 3 seconds
    const hideTimer = setTimeout(() => {
      setShowLevel(false);
    }, 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w') {
        setIsWPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') {
        setIsWPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isWPressed && speedUnit === 'Kilometers') {
      interval = setInterval(() => {
        setNitroLevel(prev => Math.min(prev + 2, speedUnit === 'Kilometers' ? 9.1 : 100));
      }, 50);
    } else if (!isWPressed && nitroLevel > 0) {
      interval = setInterval(() => {
        setNitroLevel(prev => Math.max(prev - 1, 0));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isWPressed, nitroLevel, speedUnit]);

  useEffect(() => {
    return () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsFullyLoaded(false);
    }
  }, [progress]);

  // Initialize sounds
  useEffect(() => {
    // Create two audio elements for crossfading (idle sound)
    const audio1 = new Audio();
    const audio2 = new Audio();
    
    audio1.src = '/public/assets/SpaceShipIdlee.mp3';
    audio2.src = '/public/assets/SpaceShipIdlee.mp3';
    
    audio1.loop = false;
    audio2.loop = false;
    
    // Set initial volume
    audio1.volume = 0.3;
    audio2.volume = 0.3;
    
    audio1.muted = true;
    audio2.muted = true;

    // Create new audio for W key press
    const wKeySound = new Audio();
    wKeySound.src = '/public/assets/SpaceShipTakeOff.mp3';
    wKeySound.volume = 1;
    wKeySound.loop = false;

    // Function to handle the crossfade
    const crossfade = () => {
      // Start the second audio when we're 0.5 seconds from the end
      if (audio1.currentTime >= audio1.duration - 0.5) {
        if (!audio2.playing) {
          audio2.currentTime = 0;
          audio2.play();
        }
      }
      
      // When we're very close to the end, switch to audio2
      if (audio1.currentTime >= audio1.duration - 0.05) {
        audio1.pause();
        audio1.currentTime = 0;
        audio1.play();
      }
    };

    // Add timeupdate listener for crossfading
    audio1.addEventListener('timeupdate', crossfade);

    // Add ended event listener for takeoff sound
    wKeySound.addEventListener('ended', () => {
      if (!isLaunchingRef.current) {
        isLaunchingRef.current = true;
        startLaunchAnimation();
      }
    });

    // Function to unmute and start playing
    const unmuteAndPlay = async () => {
      audio1.muted = false;
      audio2.muted = false;
      try {
        await audio1.play();
        document.removeEventListener('click', unmuteAndPlay);
        document.removeEventListener('keydown', unmuteAndPlay);
      } catch (error) {
        console.error('Failed to play sound:', error);
      }
    };

    // Start playing muted immediately
    audio1.play().catch(console.error);

    // Listen for any user interaction to unmute
    document.addEventListener('click', unmuteAndPlay);
    document.addEventListener('keydown', unmuteAndPlay);

    // Store references
    engineSoundRef.current = {
      audio1,
      audio2,
      wKeySound
    };

    // Cleanup
    return () => {
      if (engineSoundRef.current) {
        engineSoundRef.current.audio1.removeEventListener('timeupdate', crossfade);
        engineSoundRef.current.audio1.pause();
        engineSoundRef.current.audio2.pause();
        engineSoundRef.current.wKeySound.pause();
        engineSoundRef.current = null;
      }
      document.removeEventListener('click', unmuteAndPlay);
      document.removeEventListener('keydown', unmuteAndPlay);
    };
  }, []);

  // Launch animation function
  const startLaunchAnimation = () => {
    const mercuryPosition = new THREE.Vector3(0, 0, 200); // Mercury's center
    const stepSize = 10; // Move 10 units at a time
    const stepInterval = 100; // Time between steps in milliseconds

    // Stop idle sounds
    if (engineSoundRef.current) {
      engineSoundRef.current.audio1.pause();
      engineSoundRef.current.audio2.pause();
    }

    const moveStep = () => {
      const currentZ = spaceshipRef.current.z;
      const newZ = currentZ + stepSize;
      
      // Update spaceship position
      spaceshipRef.current.z = newZ;
      
      // Update camera to follow spaceship
      if (cameraRef.current) {
        const controls = cameraRef.current;
        controls.target.set(spaceshipRef.current.x, spaceshipRef.current.y + 5, newZ);
        controls.update();
      }

      // Check if we've reached Mercury
      const distanceToMercury = Math.abs(newZ - mercuryPosition.z);
      if (distanceToMercury <= stepSize) {
        setFadeOut(true);
      } else {
        // Schedule next step
        setTimeout(moveStep, stepInterval);
      }
    };

    // Start the movement immediately
    moveStep();
  };

  // Handle W key press/release for sound
  useEffect(() => {
    if (engineSoundRef.current && speedUnit === 'Kilometers') {
      if (isWPressed) {
        // Play the W key sound when W is pressed
        engineSoundRef.current.wKeySound.play().catch(console.error);
      } else {
        // Stop the W key sound when W is released
        engineSoundRef.current.wKeySound.pause();
        engineSoundRef.current.wKeySound.currentTime = 0;
      }
    }
  }, [isWPressed, speedUnit]);

  // Add ended event listener for takeoff sound
  useEffect(() => {
    if (engineSoundRef.current?.wKeySound && speedUnit === 'Kilometers') {
      const handleSoundEnd = () => {
        // Stop idle sounds
        if (engineSoundRef.current) {
          engineSoundRef.current.audio1.pause();
          engineSoundRef.current.audio2.pause();
        }
        setShouldMove(true);
      };
      
      engineSoundRef.current.wKeySound.addEventListener('ended', handleSoundEnd);
      
      return () => {
        engineSoundRef.current?.wKeySound.removeEventListener('ended', handleSoundEnd);
      };
    }
  }, [speedUnit]);

  // Start sound when content is fully loaded
  useEffect(() => {
    if (isFullyLoaded && engineSoundRef.current) {
      engineSoundRef.current.audio1.muted = false;
      engineSoundRef.current.audio2.muted = false;
    }
  }, [isFullyLoaded]);

  // Spaceship movement animation
  useEffect(() => {
    if (!shouldMove) return;

    const mercuryZ = 200; // Mercury's Z position
    const stepSize = 25; // Smaller steps for smoother movement
    const targetFPS = 120; // Target frames per second
    const frameTime = 1000 / targetFPS; // Time per frame in milliseconds
    let lastFrameTime = performance.now();

    const moveSpaceship = (currentTime) => {
      const deltaTime = currentTime - lastFrameTime;
      
      if (deltaTime >= frameTime) {
        setSpaceshipZ(prevZ => {
          const newZ = prevZ + stepSize;
          
          // Update camera target to follow spaceship
          if (cameraRef.current) {
            const controls = cameraRef.current;
            controls.target.set(0, 5, newZ);
            controls.update();
          }

          // Check if we've reached Mercury
          if (newZ >= mercuryZ) {
            setFadeOut(true);
            return mercuryZ;
          }

          lastFrameTime = currentTime;
          requestAnimationFrame(moveSpaceship);
          return newZ;
        });
      } else {
        requestAnimationFrame(moveSpaceship);
      }
    };

    // Start the movement
    requestAnimationFrame(moveSpaceship);
  }, [shouldMove]);

  const dismissMissionLog = () => {
    setIsMissionLogVisible(false);
    setTimeout(() => {
      setIsMissionLogDismissed(true);
    }, 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <Canvas camera={{ position: [-2, 8, -216], fov: 75 }}>
        <Suspense fallback={<CanvasLoader />}>
          {/* Camera Controls */}
          <OrbitControls
            ref={cameraRef}
            enableZoom={false}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={1000000}
            enableDamping={true}
            dampingFactor={0.5}
            rotateSpeed={0.5}
            target={[0, 5, spaceshipZ]}
            onStart={handlePanStart}
            onEnd={handlePanEnd}
          />

          {/* Ambient Light */}
          <ambientLight intensity={0.2} />

          {/* Sun Light */}
          <pointLight position={[0, 0, 200]} intensity={5} color="#ffd700" distance={1000000} decay={0.5} />

          {/* Multiple Directional Lights */}
          <directionalLight
            position={[10, 10, 10]}
            intensity={0.8}
            color="#ffffff"
          />
          <directionalLight
            position={[-10, -10, -10]}
            intensity={0.5}
            color="#ff4444"
          />
          <directionalLight
            position={[0, 10, -10]}
            intensity={0.6}
            color="#4444ff"
          />
          <directionalLight
            position={[0, -10, 10]}
            intensity={0.4}
            color="#44ff44"
          />

          {/* Space Environment */}
          <group position={[0,0,0]}>
              {/* Sun */}
              <mesh position={[0, 0, 1500]}>
                <sphereGeometry args={[1000, 64, 64]} />
                <meshBasicMaterial
                  color="#ffd700"
                />
              </mesh>
              <pointLight position={[0, 0, 200]} intensity={5} color="#ffd700" distance={1000000} decay={0.5} />

              {/* Mercury */}
              <mesh position={[0, 0, 200]}>
                <sphereGeometry args={[50, 32, 32]} />
                <meshStandardMaterial
                  color="#8c8c8c"
                  roughness={0.7}
                  metalness={0.3}
                />
              </mesh>

              {/* SpaceShip Model */}
              <group position={[0, 0, spaceshipZ]}>
                <SpaceShip />
              </group>

            {/* Stars */}
            <Stars
              radius={300}
              depth={100}
              count={50000}
              factor={4}
              saturation={0}
              fade
              speed={2}
            />
          </group>
        </Suspense>
      </Canvas>

      {/* Fade Out Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        opacity: fadeOut ? 1 : 0,
        transition: 'opacity 3s ease-in-out',
        pointerEvents: 'none',
        zIndex: 1000
      }} />

      {/* Level Indicator */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '3rem',
        fontWeight: 'bold',
        opacity: showLevel && isFullyLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        Level 1
      </div>

      {/* Mission Log */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: isMissionLogVisible ? '2%' : '-30%',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '15px',
        borderRadius: '10px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '400px',
        zIndex: 999,
        opacity: isFullyLoaded ? 1 : 0,
        transition: 'left 0.5s ease-in-out, opacity 0.5s ease-in-out'
      }}>
        <button 
          onClick={dismissMissionLog} 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            position: 'absolute',
            right: '1%',
            top: '1%',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            margin: '0',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        > &lt;&lt; </button>
        
        <h3 style={{ margin: '20px 0 10px 0', color: '#00BFFF' }}>Mission Log</h3>
        <ul style={{ 
          margin: '0', 
          padding: '0 0 0 20px',
          listStyleType: 'none'
        }}>
          <li style={{ marginBottom: '8px', textDecoration: speedUnit === 'Kilometers' ? 'line-through' : 'none' }}>
          • Change the speed unit to Kilometers
          </li>
          <li style={{ marginBottom: '8px', textDecoration: (speedUnit === 'Kilometers' && nitroLevel >= 9.1) ? 'line-through' : 'none' }}>
          • Adjust the speed to arrive in 1 second
          </li>
        </ul>

        <h3 style={{ margin: '20px 0 10px 0', color: '#00BFFF' }}>Info</h3>
        <ul style={{ 
          marginTop: '0', 
          padding: '0 0 0 20px',
          listStyleType: 'none'
        }}>
          <li style={{ marginBottom: '8px' }}>• Distance to Mercury: 91,000,000 km</li>
          <li style={{ marginBottom: '8px' }}>• Time to reach Mercury: 1 second</li>
          <li style={{ marginBottom: '8px' }}>• Speed of light: 299,792,458 m/s</li>
        </ul>
      </div>

      {/* Button to Show Mission Log */}
      {isMissionLogDismissed && (
        <button 
          onClick={() => {
            setIsMissionLogVisible(true);
            setIsMissionLogDismissed(false);
          }} 
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '1%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            zIndex: 1000
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          &gt;&gt; 
        </button>
      )}

      {/* Nitro and Speed Container */}
      <div style={{
        position: 'absolute',
        right: '2%',
        bottom: '5%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '100px',
        opacity: isFullyLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}>

        {/* Speed Type */}
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          backgroundColor: 'rgba(94, 94, 94)',
          borderRadius: '8px 0px 0px 8px',
          textAlign: 'left',
          textShadow: '0 0 10px rgba(0, 191, 255, 0.5)',
          width: '150%',
          position: 'absolute',
          right: '95%',
          top: '57%',
          padding: '5px'
        }}>
          <button 
            onClick={() => setSpeedUnit('Kilometers')} 
            style={{
              backgroundColor: speedUnit === 'Kilometers' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              margin: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = speedUnit === 'Kilometers' ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
          >
            Kilometers
          </button>
          <button 
            onClick={() => setSpeedUnit('LightYears')} 
            style={{
              backgroundColor: speedUnit === 'LightYears' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '5px',
              cursor: speedUnit === 'Kilometers' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
            }}
            disabled={speedUnit === 'Kilometers'}
            onMouseEnter={(e) => {
              if (speedUnit !== 'Kilometers') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (speedUnit !== 'Kilometers') {
                e.target.style.backgroundColor = speedUnit === 'LightYears' ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
              }
            }}
          >
            LightYears
          </button>
        </div>

        {/* Speed Indicator */}
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0, 191, 255, 0.5)',
          textAlign: 'center',
          width: '175%',
          position: 'absolute',
          top: '-40px'
        }}>
          {speedUnit === 'Kilometers' 
            ? `${Math.round((nitroLevel / 100) * 1000)}mil Km/s` 
            : `${Math.round((nitroLevel / 100) * 100)}mil Ly/s`}
        </div>

        {/* Nitro Bar */}
        <div style={{
          width: '75%',
          height: '35vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '15px 15px 15px 0px',
          border: '7.5px solid rgba(94, 94, 94)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: '0',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: `${nitroLevel}%`,
            background: 'linear-gradient(to top, #00BFFF, #DC143C)',
            borderRadius: '0px 0px 7.7px 0px',
            transition: 'height 0.3s ease-in-out',
            boxShadow: '0 0 10px rgba(0, 191, 255, 0.5)'
          }} />
          {speedUnit === 'Kilometers' && (
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              backgroundColor: '#00BFFF',
              bottom: '9.1%',
              left: '0',
              boxShadow: '0 0 5px #00BFFF'
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Mission001;

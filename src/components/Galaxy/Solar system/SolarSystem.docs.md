# SolarSystem Component Documentation

## Overview
This component creates a real-time 3D visualization of our solar system using Three.js and React Three Fiber. It accurately simulates the current positions and movements of all planets, including their real orbital periods and rotation speeds. The simulation runs in real-time, meaning 1 second in the simulation equals 1 second in real life.

## Core Concepts

### Time and Movement
The simulation uses two key time-based calculations:
1. **Orbital Movement**: Planets orbit the sun at their real orbital speeds
2. **Rotational Movement**: Planets rotate on their axes at their real rotation speeds

### Position Calculation
- Uses Unix timestamp to calculate current positions
- Accounts for multiple orbits for outer planets
- Maintains accurate relative positions between planets

## Constants and Configuration

### Size Constants
```javascript
const SUN_RADIUS = 25;        // Base size for the sun
const MIN_PLANET_SIZE = 1.5;  // Minimum visible size for small planets
const ELLIPTICAL_FACTOR = 0.1; // Makes orbits slightly elliptical
```

### Label Configuration
```javascript
const BASE_LABEL_SIZE = 7;    // Base size for planet labels
const MIN_LABEL_SIZE = 3;     // Minimum label size when zoomed out
const MAX_LABEL_SIZE = 300;   // Maximum label size when zoomed in
const SUN_MAX_LABEL_SIZE = 10000; // Special case for sun label
```

### Distance and Visibility
```javascript
const MIN_SCALE_DISTANCE = 50;    // Distance at which labels start scaling down
const MAX_SCALE_DISTANCE = 500;   // Distance at which labels start scaling up
const INNER_PLANETS_HIDE_DISTANCE = 1569;  // Distance to hide inner planet labels
const OUTER_PLANETS_HIDE_DISTANCE = 4800;  // Distance to hide outer planet labels
```

### Real-Time Constants
```javascript
// Orbital periods in seconds (converted from Earth days)
const ORBITAL_PERIODS = {
  mercury: 87.97 * 24 * 60 * 60,    // 87.97 Earth days
  venus: 224.7 * 24 * 60 * 60,      // 224.7 Earth days
  earth: 365.25 * 24 * 60 * 60,     // 365.25 Earth days
  mars: 686.98 * 24 * 60 * 60,      // 686.98 Earth days
  jupiter: 4332.59 * 24 * 60 * 60,  // 4332.59 Earth days
  saturn: 10759.22 * 24 * 60 * 60,  // 10759.22 Earth days
  uranus: 30688.5 * 24 * 60 * 60,   // 30688.5 Earth days
  neptune: 60182 * 24 * 60 * 60     // 60182 Earth days
};

// Rotation periods in hours
const ROTATION_PERIODS = {
  mercury: 1407.6,    // 58.65 Earth days
  venus: 5832.5,      // 243 Earth days (retrograde)
  earth: 23.934,      // 23.934 hours
  mars: 24.623,       // 24.623 hours
  jupiter: 9.925,     // 9.925 hours
  saturn: 10.656,     // 10.656 hours
  uranus: 17.24,      // 17.24 hours
  neptune: 16.11      // 16.11 hours
};
```

## Key Functions

### Position Calculation
```javascript
const calculateCurrentPosition = (period) => {
  const now = new Date();
  const millisecondsSinceEpoch = now.getTime();
  const secondsSinceEpoch = millisecondsSinceEpoch / 1000;
  
  // Calculate how many full orbits have completed
  const orbitsCompleted = secondsSinceEpoch / period;
  
  // Get the current position in the current orbit (0 to 2π)
  const currentOrbitPosition = (orbitsCompleted % 1) * Math.PI * 2;
  
  return currentOrbitPosition;
};
```
This function:
1. Gets current Unix timestamp
2. Calculates completed orbits
3. Returns current position in radians

### Rotation Speed Calculation
```javascript
const calculateRotationSpeed = (periodInHours) => {
  const periodInSeconds = periodInHours * 60 * 60;
  return 2 * Math.PI / periodInSeconds;
};
```
This function:
1. Converts hours to seconds
2. Calculates radians per second for rotation

## Components

### OrbitRing Component
Creates the orbital path for each planet:
- Uses THREE.EllipseCurve for slightly elliptical orbits
- Changes opacity and width on hover
- Matches planet's color

### Moon Component
Handles Earth's moon:
- Orbits Earth at correct speed
- Scales with Earth's hover state
- Has its own rotation period
- Maintains correct distance from Earth

### PlanetLabel Component
Manages planet labels:
- Always visible for the sun
- Scales with distance
- Hides at certain distances
- Uses different font weights

### Planet Component
Main component for each planet:
- Handles real-time orbital movement
- Manages real-time rotation
- Controls hover effects
- Handles special features (rings, moons)

## Data Structure

### PLANET_DATA
Contains all properties for each celestial body:
```javascript
{
  name: {
    distance: number,      // Distance from sun
    radius: number,        // Planet size
    color: string,         // Planet color
    rotationSpeed: number, // Real rotation speed
    orbitSpeed: number,    // Real orbital speed
    initialAngle: number,  // Current position
    // Special properties
    emissive?: string,     // Glow color
    hasMoon?: boolean,     // Has moon flag
  }
}
```

## Real-Time Simulation

### Orbital Movement
- Each planet orbits at its real orbital period
- Positions are calculated based on current time
- Maintains correct relative positions

### Rotational Movement
- Each planet rotates at its real rotation period
- Sun rotates every ~25.38 days
- Moon is tidally locked to Earth

### Time Progression
- Simulation runs in real-time
- 1 second in simulation = 1 second in real life
- All movements are smooth and continuous

## Performance Considerations
- Uses useRef for mutable values
- Implements useFrame for smooth animations
- Optimizes geometry with appropriate segment counts
- Manages state updates efficiently

## Design Decisions

### Why Real-Time?
- Provides accurate current positions
- Shows true relative speeds
- Creates more educational value
- Makes simulation more realistic

### Why These Constants?
- SUN_RADIUS: Makes sun visible but not overwhelming
- ELLIPTICAL_FACTOR: Adds realism without being too extreme
- Label sizes: Balances visibility and readability
- Hide distances: Prevents label clutter at high zoom

### Component Structure
- Separated concerns for better maintainability
- Reusable components for similar features
- Clear hierarchy of components
- Efficient state management 
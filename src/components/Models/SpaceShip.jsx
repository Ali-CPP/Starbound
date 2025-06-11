import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const SpaceShip = (props) => {
  const { nodes, materials } = useGLTF('/public/models/SpaceShip/scene.gltf')
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube010_BASE_0.geometry}
            material={materials.BASE}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube003_WINGS_0.geometry}
            material={materials.WINGS}
          />
        </group>
      </group>
    </group>
  )
}

export default SpaceShip;
useGLTF.preload('/public/models/SpaceShip/scene.gltf')

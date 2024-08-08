'use client'
import { Box, CameraControls, Environment, Gltf, OrbitControls } from '@react-three/drei'
import {Canvas} from '@react-three/fiber';
import React from 'react'
import { MeshNormalMaterial } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';

const Experiance = () => {
  return (
   <>
   <Canvas  >
    <CameraManager/>
    <Environment preset='sunset'/>
    <ambientLight intensity={0.8} color="pink" />
    <Gltf src='/models/avatar.glb' position={[-1, -1.7, -3]} rotation-y={degToRad(20)} />
   </Canvas>
   </>
  )
}


const CameraManager = () => {
  return  <CameraControls
  
  minZoom={1}
maxZoom={3}
polarRotateSpeed={-0.3} 
azimuthRotateSpeed={-0.3}

  />
  
}
export default Experiance
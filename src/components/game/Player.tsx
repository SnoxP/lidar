import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../../utils/keyboardMap';
import { LidarScanner } from './LidarScanner';
import { useGameStore } from '../../store/useGameStore';

const SPEED = 5;

export function Player() {
  const { rapier, world } = useRapier();
  const rb = useRef<any>(null);
  const { camera } = useThree();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  const takeDamage = useGameStore((s) => s.takeDamage);
  const triggerJumpscare = useGameStore((s) => s.triggerJumpscare);

  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  useFrame((state) => {
    if (!rb.current) return;
    
    // Movement
    const { forward, back, left, right } = getKeys();
    
    frontVector.set(0, 0, Number(back) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    
    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    // Apply movement
    const linvel = rb.current.linvel();
    rb.current.setLinvel({ x: direction.x, y: linvel.y, z: direction.z });

    // Sync camera to player position
    const pos = rb.current.translation();
    camera.position.set(pos.x, pos.y + 0.8, pos.z); 
  });

  const onMonsterHit = () => {
    takeDamage(25);
    triggerJumpscare();
  };

  return (
    <>
      <RigidBody
        ref={rb}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider args={[0.5, 0.4]} />
      </RigidBody>

      <LidarScanner isMonsterHitCallback={onMonsterHit} />
    </>
  );
}

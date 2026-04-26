import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function Monster() {
  const rb = useRef<any>(null);
  const { camera } = useThree();
  const jumpscare = useGameStore(s => s.jumpscare);
  const [teleporting, setTeleporting] = useState(false);

  // When jumpscare triggers, monster relocates randomly
  useEffect(() => {
    if (jumpscare && !teleporting) {
       setTeleporting(true);
       setTimeout(() => setTeleporting(false), 2000);
    }
  }, [jumpscare]);

  useFrame(() => {
    if (!rb.current) return;

    if (teleporting) {
        // Teleport far away or disable movement
        rb.current.setTranslation({ x: 999, y: 999, z: 999 });
        return;
    }

    // Move towards player
    const pos = rb.current.translation();
    const playerPos = camera.position;
    
    // Simple steering behavior
    const dir = new THREE.Vector3(playerPos.x - pos.x, 0, playerPos.z - pos.z);
    dir.normalize().multiplyScalar(1.5); // very slow creeping speed 

    rb.current.setLinvel({ x: dir.x, y: 0, z: dir.z });
  });

  return (
    <RigidBody
      ref={rb}
      type="dynamic"
      colliders="cuboid"
      position={[10, 1, 10]}
      lockRotations
      userData={{ isMonster: true }}
    >
      <mesh visible={false} position={[0,0,0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}

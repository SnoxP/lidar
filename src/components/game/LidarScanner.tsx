import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRapier } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { Controls } from '../../utils/keyboardMap';

const MAX_POINTS = 100000; 
const POINT_LIFETIME = 8000; // 8 seconds

export function LidarScanner({ isMonsterHitCallback }: { isMonsterHitCallback: () => void }) {
  const { rapier, world } = useRapier();
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const isMouseDown = useRef(false);
  const scannerRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    const handleDown = () => (isMouseDown.current = true);
    const handleUp = () => (isMouseDown.current = false);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Use typed arrays for position and color
  const positions = useMemo(() => new Float32Array(MAX_POINTS * 3).fill(9999), []);
  const colors = useMemo(() => new Float32Array(MAX_POINTS * 3), []);
  const timestamps = useMemo(() => new Float32Array(MAX_POINTS).fill(0), []);
  const currentIdx = useRef(0);
  
  // Create geometry explicitly to ensure correct attribute setting
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);
  
  const baseColor = new THREE.Color(0x00ffaa);
  const monsterColor = new THREE.Color(0xff0000);

  useFrame((state) => {
    const now = performance.now();
    let needsUpdate = false;
    
    const { scan } = getKeys();
    const isScanning = isMouseDown.current || scan;
    
    // Sync scanner model to camera
    if (scannerRef.current) {
      scannerRef.current.position.copy(camera.position);
      scannerRef.current.quaternion.copy(camera.quaternion);
      
      // Animate scanner when active
      if (isScanning) {
         scannerRef.current.position.y += Math.sin(state.clock.elapsedTime * 30) * 0.005;
         scannerRef.current.position.z += Math.random() * 0.01;
      } else {
         // Subtle breathing bob
         scannerRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
      }
      
      // Pass isScanning to lens material
      const cylinder = scannerRef.current.children[0].children[1] as THREE.Mesh;
      if (cylinder && cylinder.material) {
        (cylinder.material as THREE.MeshBasicMaterial).color.set(isScanning ? "#00ffaa" : "#055030");
      }
    }
    
    // Process new rays
    if (isScanning) {
      const numRays = 150; // Rays per frame
      
      const worldQuat = new THREE.Quaternion();
      camera.getWorldQuaternion(worldQuat);
      const worldPos = new THREE.Vector3();
      camera.getWorldPosition(worldPos);

      for (let i = 0; i < numRays; i++) {
        // Random conical spread
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random(); 
        const spreadX = Math.cos(angle) * Math.sqrt(radius) * 0.55;
        const spreadY = Math.sin(angle) * Math.sqrt(radius) * 0.55;
        
        const rayDir = new THREE.Vector3(spreadX, spreadY, -1).normalize();
        rayDir.applyQuaternion(worldQuat);
        
        // Ray origin at the camera's exact world position
        const rayOrigin = worldPos.clone();
        
        const ray = new rapier.Ray(rayOrigin, rayDir);
        // solid = false ensures we ignore the player's own capsule that we start inside!
        const hit = world.castRay(ray, 50.0, false);
        
        if (hit && hit.collider) {
          const hitPoint = rayOrigin.clone().add(rayDir.clone().multiplyScalar(hit.toi));
          const idx = currentIdx.current;
          
          positions[idx * 3] = hitPoint.x;
          positions[idx * 3 + 1] = hitPoint.y;
          positions[idx * 3 + 2] = hitPoint.z;
          timestamps[idx] = now;
          
          const isMonster = hit.collider.parent()?.userData?.isMonster;
          if (isMonster) {
            isMonsterHitCallback();
            colors[idx * 3] = monsterColor.r;
            colors[idx * 3 + 1] = monsterColor.g;
            colors[idx * 3 + 2] = monsterColor.b;
          } else {
            colors[idx * 3] = baseColor.r;
            colors[idx * 3 + 1] = baseColor.g;
            colors[idx * 3 + 2] = baseColor.b;
          }
          
          currentIdx.current = (idx + 1) % MAX_POINTS;
          needsUpdate = true;
        }
      }
    }
    
    // Hide expired points
    for (let i = 0; i < MAX_POINTS; i++) {
      if (timestamps[i] > 0 && now - timestamps[i] > POINT_LIFETIME) {
        positions[i * 3] = 9999;
        timestamps[i] = 0;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
      if (positionAttr) positionAttr.needsUpdate = true;
      if (colorAttr) colorAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Scanner visual model */}
      <group ref={scannerRef}>
        <group position={[0.3, -0.4, -0.6]} rotation={[0, -0.2, 0]}>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.2, 0.4]} />
            <meshStandardMaterial color="#222" roughness={0.7} />
          </mesh>
          {/* Lens / Emit area */}
          <mesh position={[0, 0.0, -0.21]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
            <meshBasicMaterial color={"#055030"} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, -0.15, 0.1]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.06]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </group>

      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={materialRef}
          size={0.15}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>
    </>
  );
}

import { KeyboardControlsEntry } from '@react-three/drei';

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  scan = 'scan'
}

export const keyboardMap: KeyboardControlsEntry<Controls>[] = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.scan, keys: ['Space', 'Click'] }, // Click mapped elsewhere, mostly
];

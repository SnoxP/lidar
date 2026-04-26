import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export const mazeMap = [
  "####################",
  "#                  #",
  "#  ####  #######   #",
  "#  #        #      #",
  "#  #  ####  #  #####",
  "#  #  #     #      #",
  "#     #  ####  ##  #",
  "#######     #   #  #",
  "#           #   #  #",
  "#  ##########   #  #",
  "#               #  #",
  "####################"
];

const WALL_HEIGHT = 4;
const CELL_SIZE = 4;

export function Environment() {
  const walls = [];

  for (let z = 0; z < mazeMap.length; z++) {
    for (let x = 0; x < mazeMap[z].length; x++) {
      if (mazeMap[z][x] === '#') {
        walls.push(
          <RigidBody key={`${x}-${z}`} type="fixed" position={[x * CELL_SIZE - 40, WALL_HEIGHT / 2, z * CELL_SIZE - 20]}>
            <CuboidCollider args={[CELL_SIZE / 2, WALL_HEIGHT / 2, CELL_SIZE / 2]} />
          </RigidBody>
        );
      }
    }
  }

  return (
    <>
      <RigidBody type="fixed" position={[0, -0.1, 0]}>
        <CuboidCollider args={[100, 0.1, 100]} />
      </RigidBody>
      
      {walls}
    </>
  );
}

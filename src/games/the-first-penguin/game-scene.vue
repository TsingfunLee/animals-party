<template>
  <canvas
    ref="canvas"
    class="w-full h-full outline-none"
  />
</template>

<script setup lang="ts">
import { ref , onMounted, onBeforeUnmount} from 'vue';
import { ArcRotateCamera, Engine, Scene, Vector3, 
  BackgroundMaterial, Color3, MeshBuilder, 
  StandardMaterial,
  CannonJSPlugin,
  PhysicsImpostor,
  KeyboardEventTypes, 
} from '@babylonjs/core'
import '@babylonjs/loaders'
import * as CANNON from 'cannon-es'
import { curry } from 'lodash-es';
import { useClientGameConsole } from '../../composables/use-client-game-console';

import { Penguin } from './penguin'

import { useLoading } from '../../composables/use-loading';
import { SingleData, KeyName, GamepadData } from '../../types/player.type';

const loading = useLoading();
const gameConsole = useClientGameConsole();

const canvas = ref<HTMLCanvasElement>();
let engine: Engine;
let scene: Scene;
const penguins: Penguin[] = [];

function createEngine(canvas: HTMLCanvasElement){
  const engine = new Engine(canvas, true);
  return engine;
}

function createScene(engine:Engine){
  const scene = new Scene(engine);
  scene.createDefaultLight();

  const physicsPlugin = new CannonJSPlugin(true, 8, CANNON);
  scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

  return scene;
}

function createCamera(scene: Scene){
  const camera = new ArcRotateCamera('camera', 
    -Math.PI/2, 
    Math.PI/4, 
    34, 
    new Vector3(0, 0, -2),
    scene)

   return camera
}

function createSea(scene: Scene){
  const sea = MeshBuilder.CreateGround('sea', {
    height: 1000,
    width: 1000
  })

  const material = new BackgroundMaterial('seaMaterial', scene);
  material.useRGBColor = false;
  material.primaryColor = new Color3(0.57, 0.7, 0.83);

  sea.material = material;

  return sea;
}

function createIce(scene: Scene){
  const ice = MeshBuilder.CreateBox('ice', {
    width: 30,
    depth: 30,
    height: 4,
  });
  ice.material = new StandardMaterial('iceMaterial', scene);
  ice.physicsImpostor = new PhysicsImpostor(ice, PhysicsImpostor.BoxImpostor, 
    { mass: 0, friction: 0, restitution: 0}, scene
  )

  return ice;
}

async function createPenguin(id:string, index: number){
  const penguin = await new Penguin(`penguin-${index}`, scene, {
    position: new Vector3(5 * index, 10, 0),
    ownerId: id,
  }).init();

  return penguin;
}

// 企鹅碰撞检测
function detectCollideEvents(penguins: Penguin[]){
  const length = penguins.length;
  for(let i = 0; i < length; i++){
    for(let j = i; j < length; j++){
      if(i === j) continue;

      const aMesh = penguins[i].mesh;
      const bMesh = penguins[j].mesh;
      if(!aMesh || !bMesh) continue;

      if(aMesh.intersectsMesh(bMesh)){
        handleCollideEvent(penguins[i], penguins[j]);
      }
    }
  }
}

function handleCollideEvent(aPenguin: Penguin, bPenguin:Penguin){
  if(!aPenguin.mesh || !bPenguin.mesh) return;

  const aState = aPenguin.state;
  const bState = bPenguin.state;
  // 没有企鹅在attack状态，不做动作
  if(![aState, bState].includes('attack')) return;

  const direction = bPenguin.mesh.position.subtract(aPenguin.mesh.position);
  if(aState === 'attack'){
    bPenguin.assaulted(direction);
  }else{
    aPenguin.assaulted(direction.multiply(new Vector3(-1, -1, -1)));
  }
}

/** 根据key获取数据 */
const findSingleData = curry((keys: SingleData[], name: `${KeyName}`) => keys.find(key => key.name === name))

/**控制指定企鹅 */
function ctrlPenguin(penguin: Penguin, data: GamepadData){
  const { keys } = data;
  const findData = findSingleData(keys)

  // 攻击
  const attackData = findData('a')
  if(attackData){
    penguin.attack();
    return
  }

  // 方向移动
  const xData = findData('x-axis')
  const yData = findData('y-axis')

  const x = xData?.value ?? 0
  const y = yData?.value ?? 0

  if(x === 0 && y === 0) return;
  if(typeof x === 'number' && typeof y === 'number'){
    penguin.walk(new Vector3(x, 0, -y));
  }
}

function initGamepadEvent(){
  gameConsole.onGamepadData(data => {
    console.log(`[gameConsole.onGamepadData] data: `, data)

    const penguin = penguins[0];
    if(!penguin) return;
    ctrlPenguin(penguin, data);
  })


}

async function init() {
  if(!canvas.value){
    console.error('无法获取canvas');
    return;
  }

  engine = createEngine(canvas.value);
  scene = createScene(engine);
  createCamera(scene);

  createSea(scene);
  createIce(scene);
  const result = await Promise.allSettled([
    createPenguin('', 0),
    createPenguin('', 1), 
  ])
  result.forEach(data => {
    if(data.status !== 'fulfilled') return;
    penguins.push(data.value)
  })

  scene.onKeyboardObservable.add(keyboardInfo => {
    if(keyboardInfo.type !== KeyboardEventTypes.KEYDOWN) return;

    const penguin = penguins[0]

    switch(keyboardInfo.event.key){
      case 'ArrowLeft': {
        penguin.walk(new Vector3(-1, 0, 0));
        break;
      }
      case 'ArrowUp': {
        penguin.walk(new Vector3(0, 0, 1));
        break;
      }
      case 'ArrowRight': {
        penguin.walk(new Vector3(1, 0, 0))
        break;
      }
      case 'ArrowDown': {
        penguin.walk(new Vector3(0, 0, -1));
        break;
      }
      case ' ': {
        penguin.attack();
        break;
      }
    }
  });

  scene.registerAfterRender(() => {
    detectCollideEvents(penguins)
  })

  engine.runRenderLoop(() => {
    scene.render();
  })

  initGamepadEvent()

  loading.hide();
}

onMounted(()=>{
  init();
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  engine.dispose();
  window.removeEventListener('resize', handleResize);
})

function handleResize() {
  engine.resize()
}
</script>
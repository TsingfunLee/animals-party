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
} from '@babylonjs/core'
import '@babylonjs/loaders'
import * as CANNON from 'cannon-es'

import { Penguin } from './penguin'

import { useLoading } from '../../composables/use-loading';

const loading = useLoading();

const canvas = ref<HTMLCanvasElement>();
let engine: Engine;
let scene: Scene;

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
    position: new Vector3(0, 10, 0),
    ownerId: id,
  }).init();

  return penguin;
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
  await createPenguin('', 1);

  engine.runRenderLoop(()=>{
    scene.render();
  })

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
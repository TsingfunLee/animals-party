<template>
  <canvas
    ref="canvas"
    class="w-full h-full outline-none"
  />

  <q-dialog
    v-model="isGameOver"
    persistent
  >
    <div class="card gap-14">
      <div class="flex items-center text-3xl text-gray-600">
        <q-icon name="emoji_events" />
        游戏结束
      </div>
      <div class="text-3xl text-sky-700">
        玩家{{ winnerCodeName }} 获胜！
      </div>

      <div class="text-xl text-gray-400">
        按下A回到大厅
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount} from 'vue';
import { ArcRotateCamera, Engine, Scene, Vector3, 
  BackgroundMaterial, Color3, MeshBuilder, 
  StandardMaterial,
  CannonJSPlugin,
  PhysicsImpostor,
  KeyboardEventTypes, 
  Animation,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import * as CANNON from 'cannon-es'
import { curry } from 'lodash-es';
import { useClientGameConsole } from '../../composables/use-client-game-console';
import { useGameConsoleStore } from '../../stores/game-console.store';
import { Penguin } from './penguin'

import { getPlayerColor } from '../../common/utils';
import { colors } from 'quasar'

import { useLoading } from '../../composables/use-loading';
import { SingleData, KeyName, GamepadData } from '../../types/player.type';
import router, { RouteName } from '../../router/router';

const loading = useLoading();
const gameConsole = useClientGameConsole();
const gameConsoleStore = useGameConsoleStore()
const { getPaletteColor, textToRgb } = colors

const canvas = ref<HTMLCanvasElement>();
let engine: Engine;
let scene: Scene;
const penguins: Penguin[] = [];
const penguinInitPositions = [
  new Vector3(-5, 0, 5),
  new Vector3(5, 0, 5),
  new Vector3(-5, 0, -5),
  new Vector3(5, 0, -5)
]

const isGameOver = ref(false)
const winnerCodeName = ref('')

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

  // 建立动画
  const frameRate = 10
  const melting = new Animation('melting', 'scaling', 
    frameRate / 50,
    Animation.ANIMATIONTYPE_VECTOR3,
  )

  const keyFrames = [
    {
      frame: 0,
      value: new Vector3(1, 1, 1)
    },
    {
      frame: frameRate,
      value: new Vector3(0.1, 0, 0.1)
    }
  ]

  melting.setKeys(keyFrames)
  ice.animations.push(melting)

  scene.beginAnimation(ice, 0, frameRate)

  // 物理碰撞也要随着尺寸更新
  scene.registerBeforeRender(() => {
    ice.physicsImpostor?.setScalingUpdated()
  })

  return ice;
}

async function createPenguin(id:string, index: number){
  const codeName = gameConsole.getPlayerCodeName(id)
  const color = getPlayerColor({codeName})
  const hex = getPaletteColor(color)
  const rgb = textToRgb(hex)

  const position = penguinInitPositions[index % penguinInitPositions.length]
  // 超过4人时调整高度
  position.y = Math.round(index / penguinInitPositions.length) * 10 + 5

  const penguin = await new Penguin(`penguin-${index}`, scene, {
    position,
    ownerId: id,
    color: new Color3(rgb.r / 255, rgb.g / 255, rgb.b / 255)
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
    if(isGameOver.value) return backToLobby()
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

/**
 * 处理出界的企鹅
 * y 轴小于-3视为出界
 */
function detectOutOfBounds(penguins: Penguin[]){
  penguins.forEach(penguin => {
    if(!penguin.mesh) return;

    if(penguin.mesh.position.y < -3){
      penguin.mesh.dispose()
    }
  })
}

/**
 * 检测是否有赢家
 */
function detectWinner(penguins: Penguin[]){
  const alivePenguins = penguins.filter(penguin => {
    return penguin.mesh && !penguin.mesh.isDisposed()
  })

  if(alivePenguins.length === 1){
    engine.stopRenderLoop()
    const winnerId = alivePenguins[0].getPlayerId();

    winnerCodeName.value = gameConsole.getPlayerCodeName(winnerId)
    isGameOver.value = true
  }
}

function initGamepadEvent(){
  gameConsole.onGamepadData(data => {
    console.log(`[gameConsole.onGamepadData] data: `, data)

    const { playerId } = data;

    const penguin = penguins.find(penguin => penguin.params.ownerId === playerId)
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
  const result = await Promise.allSettled(gameConsoleStore.players.map(({clientId}, index) => createPenguin(clientId, index)))
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
    detectOutOfBounds(penguins)
    detectWinner(penguins)
  })

  engine.runRenderLoop(() => {
    scene.render();
  })

  initGamepadEvent()

  loading.hide();
}

async function backToLobby() {
  isGameOver.value = false

  await loading.show()
  router.push({
    name: RouteName.GAME_CONSOLE_LOBBY
  })
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

<style scoped lang="sass">
.card
  width: 30rem
  height: 24rem
  background: white
  border-radius: 2rem
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
</style>
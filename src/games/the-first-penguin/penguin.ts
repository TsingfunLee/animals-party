import { Scene, Color3, Vector3, SceneLoader, 
  AbstractMesh,AnimationGroup, MeshBuilder, PhysicsImpostor,
  StandardMaterial, Animation } from '@babylonjs/core';
import { defaultsDeep } from 'lodash-es';

export interface PenguinParams {
  /** 起始位置 */
  position?: Vector3;
  ownerId: string;
  color: Color3;
}

type State = 'idle' | 'walk' | 'attack';

interface AnimationMap {
  idle?: AnimationGroup,
  walk?: AnimationGroup,
  attack?: AnimationGroup,
}

export class Penguin {
  mesh?: AbstractMesh;
  name: string;
  scene: Scene;
  params: Required<PenguinParams> = {
    position: new Vector3(0, 0, 0),
    ownerId: '',
    color: new Color3(0.9, 0.9, 0.9),
  };

  state: State = 'walk';

  private animation: AnimationMap ={
    idle: undefined,
    walk: undefined,
    attack: undefined,
  }

  constructor(name: string, scene: Scene, params?: PenguinParams) {
    this.name = name;
    this.scene = scene;
    this.params = defaultsDeep(params, this.params);
  }

  private initAnimation(animationGroups: AnimationGroup[]){
    animationGroups.forEach(animationGroup => {
      animationGroup.stop();
    })

    const attackAni = animationGroups.find(({name}) => name === 'attack');
    const walkAni = animationGroups.find(({name}) => name === 'walk');
    const idleAni = animationGroups.find(({name})=> name === 'idle');

    this.animation.attack = attackAni;
    this.animation.walk = walkAni;
    this.animation.idle = idleAni;
  }

  private createHitBox(){
    const hitBox = MeshBuilder.CreateBox(`${this.name}-hit-box`, {
      width: 2, depth: 2, height: 4
    });
    hitBox.position = this.params.position
    hitBox.visibility = 0.5

    /** 使用物理效果 */
    const hitBoxImpostor = new PhysicsImpostor(hitBox, PhysicsImpostor.BoxImpostor,
      {mass: 1, friction: 0.7, restitution: 0.7},
      this.scene
    );

    hitBox.physicsImpostor = hitBoxImpostor;
    return hitBox;
  }

  private createBadge() {
    const badge = MeshBuilder.CreateBox(`${this.name}-badge`, {
      width: 0.5, depth: 0.5, height: 0.5
    });
    const material = new StandardMaterial('badgeMaterial', this.scene);
    material.diffuseColor = this.params.color;
    badge.material = material;

    const deg = Math.PI / 4;
    badge.rotation = new Vector3(deg, 0, deg);
    badge.visibility = 0.9;

    // 建立动画
    const frameRate = 10;
    const badgeRotate = new Animation('badgeRotate', 'rotation.y',
      frameRate / 5,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keyFrames = [
      {
        frame: 0,
        value: 0
      },
      {
        frame: frameRate,
        value: 2 * Math.PI
      }
    ]

    badgeRotate.setKeys(keyFrames);
    badge.animations.push(badgeRotate);

    this.scene.beginAnimation(badge, 0, frameRate, true);

    return badge;
  }

  async init(){
    const result = await SceneLoader.ImportMeshAsync('', '/games/the-first-penguin/', 'penguin.glb', this.scene);
    
    this.initAnimation(result.animationGroups);

    const hitBox = this.createHitBox();
    this.mesh = hitBox;

    const penguin = result.meshes[0];
    penguin.setParent(hitBox);
    penguin.position = new Vector3(0, -2, 0);

    const badge = this.createBadge();
    badge.setParent(hitBox);
    badge.position = new Vector3(0, 3, 0);

    return this;
  }
}
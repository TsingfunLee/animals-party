import { Scene, Color3, Vector3, SceneLoader, 
  AbstractMesh,AnimationGroup, MeshBuilder, PhysicsImpostor,
  StandardMaterial, Animation, 
  InterpolateValueAction,
  ActionManager,
  Action} from '@babylonjs/core';
import { defaultsDeep, debounce , throttle} from 'lodash-es';

export interface PenguinParams {
  /** 起始位置 */
  position?: Vector3;
  ownerId: string;
  color?: Color3;
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

  private readonly maxVelocity = new Vector3(6, 6, 6);

  private rotateAction?: InterpolateValueAction;

  private readonly assaultedForce = new Vector3(20, 20, 20);

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

  private initActionManager(){
    if(!this.mesh) return;

    this.mesh.actionManager = new ActionManager(this.scene);

    this.rotateAction = new InterpolateValueAction(
      ActionManager.NothingTrigger,
      this.mesh,
      'rotation',
      new Vector3(0, 3, 0),
      300
    );
    this.mesh.actionManager.registerAction(this.rotateAction);
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

    this.initActionManager()

    this.setState('idle');

    this.scene.registerBeforeRender(() => {
      this.limitMaxVelocity();
    })

    return this;
  }

  walk(force: Vector3){
    if(!this.mesh){
      throw new Error('未创建mesh');
    }

    if(this.state === 'attack') return;

    this.mesh.physicsImpostor?.applyImpulse(force, Vector3.Zero());
  
    // 转向
    const targetAngle = this.getForceAngle(force);
    const currentAngle = this.mesh.rotation.y;

    /**如果角度超过180度 */
    if(Math.abs(targetAngle - currentAngle) > Math.PI){
      const supplementaryAngle = Math.PI * 2 - Math.abs(currentAngle)
      if(currentAngle < 0){
        this.mesh.rotation = new Vector3(0, supplementaryAngle, 0);
      }else{
        this.mesh.rotation = new Vector3(0, -supplementaryAngle, 0);
      }
    }

    if(this.rotateAction){
      this.rotateAction.value = new Vector3(0, targetAngle, 0);
      this.rotateAction.execute();

      this.animation.walk?.start(true);
      this.setState('walk');
      this.setIdleStateDebounce();
    }
  }

  attack = throttle(() => {
    this.setState('attack');
    this.leaveAttackStateDebounce();
    this.setIdleStateDebounce.cancel()
  }, 2000, {
    leading: true,
    trailing: false,
  })

  /**
   * 被攻击
   * @param direction 移动方向
   */
  assaulted = throttle((direction: Vector3) => {
    if (!this.mesh) {
      throw new Error('未建立Mesh')
    }

    // 计算力量
    const force = direction.normalize().multiply(this.assaultedForce);
    this.mesh.physicsImpostor?.applyImpulse(force, Vector3.Zero());

  }, 500, {
    leading: true,
    trailing: false
  })

  private leaveAttackStateDebounce = debounce(() => {
    this.setState('idle');
  }, 1000, {
    leading: false,
    trailing: true,
  })

  private limitMaxVelocity(){
    if(!this.mesh || !this.mesh.physicsImpostor) return;

    const velocity = this.mesh.physicsImpostor.getLinearVelocity();
    if(!velocity) return;

    const currentSpeed = velocity.length();
    if(currentSpeed > this.maxVelocity.length()){
      const newVelocity = velocity.normalize().multiply(this.maxVelocity);
      this.mesh.physicsImpostor?.setLinearVelocity(newVelocity);
    }
  }

  /** 获取力与企鹅的夹角 */
  private getForceAngle(force: Vector3){
    if(!this.mesh){
      throw new Error('未创建Mesh');
    }

    const forceVector = force.normalize();
    const characterVector = new Vector3(0, 0, 1);
    const deltaAngle = Math.acos(Vector3.Dot(forceVector, characterVector));
  
    /**反余弦求得角度范围为0-180度， 需自行判断负角
     * 力向量x轴为负时，表示夹角为负
     */
    if(forceVector.x < 0){
      return deltaAngle * -1;
    }

    return deltaAngle;
  }

  private setState(value: State){
    this.processStateAnimation(value);
    this.state = value;
  }

  private processStateAnimation(newState: State){
    if(newState === this.state) return;

    const playingAni = this.getAnimationByState(this.state);
    const targetAni = this.getAnimationByState(newState);

    this.state = newState;
    if(!targetAni || !playingAni) return;

    const loop = this.state !== 'attack';

    const offset = this.state === 'attack' ? 0.3 : undefined;

    this.scene.onBeforeRenderObservable.runCoroutineAsync(this.animationBlending(playingAni, targetAni, loop, offset));
  }

  private *animationBlending(fromAni: AnimationGroup, 
    toAni: AnimationGroup, loop = true, offset = 0.1){
      let  currentWeight = 1;
      let targetWeight = 0;

      toAni.play(loop);

      while(targetWeight < 1){
        targetWeight += offset;
        currentWeight -= offset;

        toAni.setWeightForAllAnimatables(targetWeight);

        fromAni.setWeightForAllAnimatables(currentWeight);

        yield;
      }

      fromAni.stop();
  }

  private getAnimationByState(value: State){
    return this.animation[value];
  }

  private setIdleStateDebounce = debounce(async () => {
    this.setState('idle')
  }, 500)
}
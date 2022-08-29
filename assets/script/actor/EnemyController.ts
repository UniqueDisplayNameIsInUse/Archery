import { Animation, ccenum, CCFloat, CCInteger, Collider, Component, game, ICollisionEvent, macro, math, Node, SkeletalAnimationState, TerrainBlockLightmapInfo, v3, Vec3, _decorator } from 'cc';
import { EffectManager } from '../effect/EffectManager';
import { Actor } from './Actor';
import { PhysicsGroup } from './PhysicsGroup';
import { PlayerController } from './PlayerController';
import { Projectile } from './Projectile';
import { ProjectileEmitter } from './ProjectileEmiiter';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

let temp = v3();

class AIType {
    static readonly Chase: string = "chase";
    static readonly Attack: string = "attack";
    static readonly Idle: string = "idle";
}

export enum EnemyCareer {
    Melee = 0,
    Range = 1
}
ccenum(EnemyCareer)

/** 
 * 敌人控制器 
*/
@ccclass('EnemyController')
@requireComponent(Actor)
export class EnemyController extends Component {

    actor: Actor | null = null;

    @property(CCFloat)
    attackRange: number = 0.5;

    @property({ type: EnemyCareer })
    career: EnemyCareer = EnemyCareer.Melee;

    target: Actor | null = null;

    aiType: AIType = AIType.Chase;

    projectileEmitter: ProjectileEmitter;

    @property(Node)
    projectileStart: Node | null = null;

    @property(CCInteger)
    attackInterval: number = 5000;

    lastAttackTime: number = 0;

    start() {
        this.actor = this.node.getComponent(Actor);
        if (this.career == EnemyCareer.Range) {
            this.projectileEmitter = this.node.getComponent(ProjectileEmitter);
        }

        this.target = PlayerController.instance?.node.getComponent(Actor);
        this.schedule(this.executeAI, 1.0, macro.REPEAT_FOREVER, 1.0)

        const collider = this.node.getComponent(Collider);
        collider?.on("onTriggerEnter", this.onTriggerEnter, this);

        this.node.on("onFrameAttack", this.onFrameAttack, this);

        this.actor.skeletalAnimation?.on(Animation.EventType.FINISHED, this.onDieFinished, this);
    }

    onDestroy() {
        this.unschedule(this.executeAI);

        const collider = this.node.getComponent(Collider);
        collider?.off("onTriggerEnter", this.onTriggerEnter, this);

        this.node.off("onFrameAttack", this.onFrameAttack, this);

        this.actor.skeletalAnimation?.off(Animation.EventType.FINISHED, this.onDieFinished, this);
    }

    executeAI() {
        // 找不到目标
        if (this.target == null) {
            return;
        }

        // 我不处于 Run/Idle 状态
        if (this.actor.currState != StateDefine.Idle && this.actor.currState != StateDefine.Run) {
            return;
        }

        const canAttack = game.totalTime - this.lastAttackTime >= this.attackInterval;        

        // 目标已死或我不能攻击
        if (this.target.currState == StateDefine.Die || !canAttack) {
            this.aiType = AIType.Idle;
            this.actor.changeState(AIType.Idle);
            return;
        }

        // 判断是否在攻击范围内
        const distance = Vec3.distance(this.node.worldPosition, this.target.node.worldPosition);

        if (distance > this.attackRange) {
            this.aiType = AIType.Chase;
            this.actor.changeState(StateDefine.Run);
            Vec3.subtract(temp, this.target!.node.worldPosition, this.node.worldPosition);
            temp.normalize();
            this.actor.destForward.set(temp.x, 0, temp.z);
            return;
        }

        this.aiType = AIType.Attack;
        Vec3.subtract(temp, this.target!.node.worldPosition, this.node.worldPosition);
        temp.normalize();
        this.actor.destForward.set(temp.x, 0, temp.z);
        this.actor.node.forward.set(temp.x, 0, temp.z);

        this.actor.attack();
        this.lastAttackTime = game.totalTime;
    }

    isFaceTarget(): boolean {
        Vec3.subtract(temp, this.target.node.worldPosition, this.node.worldPosition);
        temp.y = 0;
        temp.normalize();
        return Vec3.angle(this.node.forward, temp) < math.toRadian(60);
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() != PhysicsGroup.PlayerProjectile) {
            return;
        }

        const projectile = event.otherCollider.getComponent(Projectile);
        const hostActor = projectile!.host?.getComponent(Actor);
        let hurtDirection = v3()
        Vec3.subtract(hurtDirection, event.otherCollider.node.worldPosition, event.selfCollider.node.worldPosition);
        hurtDirection.normalize();
        this.actor.hurt(hostActor!.damange, hostActor!, hurtDirection);
    }

    onFrameAttack() {
        if (!this.target) {
            return;
        }

        if (this.career == EnemyCareer.Melee) {
            let dir = v3();
            Vec3.subtract(dir, this.target.node.worldPosition, this.node.worldPosition);
            let angle = Vec3.angle(this.node.forward, dir);
            if (angle < Math.PI * 0.5) {
                const distance = dir.length();

                if (distance < this.attackRange) {
                    //this.target.hurt(this.damange, this);
                    //this.target.hurt(0, this);
                }
            }
        } else {
            let projectile = this.projectileEmitter!.create();
            projectile.node.worldPosition = this.projectileStart.worldPosition;

            let prop = projectile.projectProperty;
            prop.chase = math.randomRange(0, 100) < 10;
            projectile.target = this.target.node;

            projectile.host = this.node;
            Vec3.subtract(temp, this.target.node.worldPosition, this.node.worldPosition);
            temp.normalize();
            projectile.node.forward = temp;
            projectile.fire();
        }
    }

    onDieFinished(eventType: Animation.EventType, state: SkeletalAnimationState) {
        if (state.name == StateDefine.Die) {
            EffectManager.instance?.playDieEffect(this.node.worldPosition);
            this.node.removeFromParent()
        }
    }
}


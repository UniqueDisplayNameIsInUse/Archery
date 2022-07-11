import { AmbientInfo, Animation, CCFloat, Collider, find, ICollisionEvent, InstancedBuffer, log, macro, math, PhysicsSystem, SkeletalAnimationState, v3, Vec3, _decorator } from 'cc';
import { EffectManager } from '../effect/EffectManager';
import { MathUtil } from '../util/MathUtil';
import { Actor, StateDefine } from './Actor';
import { PhysicsGroup } from './PhysicsGroup';
import { Projectile } from './Projectile';
const { ccclass, property } = _decorator;

class AIType {

    static readonly Chase: string = "chase";

    static readonly Attack: string = "attack";
}

@ccclass('EnemyController')
export class EnemyController extends Actor {

    @property(CCFloat)
    attackRange: number = 0.5;

    target: Actor | null = null;

    aiType: AIType = AIType.Chase;

    enableAI: boolean = true;

    start() {
        this.target = find("Player")!.getComponent(Actor);
        this.schedule(this.think, 1.0, macro.REPEAT_FOREVER, 2.0)
        super.start()

        const collider = this.node.getComponent(Collider);
        collider?.on("onTriggerEnter", this.onTriggerEnter, this);

        this.node.on("onFrameAttack", this.onFrameAttack, this);

        this.skeletalAnimation?.on(Animation.EventType.FINISHED, this.onDieFinished, this);
    }

    think() {

        //log("think");

        if (this.target == null) {
            return;
        }

        if (this.target.currState == StateDefine.Die) {
            return;
        }

        this.fire = false;

        const distance = Vec3.distance(this.node.worldPosition, this.target.node.worldPosition);

        if (distance > this.attackRange) {
            this.aiType = AIType.Chase;
            return;
        }

        this.aiType = AIType.Attack;
        this.fire = true;
    }

    update(deltaTime: number) {
        if (!this.enableAI) {
            return;
        }

        if (this.currState == StateDefine.Hit || this.currState == StateDefine.Die) {
            return;
        }

        if (this.target == null || this.target.dead) {
            return;
        }

        if (this.target.dead) {
            return;
        }

        switch (this.aiType) {
            case AIType.Chase:
                let temp = v3();
                Vec3.subtract(temp, this.target!.node.worldPosition, this.node.worldPosition);
                MathUtil.rotateToward(this.forward, this.node.forward, temp, math.toRadian(this.angularSpeed.y))
                this.node.forward = this.forward;
                this.changeState(StateDefine.Run);
                break;
            case AIType.Attack:
                this.changeState(StateDefine.Attack)
                break;
        }

        super.update(deltaTime);
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() == PhysicsGroup.PROJECTILE) {
            const projectile = event.otherCollider.getComponent(Projectile);
            const hostActor = projectile!.host?.getComponent(Actor);

            let hurtDirection = v3()
            Vec3.subtract(hurtDirection, event.otherCollider.node.worldPosition, event.selfCollider.node.worldPosition);
            hurtDirection.normalize();
            this.hurt(hostActor!.damange, hostActor!, hurtDirection);            
        }
    }

    onFrameAttack() {
        if (!this.target) {
            return;
        }

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
    }

    onDieFinished(eventType: Animation.EventType, state: SkeletalAnimationState) {
        if (state.name == StateDefine.Die) {
            EffectManager.inst?.playDieEffect(this.node.worldPosition);
            this.node.removeFromParent()
        }
    }
}


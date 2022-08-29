import { _decorator, SkeletalAnimation, Animation, SkeletalAnimationState, Collider, Vec3, Component, RigidBody, math, v3, CCFloat } from 'cc';
import { Events } from '../events/Events';
import { MathUtil } from '../util/MathUtil';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

let tempVelocity: Vec3 = v3();

/**
 * 角色和怪物的移动、状态管理器
 */
@ccclass('Actor')
export class Actor extends Component {

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation | null = null;

    currState: StateDefine | string = StateDefine.Idle;

    hp: number = 2;

    damange: number = 1;

    collider: Collider | null = null;

    destForward: Vec3 = v3()

    @property(CCFloat)
    linearSpeed: number = 1.0;

    @property(CCFloat)
    angularSpeed: number = 90;

    rigidbody: RigidBody | null = null;

    get dead(): boolean {
        return this.currState == StateDefine.Die;
    }

    start() {
        this.rigidbody = this.node.getComponent(RigidBody);
        this.collider = this.node.getComponent(Collider);
        this.skeletalAnimation?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    onDestroy() {
        this.skeletalAnimation?.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    update(deltaTime: number) {
        if (this.currState == StateDefine.Die) {
            return;
        }

        // let f = v3();
        // MathUtil.rotateToward(f, this.node.forward, this.forward, math.toRadian(this.angularSpeed) * deltaTime);
        // this.node.forward = f;

        let a = MathUtil.signAngle(this.node.forward, this.destForward, Vec3.UP);
        let as = v3(0, a*20, 0);
        this.rigidbody.setAngularVelocity(as);

        switch (this.currState) {
            case StateDefine.Run:
                this.doMove();
                break;
        }
    }

    doMove() {
        let speed = this.linearSpeed * this.destForward.length();
        tempVelocity.x = math.clamp(this.node.forward.x, -1, 1) * speed;
        tempVelocity.z = math.clamp(this.node.forward.z, -1, 1) * speed;
        this.rigidbody?.setLinearVelocity(tempVelocity);
    }

    stopMove() {
        this.rigidbody?.setLinearVelocity(Vec3.ZERO);
    }

    changeState(state: StateDefine | string) {

        if (state == this.currState && state != StateDefine.Hit) {
            return;
        }

        if (this.currState == StateDefine.Die) {
            return;
        }

        if (this.currState == StateDefine.Run) {
            this.stopMove()
        }

        this.skeletalAnimation?.crossFade(state as string, 0.1);
        this.currState = state;
    }

    onAnimationFinished(eventType: Animation.EventType, state: SkeletalAnimationState) {
        if (state.name == StateDefine.Attack) {
            this.changeState(StateDefine.Idle);
        }

        if (state.name == StateDefine.Hit) {
            this.changeState(StateDefine.Idle);
        }
    }

    hurt(dam: number, hurtSource: Actor | null, hurtDirection: Vec3) {
        this.changeState(StateDefine.Hit);

        if (this.currState != StateDefine.Die) {
            const force = -1.0;
            hurtDirection.multiplyScalar(force);
            this.rigidbody?.applyImpulse(hurtDirection);
            this.hp -= dam;
            if (this.hp <= 0) {
                this.onDie()
                hurtSource?.node.emit(Events.onEnemyKilled, this)
            }
        }
    }

    onDie() {
        if (this.currState == StateDefine.Die) {
            return;
        }
        this.changeState(StateDefine.Die);
        this.node.emit(Events.onDead, this.node)
    }

    attack() {
        this.changeState(StateDefine.Attack);
    }
}


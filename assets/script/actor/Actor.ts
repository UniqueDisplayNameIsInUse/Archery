import { _decorator, SkeletalAnimation, Animation, SkeletalAnimationState, Collider, Vec3, Component, RigidBody, math, v3, CCFloat, quat } from 'cc';
import { Events } from '../events/Events';
import { MathUtil } from '../util/MathUtil';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

let tempVelocity: Vec3 = v3();

@ccclass('Actor')
export class Actor extends Component {

    currState: StateDefine | string = StateDefine.Idle;

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation | null = null;

    hp: number = 2;

    damange: number = 1;

    collider: Collider | null = null;

    forward: Vec3 = v3()

    @property(CCFloat)
    linearSpeed: number = 1.0;

    @property(CCFloat)
    angularSpeed: number = 90;

    rigidbody: RigidBody | null = null;

    get dead(): boolean {
        return this.currState == StateDefine.Die;
    }

    onStateChanged: (actor: Actor, state: StateDefine) => void;

    start() {
        this.rigidbody = this.node.getComponent(RigidBody);
        this.skeletalAnimation?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        this.collider = this.node.getComponent(Collider);
    }

    onDestroy() {
        this.skeletalAnimation?.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    update(deltaTime: number) {
        if (this.currState == StateDefine.Die) {
            return;
        }

        switch (this.currState) {
            case StateDefine.Run:
                this.doMove(deltaTime);
                this.changeState(StateDefine.Run);
                break;
            case StateDefine.Idle:
                break;
        }
    }

    doMove(deltaTime: number) {
        let f = v3();
        MathUtil.rotateToward(f, this.node.forward, this.forward, math.toRadian(this.angularSpeed) * deltaTime);                
        this.node.forward = f;
        
        let speed = this.linearSpeed * this.forward.length();
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
        let stateChangedCallback = this.onStateChanged;
        if (stateChangedCallback) {
            stateChangedCallback(this, this.currState);
        }
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
        const force = -1.0;
        hurtDirection.multiplyScalar(force);
        this.rigidbody?.applyImpulse(hurtDirection);
        this.hp -= dam;
        if (this.hp <= 0) {
            this.onDie()
            hurtSource?.node.emit(Events.onKilled, this)
        }
    }

    onDie() {
        if (this.currState == StateDefine.Die) {
            return;
        }
        this.changeState(StateDefine.Die);
        this.node.emit(Events.onDead, this)
    }

    attack() {
        this.changeState(StateDefine.Attack);
    }
}


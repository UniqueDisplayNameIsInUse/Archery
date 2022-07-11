import { _decorator, Component, Node, SkeletalAnimation, Animation, SkeletalAnimationState, log, director, logID, Collider, Vec3 } from 'cc';
import { Movable } from './Movable';
import { PhysicsGroup } from './PhysicsGroup';
const { ccclass, property } = _decorator;

export class StateDefine {

    static readonly Idle: string = "idle";

    static readonly Attack: string = "attack";

    static readonly Hit: string = "hit";

    static readonly Run: string = "run";

    static readonly Die: string = "die";
}

@ccclass('Actor')
export class Actor extends Movable {

    currState: StateDefine | string = StateDefine.Idle;

    fire: boolean = false;

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation | null = null;

    hp: number = 2;

    damange: number = 1;

    collider: Collider | null = null;

    get dead(): boolean {
        return this.currState == StateDefine.Die;
    }

    start() {
        this.skeletalAnimation?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        this.collider = this.node.getComponent(Collider);
    }

    update(deltaTime: number) {

        if (this.currState == StateDefine.Die) {
            return;
        }

        switch (this.currState) {
            case StateDefine.Run:
                this.doMove();
                this.changeState(StateDefine.Run);
                break;
            case StateDefine.Idle:
                if (this.fire) {
                    this.changeState(StateDefine.Attack);
                    break;
                }
                break;
        }

    }

    changeState(state: StateDefine | string) {

        if (state == this.currState && state != StateDefine.Hit) {
            return;
        }

        if (this.currState == StateDefine.Die) {
            return;
        }

        if(this.currState == StateDefine.Run){
            this.stopMove()
        }

        this.skeletalAnimation?.crossFade(state as string, 0.3);
        this.currState = state;

        //console.log("change to sate:", this.currState, ", node name is: ", this.node.name);
    }

    onAnimationFinished(eventType: Animation.EventType, state: SkeletalAnimationState) {

        if (eventType == Animation.EventType.FINISHED) {
            if (state.name == StateDefine.Attack) {
                this.changeState(StateDefine.Idle);
            }

            if (state.name == StateDefine.Hit) {
                this.changeState(StateDefine.Idle);
            }
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
            hurtSource?.node.emit("onKilled", this)
        }
    }

    onDie() {
        if (this.currState == StateDefine.Die) {
            return;
        }
        this.changeState(StateDefine.Die);
        this.node.emit("onDead", this)
    }
}


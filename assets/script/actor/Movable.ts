import { _decorator, Component, Node, Vec3, CCFloat, RigidBody, math, v3 } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Movable')
export class Movable extends Component {

    linearVelocity: Vec3 = new Vec3(0, 0, 0);

    @property(CCFloat)
    speedFactor: number = 1.0;

    @property(RigidBody)
    rigidbody: RigidBody | null = null;

    @property(Vec3)
    angularSpeed: Vec3 = v3();

    forward: Vec3 = v3();

    start() {

        if (this.rigidbody == null) {
            this.rigidbody = this.getComponent(RigidBody);
        }
    }

    doMove() {

        this.linearVelocity.x = math.clamp(this.forward.x, -1, 1) * this.speedFactor;
        this.linearVelocity.y = math.clamp(this.forward.y, -1, 1) * this.speedFactor;
        this.linearVelocity.z = math.clamp(this.forward.z, -1, 1) * this.speedFactor;

        this.rigidbody?.setLinearVelocity(this.linearVelocity);
    }

    stopMove(){
        this.forward.x = 0;
        this.forward.y = 0;
        this.forward.z = 0;
        this.doMove()
    }
}


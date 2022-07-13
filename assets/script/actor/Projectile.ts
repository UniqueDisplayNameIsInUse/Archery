import { Collider, ICollisionEvent, log, math, Node, Pool, Quat, quat, RigidBody, v3, Vec3, _decorator } from 'cc';
import { EffectManager } from '../effect/EffectManager';
import { MathUtil } from '../util/MathUtil';
import { Movable } from './Movable';
import { PhysicsGroup } from './PhysicsGroup';
import { ProjectileProperty } from './ProjectileProperty';
const { ccclass, property } = _decorator;

@ccclass('Projectile')
export class Projectile extends Movable {

    @property(Collider)
    collider: Collider | null = null;

    duration: number = 3.0;

    startTime: number = 0;

    initialDirection: Vec3 = v3();

    isFire: boolean = false;

    rigidbody: RigidBody | null = null;

    position: Vec3 = v3()

    projectProperty: ProjectileProperty | null = null;

    host: Node | null = null;

    target: Node | null = null;

    pool: Pool<Node> | null = null;

    start() {
        this.collider?.on("onTriggerEnter", this.onTriggerEnter, this);
        this.rigidbody = this.node.getComponent(RigidBody);
    }

    onDestroy() {
        this.collider.off("onTriggerEnter", this.onTriggerEnter, this);
    }

    fire(dir: Vec3) {
        this.initialDirection = dir.clone()
        this.isFire = true;
        this.startTime = 0;
    }

    update(deltaTime: number) {

        this.startTime += deltaTime;
        if (this.startTime >= this.projectProperty!.duration) {
            this.removeProjectile()
        }

        if (this.projectProperty?.chase) {
            Vec3.subtract(this.forward, this.target!.worldPosition, this.node.worldPosition);
            this.forward.y = 0;
            this.forward.normalize();
            const dot = Vec3.dot(this.forward, this.node.forward);
            let maxAngle = this.angularSpeed.y * deltaTime;

            let v = v3()
            MathUtil.rotateToward(v, this.node.forward, this.forward, math.toRadian(maxAngle))            
            this.node.forward = v;
        }

        Vec3.scaleAndAdd(this.position, this.node.worldPosition, this.node.forward, this.speedFactor * deltaTime);
        this.node.worldPosition = this.position;
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() == PhysicsGroup.ENEMY) {
            this.projectProperty!.penetration--;
            if (this.projectProperty!.penetration <= 0) {
                this.removeProjectile()
            }
            EffectManager.inst?.playExplore(event.selfCollider.node.worldPosition);
        }
    }

    removeProjectile() {
        this.node.active = false;        
        this.pool?.free(this.node);
    }
}


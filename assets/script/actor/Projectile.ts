import { CCFloat, Collider, Component, ICollisionEvent, math, Node, Pool, v3, Vec3, _decorator } from 'cc';
import { Events } from '../events/Events';
import { GameMain } from '../GameMain';
import { MathUtil } from '../util/MathUtil';
import { PhysicsGroup } from './PhysicsGroup';
import { ProjectileProperty } from './ProjectileProperty';
const { ccclass, property } = _decorator;

@ccclass('Projectile')
export class Projectile extends Component {

    @property(Collider)
    collider: Collider | null = null;

    startTime: number = 0;

    isFired: boolean = false;

    position: Vec3 = v3()

    projectProperty: ProjectileProperty | null = null;

    host: Node | null = null;

    target: Node | null = null;

    pool: Pool<Node> | null = null;

    forward : Vec3 = v3()

    angularSpeed : Vec3 = v3();

    @property(CCFloat)
    linearSpeed : number = .0;

    start() {                
        this.collider?.on("onTriggerEnter", this.onTriggerEnter, this);        
    }

    onDestroy() {
        this.collider.off("onTriggerEnter", this.onTriggerEnter, this);
    }

    fire() {
        this.isFired = true;
        this.startTime = 0;
    }

    update(deltaTime: number) {

        this.startTime += deltaTime;
        if (this.startTime >= this.projectProperty!.liftTime) {
            this.node.emit(Events.onProjectileDead, this.node);
        }

        if (this.projectProperty?.chase) {
            Vec3.subtract(this.forward, this.target!.worldPosition, this.node.worldPosition);
            this.forward.y = 0;
            this.forward.normalize();            
            let maxAngle = this.angularSpeed.y * deltaTime;

            let v = v3()
            MathUtil.rotateToward(v, this.node.forward, this.forward, math.toRadian(maxAngle))            
            this.node.forward = v;
        }

        Vec3.scaleAndAdd(this.position, this.node.worldPosition, this.node.forward, this.linearSpeed * deltaTime);
        this.node.worldPosition = this.position;
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (event.otherCollider.getGroup() == PhysicsGroup.ENEMY) {
            this.projectProperty!.penetration--;
            if (this.projectProperty!.penetration <= 0) {
                this.node.emit(Events.onProjectileDead, this.node)
            }
            GameMain.EffectManager?.playExplore(event.selfCollider.node.worldPosition);
        }
    }    
}


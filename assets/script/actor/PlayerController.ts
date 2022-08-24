import { Component, director, instantiate, math, Node, Pool, Prefab, randomRange, randomRangeInt, v3, Vec3, _decorator } from 'cc';
import { Events } from '../events/Events';
import { VirtualInput } from '../input/VirtualInput';
import { GameMain } from '../GameMain';
import { MathUtil } from '../util/MathUtil';
import { Actor } from './Actor';
import { Projectile } from './Projectile';
import { ProjectileProperty } from './ProjectileProperty';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerController')
@requireComponent(Actor)
export class PlayerController extends Component {

    @property(Node)
    bow: Node | null = null;

    @property(Node)
    bowstring: Node | null = null;

    @property(Prefab)
    arrow: Prefab | null = null;

    shootDirection: Vec3 = v3();

    exp: number = 0;

    maxExp: number = 20;

    level: number = 0;

    skillPoint: number = 10;

    private _bulletCount: number = 0;

    private _splitAngle: number[] = [];

    private _chaseRate: number = 5.0;

    private _penetration: number = 0.0;

    projectilePool: Pool<Node> | null = null;

    actor: Actor | null = null;

    onLoad() {
        GameMain.PlayerController = this;
    }

    start() {
        this.actor = this.node.getComponent(Actor);
        this.node.on("onFrameAttackLoose", this.onFrameAttackLoose, this);
        this.node.on(Events.onKilled, this.onKilled, this);

        this.bulletCount = 3;

        this.projectilePool = new Pool<Node>(
            (): Node => {
                return instantiate(this.arrow!);
            },
            50,
            (n: Node) => {
                n.removeAllChildren()
                n.destroy()
            }
        )
    }

    onDestroy() {
        GameMain.PlayerController = null;

        this.node.off("onFrameAttackLoose", this.onFrameAttackLoose, this);
        this.node.off(Events.onKilled, this.onKilled, this);

        this.projectilePool.destroy()
        this.projectilePool = null;
    }

    update(dt: number) {
        if (this.actor.currState == StateDefine.Die || this.actor.currState == StateDefine.Hit) {
            return;
        }

        const len = this.handleInput();
        if (len > 0) {
            this.actor.changeState(StateDefine.Run);
        } else {
            // 查找面前是否有怪物
            let enemy = this.getEnemy()
            if (enemy) {
                Vec3.subtract(this.actor.forward, enemy.worldPosition, this.node.worldPosition);
                this.actor.forward.normalize()

                // 如果有射击
                this.actor?.changeState(StateDefine.Attack)
            } else {
                this.actor.changeState(StateDefine.Idle);
            }
        }
    }

    handleInput(): number {
        let x = VirtualInput.horizontal;
        let y = VirtualInput.vertical;

        this.actor.forward.x = x;
        this.actor.forward.z = -y;
        this.actor.forward.y = 0;
        this.actor.forward.normalize();
        return this.actor.forward.length();
    }

    onFrameAttackLoose() {

        const arrowStartPos = this.bowstring!.worldPosition;
        Vec3.subtract(this.shootDirection, this.bow!.worldPosition, arrowStartPos);
        this.shootDirection.normalize();

        let forward = v3()

        for (let i = 0; i < this.bulletCount; i++) {
            const arrow = this.projectilePool?.alloc()!;
            arrow.active = true
            arrow.on(Events.onProjectileDead, this.onProjectileDead, this);

            MathUtil.rotateAround(forward, this.node.forward, Vec3.UP, this._splitAngle[i]);
            arrow.forward = forward;

            arrow.worldPosition = arrowStartPos;
            if (!arrow.parent)
                director.getScene()!.addChild(arrow);

            let projectile = arrow.getComponent(Projectile);
            if (projectile == null) {
                throw new Error("missing component: Projectile");
            }
            projectile.host = this.node;

            let property = new ProjectileProperty();
            property.penetration = this._penetration;
            const willChase = randomRange(0, 100) < this._chaseRate;
            if (willChase) {
                projectile.target = this.getEnemy();
                property.chase = willChase && projectile.target != null;
            }
            projectile.projectProperty = property;

            projectile?.fire();
        }
    }

    set bulletCount(count: number) {
        if (count <= 0) {
            this._bulletCount = 1;
        }
        this._bulletCount = count;
        this._splitAngle = [];

        const a = math.toRadian(10);
        const even = count % 2 != 0;

        const len = Math.floor(this._bulletCount / 2);
        for (let i = 0; i < len; i++) {
            this._splitAngle.push(-a * (i + 1));
            this._splitAngle.push(a * (i + 1));
        }

        if (even) {
            this._splitAngle.push(0);
        }
    }

    get bulletCount(): number { return this._bulletCount; }

    set chaseRate(val: number) {
        this._chaseRate = math.clamp(this._chaseRate + val, 0, 100);
    }

    get chaseRate(): number {
        return this._chaseRate;
    }

    onKilled(actor: Actor) {
        this.exp++;
        this.node.emit(Events.onExpGain);

        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.maxExp *= 1.1
            this.level++;
            this.skillPoint++;
            this.onUpgradeLevel();
        }
    }

    onUpgradeLevel() {
        this.node.emit(Events.onPlayerUpgrade);
    }

    set penetraion(val: number) {
        this._penetration = math.clamp(this._penetration + val, 0, 100);
    }

    getEnemy(): Node | null {
        let enemies = GameMain.Level?.enemies;
        if (!enemies || enemies?.length == 0) {
            return null;
        }
        
        let nearDistance = 99999;
        let nearastEnemy : Node | null = null;
        for(let enemy of enemies){
            const distance = Vec3.distance(this.node.worldPosition, enemy.worldPosition);
            if( distance < nearDistance){
                nearDistance = distance;
                nearastEnemy = enemy;
            }
        }

        if(nearastEnemy)
            return nearastEnemy;
    }

    onProjectileDead(node: Node) {
        node.off(Events.onProjectileDead, this.onProjectileDead, this);
        this.projectilePool.free(node);
        node.active = false;
    }
}


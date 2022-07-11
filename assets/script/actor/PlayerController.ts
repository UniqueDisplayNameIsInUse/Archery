import { director, find, instantiate, log, macro, math, Node, Pool, Prefab, randomRange, randomRangeInt, Scene, v3, Vec3, _decorator } from 'cc';
import { Map } from '../map/Map';
import { MathUtil } from '../util/MathUtil';
import { Actor, StateDefine } from './Actor';
import { KeyboardInput } from './KeyboardInput';
import { Projectile } from './Projectile';
import { ProjectileProperty } from './ProjectileProperty';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerController')
@requireComponent(KeyboardInput)
export class PlayerController extends Actor {

    @property(KeyboardInput)
    keyboardInput: KeyboardInput | null = null;

    forward: Vec3 = v3()

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

    private _splitAngle: number[] = []

    private _chaseRate: number = 5.0;

    private _penetration: number = 0.0;

    projectilePool: Pool<Node> | null = null;

    start() {
        this.node.on("onFrameAttackLoose", this.onFrameAttackLoose, this);
        super.start();
        this.node.on("onKilled", this.onKilled, this);

        this.bulletCount = 1;

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

    update(dt: number) {

        if (this.currState == StateDefine.Die || this.currState == StateDefine.Hit) {
            return;
        }

        this.fire = this.keyboardInput!.fire;
        const len = this.handleInput();
        if (len > 0) {
            this.changeState(StateDefine.Run);
            this.node.forward = this.forward;
        } else if (this.currState != StateDefine.Attack) {
            this.changeState(StateDefine.Idle);
        }

        super.update(dt);
    }

    handleInput(): number {
        this.forward.x = this.keyboardInput!.horizontal;
        this.forward.z = this.keyboardInput!.vertical;
        this.forward.normalize();
        return this.forward.length();
    }

    onFrameAttackLoose() {
        //log("onFrameAttackLoose")
        const arrowStartPos = this.bowstring!.worldPosition;
        Vec3.subtract(this.shootDirection, this.bow!.worldPosition, arrowStartPos);
        this.shootDirection.normalize();

        let tmp = v3()

        for (let i = 0; i < this.bulletCount; i++) {

            //const arrow = instantiate(this.arrow!) as Node;
            const arrow = this.projectilePool?.alloc()!;
            arrow.active = true
            arrow.forward = this.node.forward.clone();

            MathUtil.rotateAround(tmp, arrow.forward, Vec3.UP, this._splitAngle[i]);
            arrow.forward = tmp;

            arrow.worldPosition = arrowStartPos;
            if (!arrow.parent)
                director.getScene()!.addChild(arrow);

            let projectile = arrow.getComponent(Projectile);
            if (projectile == null) {
                throw new Error("missing component: Projectile");
            }
            projectile.host = this.node;
            projectile.projectProperty = new ProjectileProperty();
            projectile.projectProperty.penetration = this._penetration;
            projectile.pool = this.projectilePool;
            const willChase = randomRange(0, 100) < this._chaseRate;
            if (willChase) {
                projectile.target = this.getEnemy();
                projectile.projectProperty.chase = willChase && projectile.target != null;
            }
            projectile?.fire(this.node.forward);

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
        this.node.emit("onExpGain");

        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.maxExp *= 1.1
            this.level++;
            this.skillPoint++;
            this.onUpgradeLevel();
        }
    }

    onUpgradeLevel() {
        this.node.emit("onPlayerUpgrade");
    }

    onDie() {
        super.onDie();
    }

    set penetraion(val: number) {
        this._penetration = math.clamp(this._penetration + val, 0, 100);
    }

    getEnemy(): Node | null {
        let enemies = Map.inst?.enemies;
        if (!enemies || enemies?.length == 0) {
            return null;
        }

        let rand = randomRangeInt(0, enemies.length);        
        return enemies[rand];
    }
}


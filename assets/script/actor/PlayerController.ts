import { Component, math, Node, randomRange, randomRangeInt, v3, Vec3, _decorator } from 'cc';
import { Events } from '../events/Events';
import { VirtualInput } from '../input/VirtualInput';
import { MathUtil } from '../util/MathUtil';
import { Actor } from './Actor';
import { StateDefine } from './StateDefine';
import { ProjectileEmitter } from './ProjectileEmiiter';
import { Level } from '../level/Level';
const { ccclass, property, requireComponent } = _decorator;

let tempForward = v3();

/**
 * 玩家控制器
 */
@ccclass('PlayerController')
@requireComponent(Actor)
@requireComponent(ProjectileEmitter)
export class PlayerController extends Component {

    private static _instance: PlayerController;
    static get instance() {
        return this._instance;
    }

    @property(Node)
    bow: Node | null = null;

    @property(Node)
    bowstring: Node | null = null;

    projectileEmitter: ProjectileEmitter;

    shootDirection: Vec3 = v3();

    exp: number = 0;

    maxExp: number = 20;

    level: number = 1;

    skillPoint: number = 0;

    private _projectileCount: number = 0;

    private _splitAngle: number[] = [];

    private _chaseRate: number = 5.0;

    private _penetration: number = 0.0;

    actor: Actor | null = null;

    onLoad() {
        PlayerController._instance = this;
    }

    start() {
        this.actor = this.node.getComponent(Actor);
        this.projectileEmitter = this.node.getComponent(ProjectileEmitter);
        this.node.on("onFrameAttackLoose", this.onFrameAttackLoose, this);
        this.node.on(Events.onEnemyKilled, this.onKilled, this);

        this.projectileCount = 3;
    }

    onDestroy() {
        PlayerController._instance = null;

        this.node.off("onFrameAttackLoose", this.onFrameAttackLoose, this);
        this.node.off(Events.onEnemyKilled, this.onKilled, this);
    }

    update(dt: number) {
        if (this.actor.currState == StateDefine.Die || this.actor.currState == StateDefine.Hit) {
            return;
        }

        const len = this.handleInput();
        if (len > 0.1) {
            this.actor.changeState(StateDefine.Run);
        } else {
            // // 查找面前是否有怪物
            // let enemy = this.getNeareastEnemy()
            // if (enemy) {
            //     Vec3.subtract(this.actor.destForward, enemy.worldPosition, this.node.worldPosition);
            //     this.actor.destForward.normalize()

            //     // 如果有射击
            //     this.actor?.changeState(StateDefine.Attack)
            // } else {
            //     this.actor.changeState(StateDefine.Idle);
            // }
        }
    }

    handleInput(): number {
        let x = VirtualInput.horizontal;
        let y = VirtualInput.vertical;

        this.actor.destForward.x = x;
        this.actor.destForward.z = -y;
        this.actor.destForward.y = 0;
        this.actor.destForward.normalize();
        return this.actor.destForward.length();
    }

    onFrameAttackLoose() {
        const arrowStartPos = this.bowstring!.worldPosition;
        Vec3.subtract(this.shootDirection, this.bow!.worldPosition, arrowStartPos);
        this.shootDirection.normalize();

        for (let i = 0; i < this.projectileCount; i++) {
            let projectile = this.projectileEmitter.create();

            MathUtil.rotateAround(tempForward, this.node.forward, Vec3.UP, this._splitAngle[i]);
            projectile.node.forward = tempForward.clone();

            projectile.node.worldPosition = arrowStartPos;
            projectile.host = this.node;

            let property = projectile.projectProperty;
            property.penetration = this._penetration;
            const willChase = randomRange(0, 100) < this._chaseRate;
            if (willChase) {
                projectile.target = this.getRandomEnemy();
                property.chase = willChase && projectile.target != null;
            }
            projectile?.fire();
        }
    }

    set projectileCount(count: number) {
        if (count <= 0) {
            this._projectileCount = 1;
        }
        this._projectileCount = count;
        this._splitAngle = [];

        const a = math.toRadian(10);
        const even = count % 2 != 0;

        const len = Math.floor(this._projectileCount / 2);
        for (let i = 0; i < len; i++) {
            this._splitAngle.push(-a * (i + 1));
            this._splitAngle.push(a * (i + 1));
        }

        if (even) {
            this._splitAngle.push(0);
        }
    }

    get projectileCount(): number { return this._projectileCount; }

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

    getNeareastEnemy(): Node | null {
        let enemies = Level.intance?.enemies;
        if (!enemies || enemies?.length == 0) {
            return null;
        }

        let nearDistance = 99999;
        let nearastEnemy: Node | null = null;
        for (let enemy of enemies) {
            const distance = Vec3.distance(this.node.worldPosition, enemy.worldPosition);
            if (distance < nearDistance) {
                nearDistance = distance;
                nearastEnemy = enemy;
            }
        }

        if (nearastEnemy)
            return nearastEnemy;
    }

    getRandomEnemy(): Node | null {
        let enemies = Level.intance?.enemies;
        if (!enemies || enemies?.length == 0) {
            return null;
        }

        let rand = randomRangeInt(0, enemies.length);
        return enemies[rand];
    }
}


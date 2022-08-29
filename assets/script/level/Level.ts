import { _decorator, Component, instantiate, BoxCollider, Rect, v2, Prefab, Vec3, macro, v3, math, director, Size, Node, RigidBody, randomRange, resources } from 'cc';
import { Actor } from '../actor/Actor';
import { EnemyController } from '../actor/EnemyController';
import { Events } from '../events/Events';
import { UIManager } from '../ui/UIManager';
const { ccclass, property } = _decorator;

/**
 * 关卡脚本
 */
@ccclass('Level')
export class Level extends Component {

    private static _instance;
    static get intance() {
        return this._instance;
    }

    /**
     * 出声点
     */
    @property(BoxCollider)
    spawnCollider: BoxCollider | null = null;

    /**
     * 敌人的预制体
     */
    @property([Prefab])
    enemyPrefabs: Prefab[] = []

    /**
     * 随机索引
     */
    enemyIndex: number = 0;

    /** 
     * 出生范围 
    */
    private spawnRect: Rect = new Rect()

    /**
     * 本次出生的出生点
     */
    spawnPos: Vec3 = v3()

    /**
     * 场景内的敌人
     */
    enemies: Array<Node> = [];

    /**
     * 出生时的血量
     */
    private spawnHp: number = 10;

    /**
     * 最大可存活的敌人数量
     */
    private maxAlive: number = 100;

    start() {
        Level._instance = this;

        const wp = this.spawnCollider!.node.worldPosition;
        const size = this.spawnCollider?.size;
        this.spawnRect.size = new Size(size!.x, size!.z);
        this.spawnRect.center = v2(wp.x, wp.z);

        resources.loadDir("ui", () => {
            resources.loadDir("effect", () => {
                resources.loadDir("audio", () => {
                    resources.loadDir("actor", () => {
                        UIManager.instance.openPanel("UIGame", false)
                        this.startSpawnTimer()
                    })
                })
            })
        })
    }

    startSpawnTimer() {
        this.schedule(() => {
            this.randomSpawn()
        }, 1.0, 15, 3)

        this.schedule(() => {
            this.randomSpawn()
        }, 5.0, macro.REPEAT_FOREVER, 10)

        this.schedule(() => {
            this.spawnHp *= 1.2;
        }, 20, macro.REPEAT_FOREVER);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();

        Level._instance = null;
    }

    randomSpawn() {
        if (this.enemies.length >= this.maxAlive) {
            return;
        }
        this.enemyIndex = math.randomRangeInt(0, this.enemyPrefabs.length);
        this.spawnPos.x = math.randomRange(this.spawnRect.xMin, this.spawnRect.xMax);
        this.spawnPos.z = math.randomRange(this.spawnRect.yMin, this.spawnRect.yMax);
        this.doSpawn(this.spawnPos)
    }

    doSpawn(spawnPoint: Vec3) {
        const prefab = this.enemyPrefabs[this.enemyIndex];
        const enemy = instantiate(prefab);
        this.enemies.push(enemy);
        
        enemy.on(Events.onDead, this.onEnemyDead, this);
        enemy.setPosition(spawnPoint);

        director.getScene()?.addChild(enemy);

        let rand = randomRange(0.3, 2.0);

        let actor = enemy.getComponent(Actor);
        actor!.hp = this.spawnHp;

        let rigid = enemy.getComponent(RigidBody)!;
        rigid.mass = rand;

        enemy.scale = v3(rigid.mass, rigid.mass, rigid.mass);
    }

    onEnemyDead(actor: EnemyController) {
        let i = this.enemies.indexOf(actor.node);
        if (i < 0) {
            throw new Error('actor not found')
        }
        this.enemies.splice(i, 1);
    }
}


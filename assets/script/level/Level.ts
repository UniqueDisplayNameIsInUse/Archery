import { _decorator, Component, BoxCollider, Rect, v2, Vec3, macro, v3, math, director, Size, RigidBody, randomRange, resources } from 'cc';
import { Actor } from '../actor/Actor';
import { DynamicResourceDefine } from '../resource/ResourceDefine';
import { UIManager } from '../ui/UIManager';
import { ActorManager } from './ActorManager';
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
     * 出生范围 
    */
    private spawnRect: Rect = new Rect()

    /**
     * 本次出生的出生点
     */
    spawnPos: Vec3 = v3()

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

        this.loadDirectory(0);
    }

    loadDirectory(dirIndex: number) {
        if (dirIndex >= DynamicResourceDefine.directory.length) {
            this.onLevelLoaded();
            return;
        }

        resources.loadDir(DynamicResourceDefine.directory[dirIndex], () => {
            dirIndex++;
            this.loadDirectory(dirIndex);
        })
    }

    onLevelLoaded() {
        ActorManager.instance.init();
        UIManager.instance.openPanel("UIGame", false)
        this.startSpawnTimer()
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
        UIManager.instance.clearAllPanels();
        ActorManager.instance.clear();
    }

    randomSpawn() {
        if (ActorManager.instance.enemies.length >= this.maxAlive) {
            return;
        }

        this.spawnPos.x = math.randomRange(this.spawnRect.xMin, this.spawnRect.xMax);
        this.spawnPos.z = math.randomRange(this.spawnRect.yMin, this.spawnRect.yMax);
        this.doSpawn(this.spawnPos)
    }

    doSpawn(spawnPoint: Vec3) {
        const enemy = ActorManager.instance.createRandomEnemy();
        enemy.setPosition(spawnPoint);
        director.getScene()?.addChild(enemy);

        let rand = randomRange(0.3, 2.0);
        let actor = enemy.getComponent(Actor);
        actor.actorProperty.hp = this.spawnHp;
        actor.actorProperty.maxHp = this.spawnHp;
        actor.respawn();
        let rigid = enemy.getComponent(RigidBody)!;
        rigid.mass = rand;
        enemy.scale = v3(rigid.mass, rigid.mass, rigid.mass);
    }
}

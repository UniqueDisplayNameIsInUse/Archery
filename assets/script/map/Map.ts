import { _decorator, Component, instantiate, BoxCollider, Rect, v2, Prefab, CCInteger, Vec3, Scene, macro, v3, math, log, director, size, Size, Node, Pool, RigidBody, randomRange } from 'cc';
import { Actor } from '../actor/Actor';
import { EnemyController } from '../actor/EnemyController';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class Map extends Component {

    private static _inst: Map | null = null

    static get inst(): Map | null {
        return this._inst;
    }

    @property(BoxCollider)
    spawnCollider: BoxCollider | null = null;

    @property([Prefab])
    enemyPrefabs: Prefab[] = []

    enemyIndex: number = 0;

    spawnRect: Rect = new Rect()

    spawnPos: Vec3 = v3()

    enemies: Array<Node> = [];

    hp: number = 10;

    maxAlive: number = 100;    

    start() {
        Map._inst = this;

        const wp = this.spawnCollider!.node.worldPosition;
        const size = this.spawnCollider?.size;
        this.spawnRect.size = new Size(size!.x, size!.z);
        this.spawnRect.center = v2(wp.x, wp.z);

        this.schedule(() => {
            this.randomSpawn()
        }, 0.1, 20)

        this.schedule(() => {
            this.randomSpawn()
        }, 1.0, macro.REPEAT_FOREVER)

        this.schedule(() => {
            this.hp *= 1.2
        }, 10, macro.REPEAT_FOREVER)
    }

    randomSpawn() {
        // if (this.enemies.length >= 100) {
        //     return;
        // }

        this.spawnPos.x = math.randomRange(this.spawnRect.xMin, this.spawnRect.xMax);
        this.spawnPos.z = math.randomRange(this.spawnRect.yMin, this.spawnRect.yMax);
        this.doSpawn(this.spawnPos)
    }

    nameCounter: number = 0;

    doSpawn(spawnPoint: Vec3) {
        const prefab = this.enemyPrefabs[this.enemyIndex];
        const enemy = instantiate(prefab);
        this.enemies.push(enemy);

        enemy.name = "Enemy" + this.nameCounter++;
        enemy.on("onDead", this.onEnemyDead, this);
        enemy.setPosition(spawnPoint);

        director.getScene()?.addChild(enemy);

        let enemyController = enemy.getComponent(EnemyController);
        enemyController!.hp = this.hp;  
        
        let rigid = enemy.getComponent(RigidBody)!;
        rigid.mass = randomRange(0.3, 2.0);

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


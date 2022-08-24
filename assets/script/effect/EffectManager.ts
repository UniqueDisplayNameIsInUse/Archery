import { _decorator, Component, Node, resources, Prefab, Vec3, Pool, instantiate, director, ParticleSystem, Scene, TERRAIN_NORTH_INDEX } from 'cc';
import { GameMain } from '../GameMain';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {

    @property(Prefab)
    explorePrefab: Prefab | null = null;

    explorePool: Pool<Node> | null = null;

    @property(Prefab)
    diePrefab: Prefab | null = null;

    diePool: Pool<Node> | null = null;

    start() {
        GameMain.EffectManager = this;

        this.explorePool = new Pool((): Node => {
            return instantiate(this.explorePrefab!)
        }, 50, (n: Node) => {
            n.removeFromParent()
            n.destroy()
        })

        this.diePool = new Pool((): Node => {
            return instantiate(this.diePrefab!)
        }, 50, (n: Node) => {
            n.removeFromParent()
            n.destroy()
        })
    }

    onDestroy(){
        GameMain.EffectManager = null;
    }

    playExplore(worldPosition: Vec3) {
        this.play(this.explorePool!, worldPosition);
    }

    playDieEffect(worldPosition: Vec3) {
        this.play(this.diePool!, worldPosition);
    }

    play(pool: Pool<Node>, worldPosition: Vec3) {
        let node = pool.alloc()
        
        director.getScene()?.addChild(node);
        node.worldPosition = worldPosition;
        node.active = true;

        let ps = node.getComponent(ParticleSystem);        
        this.scheduleOnce(() => {
            node.removeFromParent()
            node.parent = null;
            pool.free(node);
        }, ps?.duration);
    }
}


import { _decorator, Node, Prefab, Vec3, Pool, instantiate, director, ParticleSystem, resources } from 'cc';
import { DynamicResourceDefine } from '../resource/ResourceDefine';
import { Pools } from '../util/Pools';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager {

    static _instance: EffectManager;
    static get instance() {
        return this._instance;
    }

    pools: Pools<string, Node> = new Pools();

    start() {
        EffectManager._instance = this;

        const hitEffect = resources.get(DynamicResourceDefine.effect.EffExplore, Prefab);
        this.pools.newPool(DynamicResourceDefine.effect.EffExplore, (): Node => {
            return instantiate(hitEffect);
        }, 50, (node: Node) => {
            node.removeFromParent()
            node.destroy()
        })

        const exploreEffect = resources.get(DynamicResourceDefine.effect.EffDie, Prefab);
        this.pools.newPool(DynamicResourceDefine.effect.EffDie, (): Node => {
            return instantiate(exploreEffect);
        }, 50, (node: Node) => {
            node.removeFromParent()
            node.destroy()
        })
    }

    onDestroy() {
        EffectManager._instance = null;

        this.pools.destroyAll();
    }

    play(key: string, worldPosition: Vec3) {
        const pool = this.pools.pool(key);
        this.playEffect(pool, worldPosition);
    }

    private playEffect(pool: Pool<Node>, worldPosition: Vec3) {
        let node = pool.alloc()

        director.getScene()?.addChild(node);
        node.worldPosition = worldPosition;
        node.active = true;

        let ps = node.getComponent(ParticleSystem);
    }
}


import { _decorator, Node, Prefab, Pool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Pools')
export class Pools<T> {
    pools: Map<T, Pool<Node>> = new Map();

    pool(prefab: T): Pool<Node> {
        return this.pools.get(prefab)!;
    }

    newPool(prefab: T, ctor: () => Node, elementsPerBatch: number, dtor?: (obj: Node) => void) {
        let pool = new Pool<Node>(ctor, elementsPerBatch, dtor);
        this.pools.set(prefab, pool);
    }

    allocc(prefab: T): Node {
        return this.pool(prefab).alloc();
    }

    free(prefab: T, node: Node) {
        this.pool(prefab).free(node);
    }

    destory(prefab: T) {
        this.pool(prefab).destroy()
    }
}

export let prefabPools = new Pools<Prefab>();

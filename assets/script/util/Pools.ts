import { _decorator, Node, Pool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Pools')
export class Pools<T> {
    pools: Map<T, Pool<Node>> = new Map();

    pool(key: T): Pool<Node> {
        return this.pools.get(key)!;
    }

    newPool(key: T, ctor: () => Node, elementsPerBatch: number, dtor?: (obj: Node) => void) {
        let pool = new Pool<Node>(ctor, elementsPerBatch, dtor);
        this.pools.set(key, pool);
    }

    allocc(key: T): Node {
        return this.pool(key).alloc();
    }

    free(key: T, node: Node) {
        this.pool(key).free(node);
    }

    destory(key: T) {
        this.pool(key).destroy()
    }

    destroyAll() {
        for (let pool of this.pools.values()) {
            pool.destroy();
        }
        this.pools.clear()
    }
}

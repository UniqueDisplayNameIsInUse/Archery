import { _decorator, Component, Node, Layout, SpriteAtlas, Prefab, Pool, instantiate, Sprite, resources, SpriteFrame } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIIMageLabel')
@requireComponent(Layout)
export class UIIMageLabel extends Component {

    private _string: string = '';

    set string(value: string) {
        if (this._string == value) {
            return;
        }
        this._string = value;
        this.resetString();
    }

    @property(SpriteAtlas)
    atlas: SpriteAtlas;

    @property(Prefab)
    numPrefab: Prefab | null = null;

    numPool: Pool<Node> | null = null;

    layout: Layout;

    start() {
        this.layout = this.node.getComponent(Layout);

        this.numPool = new Pool((): Node => {
            let node = instantiate(this.numPrefab!);
            node.active = false;
            return node;
        }, 1, (node: Node) => {
            node.removeFromParent();
        })
    }

    onDestroy() {
        this.numPool.destroy();
    }

    resetString() {
        for (let char of this._string) {            
            let spriteFrame = this.atlas.getSpriteFrame(char.toString());

            let node = this.numPool.alloc();
            node.active = true;
            let sprite = node.getComponent(Sprite);
            sprite.spriteFrame = spriteFrame;
        }
        this.layout.updateLayout();
    }
}


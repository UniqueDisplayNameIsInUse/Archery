import { _decorator, Component, Node, Layout, Prefab, Pool, resources, SpriteFrame, instantiate, Sprite } from 'cc';
import { PlayerController } from '../actor/PlayerController';
import { Events } from '../events/Events';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIPlayerLevel')
@requireComponent(Layout)
export class UIPlayerLevel extends Component {

    private spriteFrameList: Array<SpriteFrame> = new Array();

    private numberPool: Pool<Node> | null = null;

    @property(Prefab)
    numberPrefab: Prefab | null = null;

    private _value: number = 0;

    set value(value: number) {
        if (value == this._value) {
            return;
        }
        this._value = value;
        this.resetNumber();
    }

    layout: Layout | null = null;

    start() {
        this.layout = this.node.getComponent(Layout);
        this.loadSpriteFrame(0);

        this.numberPool = new Pool(() => {
            return instantiate(this.numberPrefab!);
        }, 10, (node: Node) => {
            node.removeFromParent();
            node = null;
        })

        PlayerController.instance.node.on(Events.onPlayerUpgrade, this.onPlayerUpgrade, this);
        this.resetNumber();
    }

    onDestroy(){
        this.numberPool.destroy();
        this.numberPool = null;        
    }

    onPlayerUpgrade() {
        this.value = PlayerController.instance.level;
    }

    loadSpriteFrame(num: number) {
        if (num > 9) {
            this.resetNumber();
            return;
        }

        resources.load("ui/art/num/" + num + "/spriteFrame", SpriteFrame, (error: Error, texture: SpriteFrame) => {
            if (error) {
                throw error;
            }
            this.spriteFrameList.push(texture);
            num++;
            this.loadSpriteFrame(num);
        })
    }

    resetNumber() {
        this.clearNumber();

        let str = this._value.toString();
        for (let i = 0; i < str.length; i ++ ) {
            const char = str[i];
            let node = this.numberPool.alloc();
            if (node.parent == null) {
                node.setParent(this.node);
            }

            node.setSiblingIndex(i)            

            node.active = true;
            let sprite = node.getComponent(Sprite);
            sprite.spriteFrame = this.spriteFrameList[Number.parseInt(char.toString())];
        }
        this.layout.updateLayout();
    }

    clearNumber() {
        for (let node of this.node.children) {
            node.active = false;
            this.numberPool.free(node);
        }
    }
}


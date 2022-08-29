import { _decorator, Component, Node, Layout, Prefab, Pool, resources, SpriteFrame, instantiate, Sprite } from 'cc';
import { PlayerController } from '../actor/PlayerController';
import { Events } from '../events/Events';
import { ActorManager } from '../level/ActorManager';
import { UIIMageLabel } from './UIIMageLabel';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIPlayerLevel')
@requireComponent(UIIMageLabel)
export class UIPlayerLevel extends Component {
    
    level: UIIMageLabel;

    start() {
        this.level = this.node.getComponent(UIIMageLabel);

        ActorManager.instance.playerActor.node.on(Events.onPlayerUpgrade, this.onPlayerUpgrade, this);
        this.level.string = ActorManager.instance.playerController.level.toString();
    }

    onPlayerUpgrade() {
        this.level.string = ActorManager.instance.playerActor.getComponent(PlayerController).level.toString();
    }
}


import { _decorator, Component, director } from 'cc';
import { ActorManager } from '../level/ActorManager';
const { ccclass, property } = _decorator;

/**
 * 角色升级面板
 */
@ccclass('UISkillUpgrade')
export class UISkillUpgrade extends Component {

    onEnable(){
        director.pause()
    }

    onDisable(){
        director.resume()
    }

    onUpgradePenetration(){
        ActorManager.instance.playerController!.penetraion += 10;        
        this.node.active = false;
    }

    onUpgradeProjectileCount(){
        ActorManager.instance.playerController!.projectileCount++;
        this.node.active = false;
    }

    onUpgradeChaseRate(){
        ActorManager.instance.playerController!.chaseRate += 10;        
        this.node.active = false;
    }
}


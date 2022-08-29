import { _decorator, Component, director } from 'cc';
import { PlayerController } from '../actor/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('UISkillUpgrade')
export class UISkillUpgrade extends Component {

    onEnable(){
        director.pause()
    }

    onDisable(){
        director.resume()
    }

    onUpgradePenetration(){
        PlayerController.instance!.penetraion += 10;        
        this.node.active = false;
    }

    onUpgradeProjectileCount(){
        PlayerController.instance!.projectileCount++;
        this.node.active = false;
    }

    onUpgradeChaseRate(){
        PlayerController.instance!.chaseRate += 10;        
        this.node.active = false;
    }
}


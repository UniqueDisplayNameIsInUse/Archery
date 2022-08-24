import { _decorator, Component, director } from 'cc';
import { GameMain } from '../GameMain';
import { UIUtil } from './UIUtil';
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
        GameMain.PlayerController!.penetraion += 10;        
        this.node.active = false;
    }

    onUpgradeProjectileCount(){
        GameMain.PlayerController!.bulletCount++;
        this.node.active = false;
    }

    onUpgradeChaseRate(){
        GameMain.PlayerController!.chaseRate += 10;        
        this.node.active = false;
    }

    onClose(){        
        UIUtil.closePanel(this.node.name, false);
    }
    
}


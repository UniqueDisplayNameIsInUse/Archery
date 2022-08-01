import { _decorator, Component, ProgressBar, Label, Button, director, resources } from 'cc';
import { PlayerController } from '../actor/PlayerController';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass("UISkill")
class UISkill {

    @property(Button)
    btnPentration: Button | null = null;

    @property(Button)
    btnAddBulletCount: Button | null = null;

    @property(Button)
    btnAddChaseRate: Button | null = null;

    show(show:boolean){
        this.btnPentration!.node.active = show;
        this.btnAddBulletCount!.node.active = show;
        this.btnAddChaseRate!.node.active = show;
    }
}

@ccclass('UIGame')
export class UIGame extends Component {

    @property(PlayerController)
    player: PlayerController | null = null;

    @property(ProgressBar)
    expBar: ProgressBar | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    expLabel: Label | null = null;

    @property(UISkill)
    uiSkills: UISkill = new UISkill()

    isPaused:boolean = false;

    labelPause: Label | null = null;

    start() {
        this.player?.node.on("onExpGain", this.onExpGain, this);
        this.player?.node.on("onPlayerUpgrade", this.onUpgrade, this);

        this.onExpGain();
        this.levelLabel!.string = "Level: " + this.player?.level;

        this.uiSkills.show(this.player!.skillPoint>0);

        this.labelPause = this.node.getChildByPath("Layout/BtnPause/Label")!.getComponent(Label);
    }   

    onDestroy(){
        this.uiSkills = null;
    }

    onExitGame() {        
        resources.releaseUnusedAssets()                
        director.loadScene("startup")
    }

    onPauseGame() {
        console.log("onPauseGame")
        if(!this.isPaused){
            director.pause()        
            this.isPaused = true;
            this.labelPause.string = "Resume";
        }else{
            this.isPaused = false;
            director.resume();
            this.labelPause.string = "Pause";            
        }        
    }

    onOpenSetting() {
        UIManager.inst.openPanel("UISetting")
    }

    onUpgrade() {
        this.levelLabel!.string = "Level: " + this.player?.level;
        this.uiSkills.show(true)        
    }

    onExpGain() {
        this.expBar!.progress = this.player!.exp / this.player!.maxExp;
        this.expLabel!.string = this.player!.exp.toFixed() + "/" + this.player!.maxExp.toFixed();
    }

    onAddPenetration() {
        this.player!.penetraion += 10;
        this.onSkillAdd();
    }

    onAddBulletCount() {
        this.player!.bulletCount++;
        this.onSkillAdd();
    }

    onAddChaseRate() {
        this.player!.chaseRate += 10;
        this.onSkillAdd();
    }

    onSkillAdd(){
        this.player!.skillPoint--;
        this.uiSkills.show(this.player!.skillPoint>0);
    }
}


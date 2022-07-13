import { _decorator, Component, Slider, math } from 'cc';
import { config } from '../config/Config';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('UISetting')
export class UISetting extends Component {

    @property(Slider)
    sliderBgmVolume: Slider | null = null;

    @property(Slider)
    sliderSfxVolume: Slider | null = null;

    start() {
        this.sliderBgmVolume.progress = config.bgmVolume;
        this.sliderSfxVolume.progress = config.sfxVolume;
    }

    onBgmVolumeChanged(value: Slider) {
        config.bgmVolume = math.clamp01(value.progress);
    }

    onSfxVolumeChanged(value: Slider) {
        config.sfxVolume = math.clamp01(value.progress);
    }

    onClose(){
        //this.node.active = false;
        UIManager.inst.closePanel(this.node.name, false);
    }
}


import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimationEventBubble')
export class AnimationEventBubble extends Component {

    start() {

    }

    update(deltaTime: number) {

    }

    onFrameAttackLoose() {
        this.node.parent?.emit("onFrameAttackLoose");
    }

    onFrameAttack(){
        this.node.parent?.emit("onFrameAttack");
    }
}


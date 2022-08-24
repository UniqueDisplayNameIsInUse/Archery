import { _decorator, Component, Node, CCFloat, EventTouch, Input, math, Sprite, v3, Vec3 } from 'cc';
import { VirtualInput } from '../input/VirtualInput';
const { ccclass, property } = _decorator;

@ccclass('UIJoyStick')
export class UIJoyStick extends Component {   
    
    @property(Sprite)
    thumbnail: Sprite | null = null;

    @property(Sprite)
    joyStick: Sprite | null = null;

    @property(CCFloat)
    radius: number = 130;

    start() {
        this.joyStick.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyStick.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyStick.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchMove(touchEvent: EventTouch) {
        let x = touchEvent.touch.getUILocationX();
        let y = touchEvent.touch.getUILocationY();
        let worldPosition = new Vec3(x, y, 0);
        let localPosition = v3();
        this.joyStick.node.inverseTransformPoint(localPosition, worldPosition);
        let thumbnailPosition = v3();
        let len = localPosition.length();
        localPosition.normalize();
        Vec3.scaleAndAdd(thumbnailPosition, v3(), localPosition, math.clamp(len, 0, this.radius));

        this.thumbnail.node.setPosition(thumbnailPosition);

        VirtualInput.horizontal = this.thumbnail.node.position.x / this.radius;
        VirtualInput.vertical = this.thumbnail.node.position.y / this.radius;
    }

    onTouchEnd(touchEvent: EventTouch) {
        this.thumbnail.node.setPosition(v3());
        VirtualInput.horizontal = 0;
        VirtualInput.vertical = 0;
    }
}


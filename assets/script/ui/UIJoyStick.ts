import { _decorator, Component, CCFloat, EventTouch, Input, math, Sprite, v3, Vec3 } from 'cc';
import { VirtualInput } from '../input/VirtualInput';
const { ccclass, property } = _decorator;

/**
 * 摇杆控制器
 */
@ccclass('UIJoyStick')
export class UIJoyStick extends Component {

    /**
     * 手指部分
     */
    @property(Sprite)
    thumbnail: Sprite | null = null;

    /**
     * 摇杆的背景
     */
    @property(Sprite)
    joyStickBg: Sprite | null = null;
    
        
    @property(CCFloat)
    radius: number = 130;

    initJoyStickBgPosition: Vec3 = v3()
    
    start() {
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.initJoyStickBgPosition = this.joyStickBg.node.worldPosition.clone();
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(eventTouch: EventTouch) {
        let x = eventTouch.touch.getUILocationX();
        let y = eventTouch.touch.getUILocationY();
        this.joyStickBg.node.setWorldPosition(x, y, 0);
    }

    onTouchMove(touchEvent: EventTouch) {
        let x = touchEvent.touch.getUILocationX();
        let y = touchEvent.touch.getUILocationY();
        let worldPosition = new Vec3(x, y, 0);
        let localPosition = v3();
        this.joyStickBg.node.inverseTransformPoint(localPosition, worldPosition);
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
        this.joyStickBg.node.worldPosition = this.initJoyStickBgPosition;
    }
}


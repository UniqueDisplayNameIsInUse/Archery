import { _decorator, Component, Sprite, CCFloat, EventTouch, Vec3, Camera, v3, Input, math } from 'cc';
import { IInput } from './IInput';
const { ccclass, property } = _decorator;

@ccclass('VirtualInput')
export class VirtualInput extends Component implements IInput{

    @property(Sprite)
    thumbnail: Sprite | null = null;

    @property(Sprite)
    joyStick: Sprite | null = null;

    @property(CCFloat)
    radius: number = 130;

    private _horizontal: number = 0;
    get horizontal(): number {
        return this._horizontal;
    }
    set horizontal(val: number) {
        this._horizontal = val;
    }

    private _vertical: number = 0;
    get vertical(): number {
        return this._vertical;
    }
    set vertical(val: number) {
        this._vertical = val;
    }

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

        this.horizontal = Math.cos(this.thumbnail.node.position.x / this.radius);
        this.vertical = Math.sin(this.thumbnail.node.position.y / this.radius);
    }

    onTouchEnd(touchEvent: EventTouch) {
        this.thumbnail.node.setPosition(v3());
    }
}


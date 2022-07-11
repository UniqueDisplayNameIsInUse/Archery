import { _decorator, Component, Node, Camera, Quat, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;

let tempPos : Vec3 = v3();

@ccclass('FollowCamera')
export class FollowCamera extends Component {

    @property(Node)
    target: Node | null = null;

    @property(Camera)
    camera:Camera | null = null;    

    initialDirection: Vec3 = v3();    

    start() {        
        Vec3.subtract(this.initialDirection, this.node.worldPosition, this.target!.worldPosition);        
    }

    update(deltaTime: number) {
        Vec3.add(tempPos, this.target!.worldPosition, this.initialDirection);
        this.node.setWorldPosition(tempPos);
    }
}


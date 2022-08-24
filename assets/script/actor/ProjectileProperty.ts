import { _decorator, Component, Node, Quat } from 'cc';
import { PhysicsGroup } from './PhysicsGroup';

export class ProjectileProperty {

    /**
     * 穿透
     */
    penetration: number = 1;   

    /**
     * 时长
     */
    liftTime: number = 3.0;

    /**
     * 追踪
     */
    chase: boolean = false;    
}


import { _decorator, Component, Node, Quat } from 'cc';
import { PhysicsGroup } from './PhysicsGroup';

export class ProjectileProperty {

    penetration: number = 1;

    destoryOnHit: boolean = false;

    generateChildCount: number = 0;

    rotateAround: boolean = true;

    duration: number = 3.0;

    chase: boolean = false;

    chageGroup: number | PhysicsGroup = PhysicsGroup.ENEMY;
}


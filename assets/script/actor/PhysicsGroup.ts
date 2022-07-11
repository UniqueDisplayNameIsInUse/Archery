import { PhysicsSystem, _decorator } from 'cc';

export class PhysicsGroup {

    static readonly DEFAULT = PhysicsSystem.PhysicsGroup.DEFAULT;

    static readonly PLAYER = 1 << 1;

    static readonly ENEMY = 1 << 2;

    static readonly PROJECTILE = 1 << 3;
    
}


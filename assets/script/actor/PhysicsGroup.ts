import { PhysicsSystem, _decorator } from 'cc';

export class PhysicsGroup {

    static readonly Default = PhysicsSystem.PhysicsGroup.DEFAULT;

    static readonly Player = 1 << 1;

    static readonly Enemy = 1 << 2;

    static readonly PlayerProjectile = 1 << 3;

    static readonly EnemyProjectile = 1 << 4;    
}


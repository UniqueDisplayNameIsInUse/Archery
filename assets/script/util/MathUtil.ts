import { _decorator, IVec3Like, Vec3, v3, math } from 'cc';

let tempVec: Vec3 = v3()
let tempVec2: Vec3 = v3()
let tempVec3: Vec3 = v3()

export class MathUtil {

    // Rodrigues’ Rotation Formula
    static rotateAround<T extends IVec3Like>(out: T, v: T, u: T, maxAngleDelta: number) {

        //out = v*cos + uxv*sin  + (u*v)*u*(1- cos);
        const cos = Math.cos(maxAngleDelta);
        const sin = Math.sin(maxAngleDelta);

        // v * cos 
        Vec3.multiplyScalar(tempVec, v, cos);

        // u x v 
        Vec3.cross(tempVec2, u, v);

        // v*cos + uxv*sin
        Vec3.scaleAndAdd(tempVec3, tempVec, tempVec2, sin);

        const dot = Vec3.dot(u, v);

        // + (u*v)*u*(1-cos)
        Vec3.scaleAndAdd(out, tempVec3, u, dot * (1.0 - cos));

    }

    static rotateToward(out: Vec3, src: Vec3, dest: Vec3, maxAngleDelta: number) {
        let up = v3()
        Vec3.cross(up, src, dest);
        this.rotateAround(out, src, up, maxAngleDelta);
    }    
}


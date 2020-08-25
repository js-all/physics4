import { vec2, mat3 } from 'gl-matrix'
import { v4 as uuidV4 } from 'uuid'
import rgb from './rgb'
import { rad, randomFloat } from './utils'

type vertexLoop = vec2[][];
type N2 = [number, number];

class RigidBody {
    verticies: vertexLoop;
    color: rgb;
    id: string;
    world: RigidBodyWorld;
    modelMatrix: mat3 = mat3.create();
    modelViewMatrix: mat3 = mat3.create();
    translation: vec2;
    rotation: number;
    scale: vec2;
    constructor(verticies: vertexLoop, world: RigidBodyWorld, translation: vec2 = [0, 0], rotation: number = 0, scale: vec2 = [1, 1], color = rgb.randomHue()) {
        this.verticies = verticies;
        this.color = color;
        this.world = world;
        this.id = uuidV4();
        this.world.addChild(this);
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
        this.updateMatricies(true);
    }
    updateMatricies(worldCall = false) {
        mat3.identity(this.modelMatrix);
        mat3.translate(this.modelMatrix, this.modelMatrix, this.translation);
        mat3.rotate(this.modelMatrix, this.modelMatrix, this.rotation);
        mat3.scale(this.modelMatrix, this.modelMatrix, this.scale);
        if (worldCall) {
            mat3.multiply(this.modelViewMatrix, this.world.viewMatrix, this.modelMatrix);
        }
    }
    get ctx() {
        return this.world.ctx;
    }

    getTransformedVerticies() {
        const res: vertexLoop = [];
        for (let i of this.verticies) {
            res.push([]);
            for (let j of i) {
                const vec: vec2 = [0, 0];
                vec2.transformMat3(vec, j, this.modelViewMatrix);
                res[res.length - 1].push(vec);
            }
        }
        return res;
    }

    draw() {
        const { ctx } = this;
        ctx.fillStyle = this.color.value;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 20;
        const tverts = this.getTransformedVerticies();
        for (let i of tverts) {
            ctx.beginPath();
            ctx.moveTo(...i[0] as N2);
            for (let j of i) {
                ctx.lineTo(...j as N2);
            }
            ctx.lineTo(...i[0] as N2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }

    }

    static createRandomShape(size: number, rings: number = 1, vertex: number = 8, RingRandomness = 2, ringSizeRng = 2, ringSizeRng2 = 0.1) {
        const shape: vertexLoop = [];
        for (let j = 0; j < rings; j++) {
            const localeSize = size * ((randomFloat(j - 0.5, j + 0.5) * ((RingRandomness - 1 / RingRandomness) / rings)) + 1 / RingRandomness);
            shape.push([]);
            let restAngle = Math.PI * 2;
            for (let i = vertex; i > 0; i--) {
                const angle = randomFloat((restAngle / i / ringSizeRng), (restAngle / i * ringSizeRng));
                const vec = vec2.fromValues(randomFloat(localeSize * (1 - ringSizeRng2), localeSize * (1 + ringSizeRng2)), 0);
                vec2.rotate(vec, vec, [0, 0], angle + (Math.PI * 2 - restAngle));
                shape[j].push(vec);
                restAngle -= angle;
            }
        }
        return shape;

    }
}

class RigidBodyWorld {
    camera: {
        translation: vec2;
        rotation: number;
    }
    viewMatrix: mat3 = mat3.create();
    ctx: CanvasRenderingContext2D;
    childrens: Map<string, RigidBody> = new Map();
    constructor(ctx: CanvasRenderingContext2D, camTranslation: vec2 = [0, 0], camRotation: number = 0) {
        this.ctx = ctx;
        this.camera = {
            translation: camTranslation,
            rotation: camRotation
        }
        this.updateMatricies();
    }
    updateMatricies() {
        mat3.identity(this.viewMatrix);
        mat3.translate(this.viewMatrix, this.viewMatrix, vec2.mul(vec2.create(), this.camera.translation, [-1, -1]));
        mat3.rotate(this.viewMatrix, this.viewMatrix, -this.camera.rotation);

    }
    addChild(rb: RigidBody) {
        this.childrens.set(rb.id, rb);
    }
    draw() {
        this.childrens.forEach(v => v.draw());
    }
}

export {
    RigidBody,
    RigidBodyWorld
}
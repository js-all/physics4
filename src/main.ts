import rh from './resize'
import { RigidBody, RigidBodyWorld } from './object'
import { vec2, mat3 } from 'gl-matrix'
import rgb from './rgb'
import { rad } from './utils'


const canvas = <HTMLCanvasElement>document.createElement('canvas');
const cw: number = 1920;
const ch: number = 1080;
canvas.height = ch;
canvas.width = cw;
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

document.body.appendChild(canvas);



const world = new RigidBodyWorld(ctx, [0, 0], 0);

const obj = new RigidBody(RigidBody.createRandomShape(5, 1, 8, 0.5, 2, .1), world, [cw / 2, ch / 2], 0, [20, 20]);


function draw() {
    ctx.clearRect(0, 0, cw, ch);
    world.draw();
    requestAnimationFrame(draw);
}

function play() {

}

rh(canvas);
requestAnimationFrame(draw);
setInterval(play, 1000 / 60);

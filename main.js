import { Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Scene, SphereGeometry, SpotLight, Vector3, WebGLRenderer } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { randFloat, randFloatSpread } from 'three/src/math/MathUtils';
import './style.css';


const scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);

const renderer = new WebGLRenderer({
    canvas: document.querySelector('canvas#bg')
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

renderer.render(scene, camera);


const material = new MeshStandardMaterial({ color: 0x00FF00 });

const bottle = await new Promise((resolve, reject) => new OBJLoader().load(
    'bottle.obj',
    resolve,
    xhr => { console.log(xhr.loaded / xhr.total * 100 + "% loaded") },
    reject
));
bottle.traverse(child => {
    if (child instanceof Mesh)
        child.material = material;
})
bottle.position.setY(-8);
bottle.scale.setScalar(8);
scene.add(bottle);


const light = new SpotLight(0xFFFFFF);;
light.angle = 40 / 180 * Math.PI;
light.penumbra = 1;
scene.add(light);

const starMinVal = 0.6, starMaxVal = 1, starDelta = 0.01;
const starFlickers = [];
const addStar = (radiusMin, radiusMax) => {
    const starGeometry = new SphereGeometry(0.25, 24, 24);
    const starMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
    const star = new Mesh(starGeometry, starMaterial);

    starFlickers.push({
        value: 1,
        direction: true,
        update: function (v) {
            if (v > starMaxVal)
                v = starMaxVal;
            if (v < starMinVal)
                v = starMinVal;
            this.value = v;
            starMaterial.color = new Color(v, v, v)
        },
    });

    const radius = randFloat(radiusMin, radiusMax);

    const position = new Vector3(randFloatSpread(1), randFloatSpread(1), randFloatSpread(1)).normalize().multiplyScalar(radius);

    star.position.set(position.x, position.y, position.z);

    scene.add(star);
}
new Array(1000).fill().map(e => addStar(50, 1000));

const cameraDistance = 30;
var cameraAngle = 0;

const animate = () => {
    requestAnimationFrame(animate);

    starFlickers.forEach(e => {
        if (randFloat(0, 1) > 0.7)
            e.direction = !e.direction;
        if (e.direction) {
            e.update(e.value + starDelta);
        } else {
            e.update(e.value - starDelta);
        }
    });

    camera.position.set(Math.sin(cameraAngle) * cameraDistance, 0, Math.cos(cameraAngle) * cameraDistance);
    camera.lookAt(0, 0, 0);

    light.position.set(camera.position.x, camera.position.y, camera.position.z - 2);

    cameraAngle += 0.001;

    renderer.render(scene, camera);
}

animate();
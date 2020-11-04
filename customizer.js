const colors = [
    {
        color: '66533C'
    },
    {
        color: '173A2F'
    },
    {
        color: '153944'
    },
    {
        color: '27548D'
    },
    {
        color: '438AAC'
    }  
];

let shoeOptions = {
    'shoes_0': '', 'shoes_1': '', 'shoes_2': '', 'shoes_3': ''
}

const TRAY = document.getElementById('js-tray-slide');

let activeOption = '';
const cameraFar = 20;
const BACKGROUND_COLOR = 0xf1f1f1;
let theModel;
// const MODEL_PATH = "http://localhost:8080/models/anim-shoe-2.glb";
const MODEL_PATH = "./models/anim-shoe-2.glb";

// init the scene
const scene = new THREE.Scene();

// initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial({color: 0xf1f1f1, shininess: 10});
const TEST_MTL = new THREE.MeshPhongMaterial({color: 0x3bd492, shininess: 50, })

// const INITIAL_MAP = [
//     {childID: 'back', mtl: INITIAL_MTL},
//     {childID: "base", mtl: INITIAL_MTL},
//     {childID: "cushions", mtl: INITIAL_MTL},
//     {childID: "legs", mtl: INITIAL_MTL},
//     {childID: "supports", mtl: INITIAL_MTL}
// ];
const INITIAL_MAP = [
    {childID: 'shoes', mtl: INITIAL_MTL},
    {childID: "shoes_0", mtl: INITIAL_MTL},
    {childID: "shoes_1", mtl: INITIAL_MTL},
    {childID: "shoes_2", mtl: INITIAL_MTL},
    {childID: "shoes_3", mtl: INITIAL_MTL}
];

// set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 50;

// init the object loader
const loader = new THREE.GLTFLoader();

THREE.DRACOLoader.setDecoderPath( './utils/' );
loader.setDRACOLoader( new THREE.DRACOLoader() );


// loader.load(MODEL_PATH, (object) => {
//     scene.add(object);
// }, (xhr) => {
//     console.log((xhr.loaded/xhr.total*100) + '% loaded');
// }, (error) => console.log(error));
loader.load(MODEL_PATH, (gltf) => {
    theModel = gltf.scene;
    theModel.traverse((o) => {
        console.log(o.name)
        if (o.isMesh) {
            // o.castShadow = true;
            // o.receiveShadow = true;
        }
    })
    //set the models initial scale
    theModel.scale.set(0.55,0.55,0.5);
    theModel.rotation.y = Math.PI;
    //offset the y position a bit
    theModel.position.y = 0;
    for (let object of INITIAL_MAP) {
        initColor(theModel, object.childID, object.mtl);
    }
    //add the model to the scene
    scene.add(theModel);
}, undefined, (error) => {
    console.error(error);
})

const initColor = (parent, type, mtl) => {
    parent.traverse((o) => {
        if (o.isMesh) {
        }
        if (o.name.includes(type)) {
            o.material = mtl;
            o.nameID = type;
        }
    });
};

// add lights
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// add hemisphere light to scene
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8,12,8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// add directional light to scene
scene.add(dirLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    shininess: 0
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5*Math.PI;
floor.receiveShadow = true;
floor.position.y = -1;
scene.add(floor);


resizeRendererToDisplaySize = renderer => {
    const canvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const canvasPixelWidth = canvas.width/window.devicePixelRatio;
    const canvasPixelHeight = canvas.height/window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

// add controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI/2;
controls.minPolarAngle = Math.PI/3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.9;
controls.minDistance = 25;

const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth/canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

animate();

const buildColors = colors => {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        swatch.style.background = `#${color.color}`;

        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}

buildColors(colors);

// select option

const selectOption = e => {
    let option = e.target;
    activeOption = e.target.dataset.option;
    console.log(activeOption)
    for (const otherOption of options) {
        otherOption.classList.remove('--is-active');
    }
    option.classList.add('--is-active');
}

const options = document.querySelectorAll('.option');
options.forEach(option => {
    option.addEventListener('click', selectOption);
})

const selectSwatch = e => {
    let color = colors[parseInt(e.target.dataset.key)];
    shoeOptions[activeOption] = color['color'];
    let new_mtl;
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt(`0x${color.color}`),
        shininess: color.shininess ? color.shininess : 10
    });

    setMaterial(theModel, activeOption, new_mtl);
}

const swatches = document.querySelectorAll('.tray__swatch');
swatches.forEach(swatch => {
    swatch.addEventListener('click', selectSwatch);
});

const setMaterial = (parent, type, mtl) => {
    parent.traverse(o => {
        if (o.isMesh && o.nameID != null) {
            if (o.nameID == type) {
                o.material = mtl;
            }
        }
    });
}
// button event listener
checkout = () => {
    fetch('http://ec2-18-132-9-128.eu-west-2.compute.amazonaws.com:8000/test', { body: JSON.stringify(shoeOptions), method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }})
    .then(res => {
        res.json().then(data =>  {
            console.log(shoeOptions);
            window.open(data['response'], '_blank');
        });
    })
    .catch(err => console.log(err))
}
// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas3d').appendChild(renderer.domElement);

// Add grid helper
const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
scene.add(gridHelper);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Drawing variables
let isDrawing = false;
let currentColor = 0x00ff00;
let brushSize = 0.1;
let points = [];
let lines = [];
let currentLine = null;

// UI Elements
const colorPicker = document.getElementById('colorPicker');
const brushSizeInput = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const imageSizeInput = document.getElementById('imageSize');
const imageSizeDisplay = document.getElementById('imageSizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const centerImage = document.getElementById('centerImage');

// Update controls
colorPicker.addEventListener('input', (e) => {
    currentColor = parseInt(e.target.value.replace('#', '0x'));
});

brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseFloat(e.target.value);
    sizeDisplay.textContent = brushSize;
});

imageSizeInput.addEventListener('input', (e) => {
    const size = e.target.value;
    imageSizeDisplay.textContent = size;
    centerImage.style.maxWidth = size + '%';
    centerImage.style.maxHeight = (size * 1.3) + '%';
});

clearBtn.addEventListener('click', () => {
    lines.forEach(line => scene.remove(line));
    lines = [];
});

undoBtn.addEventListener('click', () => {
    if (lines.length > 0) {
        const lastLine = lines.pop();
        scene.remove(lastLine);
    }
});

// Raycaster for 3D drawing
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const drawPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// Camera rotation
let isRotating = false;
let previousMousePosition = { x: 0, y: 0 };

// Mouse events
renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click - draw
        isDrawing = true;
        points = [];
    } else if (e.button === 2) { // Right click - rotate
        isRotating = true;
    }
});

renderer.domElement.addEventListener('mousemove', (e) => {
    // Get mouse position
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDrawing) {
        // Draw in 3D space
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(drawPlane, intersectPoint);

        if (intersectPoint) {
            points.push(intersectPoint.clone());

            if (points.length > 1) {
                // Create tube geometry for smooth 3D lines
                const curve = new THREE.CatmullRomCurve3(points);
                const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 2, brushSize, 8, false);
                const material = new THREE.MeshPhongMaterial({
                    color: currentColor,
                    shininess: 30
                });

                // Remove old line segment
                if (currentLine) {
                    scene.remove(currentLine);
                }

                currentLine = new THREE.Mesh(tubeGeometry, material);
                scene.add(currentLine);
            }
        }
    } else if (isRotating) {
        // Rotate camera
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.position.x = camera.position.x * Math.cos(deltaX * 0.01) - camera.position.z * Math.sin(deltaX * 0.01);
        camera.position.z = camera.position.x * Math.sin(deltaX * 0.01) + camera.position.z * Math.cos(deltaX * 0.01);

        camera.position.y += deltaY * 0.02;

        camera.lookAt(scene.position);
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mouseup', (e) => {
    if (e.button === 0 && isDrawing) {
        isDrawing = false;
        if (currentLine) {
            lines.push(currentLine);
            currentLine = null;
        }
    } else if (e.button === 2) {
        isRotating = false;
    }
});

// Disable context menu
renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Mouse wheel zoom
renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(1, Math.min(20, camera.position.z));
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
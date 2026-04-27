// Setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Drawing variables
let isDrawing3D = false;
let currentLine = null;
let points = [];

// Create material for drawing
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 2
});

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('mousedown', (e) => {
    isDrawing3D = true;
    points = [];

    // Start new line
    const geometry = new THREE.BufferGeometry();
    currentLine = new THREE.Line(geometry, lineMaterial);
    scene.add(currentLine);
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (!isDrawing3D) return;

    // Convert mouse position to 3D coordinates
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Draw on an invisible plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    points.push(intersectPoint.x, intersectPoint.y, intersectPoint.z);

    // Update line geometry
    currentLine.geometry.setAttribute('position',
        new THREE.Float32BufferAttribute(points, 3)
    );
});

renderer.domElement.addEventListener('mouseup', () => {
    isDrawing3D = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Allow camera rotation with mouse drag (optional)
let isDraggingCamera = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Right click for camera
        isDraggingCamera = true;
    }
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDraggingCamera) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.rotation.y += deltaX * 0.01;
        camera.rotation.x += deltaY * 0.01;
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mouseup', () => {
    isDraggingCamera = false;
});
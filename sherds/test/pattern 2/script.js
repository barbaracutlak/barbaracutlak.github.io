const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const bgImage = document.getElementById('bgImage');
const centerImage = document.getElementById('centerImage');

// ADD THIS SECTION HERE:
// Create pattern from texture image
const brushTexture = new Image();
brushTexture.src = 'images/brush_1.png'; // Change to your texture file

let brushPattern = null;

brushTexture.onload = function () {
    brushPattern = ctx.createPattern(brushTexture, 'repeat');
};



let isDrawing = false;
let currentColor = '#00ff00';
let currentSize = 5;
let history = [];
let currentStep = -1;

// Make canvas responsive
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Redraw background image after resize
    if (bgImage.complete && bgImage.src) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Save initial state
    saveState();
}

// Save canvas state to history
function saveState() {
    currentStep++;
    if (currentStep < history.length) {
        history.length = currentStep;
    }
    history.push(canvas.toDataURL());

    // Limit history to 20 steps to save memory
    if (history.length > 20) {
        history.shift();
        currentStep--;
    }
}

// Restore canvas state
function restoreState(step) {
    const img = new Image();
    img.src = history[step];
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

// Load the center artifact image
// ⬇️ CHANGE THE CENTER IMAGE FILENAME HERE ⬇️
function loadCenterImage() {
    centerImage.src = 'images/54-142-63.png';  // ← Change to your center image filename
}

loadCenterImage();

// Load the background image (optional)
// ⬇️ CHANGE THE BACKGROUND IMAGE FILENAME HERE (or leave empty for black background) ⬇️
async function loadBackgroundImage() {
    try {
        // Uncomment the lines below if you want a background image
        // const imageData = await window.fs.readFile('background.png');
        // const blob = new Blob([imageData], { type: 'image/png' });
        // const url = URL.createObjectURL(blob);
        // bgImage.src = url;
    } catch (error) {
        console.error('Error loading background image:', error);
    }
}

loadBackgroundImage();

// Wait for background image to load before drawing
bgImage.onload = function () {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
};

// Update brush size display
brushSize.addEventListener('input', (e) => {
    currentSize = e.target.value;
    sizeDisplay.textContent = currentSize;
});

// Update color
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Undo button
undoBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        restoreState(currentStep);
    }
});

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImage.complete && bgImage.src) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }
    saveState();
});

// Download image
downloadBtn.addEventListener('click', () => {
    // Create a temporary canvas to combine all elements
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw black background
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the main canvas (with drawings)
    tempCtx.drawImage(canvas, 0, 0);

    // Draw the center image on top
    if (centerImage.complete && centerImage.src) {
        const imgRect = centerImage.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const x = (imgRect.left - canvasRect.left) * (canvas.width / canvasRect.width);
        const y = (imgRect.top - canvasRect.top) * (canvas.height / canvasRect.height);
        const w = imgRect.width * (canvas.width / canvasRect.width);
        const h = imgRect.height * (canvas.height / canvasRect.height);

        tempCtx.drawImage(centerImage, x, y, w, h);
    }

    // Download the combined image
    const link = document.createElement('a');
    link.download = 'sherds-drawing.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});


// Get mouse/touch position relative to canvas
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
}

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

// Draw
function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();
    const pos = getPos(e);

    ctx.lineTo(pos.x, pos.y);

    // Use pattern if loaded, otherwise use solid color
    ctx.strokeStyle = brushPattern || currentColor;

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

// Stop drawing
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState();
    }
}

// Mouse events - use document instead of canvas to track off-screen movement
canvas.addEventListener('mousedown', startDrawing);
document.addEventListener('mousemove', draw);
document.addEventListener('mouseup', stopDrawing);

// Touch events for mobile
canvas.addEventListener('touchstart', startDrawing);
document.addEventListener('touchmove', draw);
document.addEventListener('touchend', stopDrawing);

// Make center image draggable
let isDraggingImage = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

centerImage.addEventListener('mousedown', (e) => {
    isDraggingImage = true;
    isDrawing = false; // Prevent drawing while dragging
    const rect = centerImage.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.stopPropagation(); // Prevent drawing
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingImage) {
        e.preventDefault();
        centerImage.style.left = (e.clientX - dragOffsetX) + 'px';
        centerImage.style.top = (e.clientY - dragOffsetY) + 'px';
        centerImage.style.transform = 'none'; // Remove centering transform
    }
});

document.addEventListener('mouseup', () => {
    if (isDraggingImage) {
        isDraggingImage = false;
    }
});


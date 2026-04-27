const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pointsSlider = document.getElementById('pointsSlider');
const pointsValue = document.getElementById('pointsValue');
const imageSizeSlider = document.getElementById('imageSizeSlider');
const imageSizeValue = document.getElementById('imageSizeValue');
const styleSelect = document.getElementById('styleSelect');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

const img = new Image();
img.crossOrigin = "anonymous";

// Load the pottery shard image
img.onload = function () {
    console.log('Image loaded successfully!');
    generateTessellation();
};

img.onerror = function () {
    console.error('Failed to load image. Check the path: images/54-142-63.png');
    alert('Image failed to load! Check console for details.');
};

// Use the uploaded image - CHANGE THIS PATH TO YOUR IMAGE
img.src = 'images/54-142-63.png';
console.log('Trying to load image from:', img.src);

pointsSlider.addEventListener('input', (e) => {
    pointsValue.textContent = e.target.value;
});

imageSizeSlider.addEventListener('input', (e) => {
    imageSizeValue.textContent = e.target.value;
});

generateBtn.addEventListener('click', generateTessellation);

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'tessellated-shard.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Handle window resize
window.addEventListener('resize', () => {
    generateTessellation();
});

function generateTessellation() {
    const numPoints = parseInt(pointsSlider.value);
    const style = styleSelect.value;
    const centerImagePercent = parseInt(imageSizeSlider.value) / 100;

    // Set canvas to fill the available space
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 200;

    // Draw tessellated background first
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data for color sampling
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Generate random points
    const points = [];

    // Add corner points
    points.push(0, 0);
    points.push(canvas.width, 0);
    points.push(canvas.width, canvas.height);
    points.push(0, canvas.height);

    // Calculate center image dimensions
    const centerWidth = canvas.width * centerImagePercent;
    const centerHeight = (img.height / img.width) * centerWidth;
    const centerX = (canvas.width - centerWidth) / 2;
    const centerY = (canvas.height - centerHeight) / 2;

    // Add random points (avoiding center area)
    for (let i = 0; i < numPoints; i++) {
        let x, y;
        let inCenter = true;

        // Keep generating points until we get one outside the center
        while (inCenter) {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;

            // Check if point is outside center rectangle
            if (x < centerX || x > centerX + centerWidth ||
                y < centerY || y > centerY + centerHeight) {
                inCenter = false;
            }
        }

        points.push(x, y);
    }

    // Create Delaunay triangulation
    const delaunay = new Delaunator(points);

    // Clear canvas and fill with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw triangles (only those outside center area)
    for (let i = 0; i < delaunay.triangles.length; i += 3) {
        const p1 = [points[delaunay.triangles[i] * 2], points[delaunay.triangles[i] * 2 + 1]];
        const p2 = [points[delaunay.triangles[i + 1] * 2], points[delaunay.triangles[i + 1] * 2 + 1]];
        const p3 = [points[delaunay.triangles[i + 2] * 2], points[delaunay.triangles[i + 2] * 2 + 1]];

        // Get center point of triangle
        const centerTriX = Math.floor((p1[0] + p2[0] + p3[0]) / 3);
        const centerTriY = Math.floor((p1[1] + p2[1] + p3[1]) / 3);

        // Skip triangles that are in the center area
        if (centerTriX >= centerX && centerTriX <= centerX + centerWidth &&
            centerTriY >= centerY && centerTriY <= centerY + centerHeight) {
            continue;
        }

        // Get pixel color at center
        const pixelIndex = (centerTriY * canvas.width + centerTriX) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];

        // Draw based on style
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.closePath();

        if (style === 'triangles' || style === 'flat') {
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fill();
        }

        if (style === 'triangles' || style === 'wireframe') {
            ctx.strokeStyle = style === 'wireframe' ? 'white' : `rgba(0, 0, 0, 0.3)`;
            ctx.lineWidth = style === 'wireframe' ? 2 : 1;
            ctx.stroke();
        }
    }

    // Draw the original image in the center on top
    ctx.drawImage(img, centerX, centerY, centerWidth, centerHeight);
}
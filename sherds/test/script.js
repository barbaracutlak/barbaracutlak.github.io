// Make all shard images draggable
const shardLinks = document.querySelectorAll('.shard-link');

shardLinks.forEach(link => {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    link.addEventListener('mousedown', (e) => {
        // Prevent link navigation when dragging
        e.preventDefault();

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        // Get current position
        const rect = link.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        link.style.cursor = 'move';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        link.style.left = (initialLeft + deltaX) + 'px';
        link.style.top = (initialTop + deltaY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            link.style.cursor = 'pointer';
        }
    });

    // Prevent click navigation if dragged
    link.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
            e.preventDefault();
        }
    });
});
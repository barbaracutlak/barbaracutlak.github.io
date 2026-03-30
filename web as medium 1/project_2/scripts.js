

const boxes = document.querySelectorAll(".label-box");

boxes.forEach(box => {
    let isDragging = false;
    let offsetX, offsetY;

    box.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - box.offsetLeft;
        offsetY = e.clientY - box.offsetTop;
        box.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        box.style.left = `${e.clientX - offsetX}px`;
        box.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        box.style.cursor = "grab";
    });
});
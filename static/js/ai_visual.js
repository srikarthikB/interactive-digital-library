const generateBtn = document.getElementById("generateVisualBtn");
const visualContainer = document.getElementById("aiVisualContainer");
const visualImage = document.getElementById("aiVisualImage");

const visualImages = Array.from(
    document.querySelectorAll("[data-visual-src]")
).map(img => img.getAttribute("data-visual-src"));

if (generateBtn && visualImages.length > 0) {
    generateBtn.addEventListener("click", () => {
        const randomIndex = Math.floor(Math.random() * visualImages.length);
        visualImage.src = visualImages[randomIndex];
        visualContainer.classList.remove("hidden");
    });
}

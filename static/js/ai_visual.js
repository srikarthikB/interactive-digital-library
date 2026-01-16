document.addEventListener("DOMContentLoaded", () => {

    const generateBtn = document.getElementById("generateVisualBtn");
    const visualContainer = document.getElementById("aiVisualContainer");
    const visualImage = document.getElementById("aiVisualImage");
    const loader = document.getElementById("aiVisualLoader");

    const visualImages = Array.from(
        document.querySelectorAll("[data-visual-src]")
    ).map(img => img.dataset.visualSrc);

    if (!generateBtn || visualImages.length === 0) return;

    generateBtn.addEventListener("click", () => {

        // Show container
        visualContainer.classList.remove("hidden");

        // Show loader
        loader?.classList.remove("hidden");

        // Reset image
        visualImage.classList.add("hidden", "opacity-0");

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * visualImages.length);
            visualImage.src = visualImages[randomIndex];

            // Hide loader
            loader?.classList.add("hidden");

            // Show image
            visualImage.classList.remove("hidden");

            // FORCE browser reflow
            visualImage.offsetHeight;

            // Fade in
            visualImage.classList.remove("opacity-0");

        }, 700);
    });
});

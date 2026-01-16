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
        loader.classList.remove("hidden");

        // Hide image
        visualImage.classList.add("hidden");

        // FORCE browser to render loader
        requestAnimationFrame(() => {

            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * visualImages.length);
                visualImage.src = visualImages[randomIndex];

                // Hide loader
                loader.classList.add("hidden");

                // Show image
                visualImage.classList.remove("hidden");

            }, 800); // slightly longer so you can SEE it
        });
    });
});

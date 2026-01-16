const visualCaptions = {
    "scene1.jpg": "A pivotal moment shaping the course of the story.",
    "scene2.jpg": "A confrontation that defines key character relationships.",
    "scene3.jpg": "A moment of moral dilemma and inner conflict."
};

document.addEventListener("DOMContentLoaded", () => {

    const generateBtn = document.getElementById("generateVisualBtn");
    const visualContainer = document.getElementById("aiVisualContainer");
    const visualImage = document.getElementById("aiVisualImage");
    const loader = document.getElementById("aiVisualLoader");
    const captionEl = document.getElementById("aiVisualCaption");

    const visualImages = Array.from(
        document.querySelectorAll("[data-visual-src]")
    ).map(img => img.dataset.visualSrc);

    let currentIndex = -1;
    let hasStarted = false;

    if (!generateBtn || visualImages.length === 0) return;

    function showNextVisual() {

        // 🔁 Change button text after first click
        if (!hasStarted) {
            generateBtn.textContent = "Next visual →";
            hasStarted = true;
        }

        visualContainer.classList.remove("hidden");
        loader?.classList.remove("hidden");

        visualImage.classList.add("hidden", "opacity-0");
        captionEl?.classList.add("opacity-0");

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % visualImages.length;
            const imagePath = visualImages[currentIndex];

            visualImage.src = imagePath;

            // Caption
            if (captionEl) {
                const fileName = imagePath.split("/").pop();
                captionEl.textContent =
                    visualCaptions[fileName] ||
                    "AI-generated visualization of a significant narrative moment.";
            }

            loader?.classList.add("hidden");
            visualImage.classList.remove("hidden");

            // Force reflow for fade-in
            visualImage.offsetHeight;
            visualImage.classList.remove("opacity-0");
            captionEl?.classList.remove("opacity-0");

        }, 700);
    }

    // Single button handles everything
    generateBtn.addEventListener("click", showNextVisual);
});

const generateBtn = document.getElementById("generateVisualBtn");
const visualContainer = document.getElementById("aiVisualContainer");
const visualImage = document.getElementById("aiVisualImage");

const visualImages = Array.from(
    document.querySelectorAll("[data-visual-src]")
).map(img => img.getAttribute("data-visual-src"));

if (generateBtn && visualImages.length > 0) {
    generateBtn.addEventListener("click", () => {

    // 1️⃣ Show container immediately
    visualContainer.classList.remove("hidden");

    // 2️⃣ Loading illusion
    visualImage.src = "";
    visualImage.alt = "Generating AI visual interpretation...";

    // 3️⃣ Slight delay to simulate generation
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * visualImages.length);
        visualImage.src = visualImages[randomIndex];
        visualImage.alt = "AI generated visual interpretation";
    }, 600); // 600ms feels natural
});
}

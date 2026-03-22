/**
 * ai_visual.js
 * Handles the "Show AI Visual Interpretation" button on visuals.html.
 *
 * Expected DOM (set by visuals.html):
 *   #showVisualBtn       — the trigger button
 *   #aiVisualContainer   — wrapper div (display:none initially)
 *   #aiVisualLoader      — spinner panel inside the container
 *   #aiVisualWrap        — image + caption wrapper inside the container
 *   #aiVisualImage       — <img> element
 *   #aiVisualCaption     — <p> caption element
 *   #visualSources       — hidden container holding <span data-src="..."> elements
 *   .visual-card         — grid cards revealed after the first image loads
 *
 * Behaviour:
 *   • First click: show spinner → preload image → fade in single visual → reveal grid
 *   • Subsequent clicks: cycle to the next image with a smooth crossfade
 *   • Button label updates to "Next visual →" after the first reveal
 */

(function () {
    "use strict";

    // Per-filename captions — extend this object as new visuals are added
    var CAPTIONS = {
        "scene1.jpg": "A pivotal moment shaping the course of the story.",
        "scene2.jpg": "A confrontation that defines key character relationships.",
        "scene3.jpg": "A moment of moral dilemma and inner conflict."
    };

    var DEFAULT_CAPTION = "AI-generated visualization of a significant narrative moment.";

    // ── DOM refs ──────────────────────────────────────────────────────────────
    var btn       = document.getElementById("showVisualBtn");
    var container = document.getElementById("aiVisualContainer");
    var loader    = document.getElementById("aiVisualLoader");
    var wrap      = document.getElementById("aiVisualWrap");
    var img       = document.getElementById("aiVisualImage");
    var captionEl = document.getElementById("aiVisualCaption");
    var grid      = document.querySelector(".visual-card") &&
                    document.getElementById("visualGrid"); // may be null

    // Collect sources from the hidden list Jinja rendered
    var sources = Array.from(
        document.querySelectorAll("#visualSources [data-src]")
    ).map(function (el) { return el.dataset.src; });

    // Nothing to do if button or images are missing
    if (!btn || sources.length === 0) return;

    // ── State ─────────────────────────────────────────────────────────────────
    var currentIndex = -1;
    var isLoading    = false;

    // ── Helpers ───────────────────────────────────────────────────────────────

    function captionFor(src) {
        var fileName = src.split("/").pop();
        return CAPTIONS[fileName] || DEFAULT_CAPTION;
    }

    /**
     * Crossfade the current image out, swap src, fade back in.
     * On the very first call (currentIndex was -1) we skip the fade-out.
     */
    function showImage(src, isFirst) {
        if (captionEl) captionEl.textContent = captionFor(src);

        function revealImg() {
            img.src = src;

            // Start invisible
            img.style.opacity   = "0";
            img.style.transform = "scale(0.97)";
            img.style.transition = "opacity 0.55s ease, transform 0.55s ease";

            var preload = new Image();

            preload.onload = function () {
                loader.style.display    = "none";
                wrap.style.display      = "block";

                // Tiny double-rAF ensures the browser registers the initial
                // opacity:0 before we animate to opacity:1
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        img.style.opacity   = "1";
                        img.style.transform = "scale(1)";
                        isLoading = false;

                        // Reveal the full grid of cards the first time only
                        if (isFirst && grid) {
                            grid.style.display = "grid";
                        }
                    });
                });
            };

            preload.onerror = function () {
                // Show anyway if preload fails (e.g. dev environment)
                loader.style.display = "none";
                wrap.style.display   = "block";
                img.style.opacity    = "1";
                img.style.transform  = "scale(1)";
                isLoading = false;
                if (isFirst && grid) grid.style.display = "grid";
            };

            preload.src = src;
        }

        if (isFirst) {
            // First reveal: container was hidden — show it with spinner first
            container.style.display = "block";
            loader.style.display    = "block";
            wrap.style.display      = "none";
            revealImg();
        } else {
            // Cycling: crossfade out current image, then swap
            img.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            img.style.opacity    = "0";
            img.style.transform  = "scale(0.97)";

            setTimeout(function () {
                revealImg();
            }, 320);
        }
    }

    // ── Button click handler ──────────────────────────────────────────────────

    btn.addEventListener("click", function () {
        if (isLoading) return;   // debounce: ignore clicks during transition
        isLoading = true;

        // Advance index (wraps around)
        currentIndex = (currentIndex + 1) % sources.length;
        var isFirst  = (currentIndex === 0 && btn.textContent.trim().startsWith("Show"));

        // Update button label after the first click
        if (isFirst) {
            btn.textContent = sources.length > 1
                ? "Next visual →"
                : "View visual again";
        }

        showImage(sources[currentIndex], isFirst);
    });

}());
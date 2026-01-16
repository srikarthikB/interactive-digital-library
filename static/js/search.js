document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       SEARCH FUNCTIONALITY
    ========================= */

    const searchInput = document.getElementById("searchInput");
    const bookCards = document.querySelectorAll(".book-card");

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase();

            bookCards.forEach(card => {
                const title = card.dataset.title;

                if (title.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    /* =========================
       FILTER BUTTON FUNCTIONALITY
    ========================= */

    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            // Active button UI
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filter = button.dataset.filter;

            bookCards.forEach(card => {
                const category = card.dataset.category;
                const region = card.dataset.region;
                const copyright = card.dataset.copyright;

                let show = false;

                if (filter === "all") show = true;
                if (filter === "epic" && category === "epic") show = true;
                if (filter === "india" && region === "india") show = true;
                if (filter === "public" && copyright === "public") show = true;
                if (filter === "copyrighted" && copyright === "copyrighted") show = true;

                card.style.display = show ? "flex" : "none";
            });
        });
    });

});

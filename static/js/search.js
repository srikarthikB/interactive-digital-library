const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    const books = document.querySelectorAll("[data-title]");

    books.forEach(book => {
        const title = book.getAttribute("data-title");

        if (title.includes(query)) {
            book.style.display = "flex";
        } else {
            book.style.display = "none";
        }
    });
});

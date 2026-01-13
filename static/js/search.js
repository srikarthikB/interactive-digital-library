const searchInput = document.getElementById("searchInput");
const books = document.querySelectorAll(".book-card");

searchInput.addEventListener("keyup", function () {
    const query = searchInput.value.toLowerCase();

    books.forEach(function (book) {
        const title = book.getAttribute("data-title");

        if (title.includes(query)) {
            book.style.display = "inline-block";
        } else {
            book.style.display = "none";
        }
    });
});

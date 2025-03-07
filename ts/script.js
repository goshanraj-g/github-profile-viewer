window.addEventListener("load", function () {
    var btn = document.getElementById("submit");
    var inputLink = document.getElementById("github-link");
    if (!btn) {
        console.error("Button with ID 'submit' is not available");
        return;
    }
    btn.addEventListener("click", function () {
        if (!inputLink) {
            return;
        }
    });
});

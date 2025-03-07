window.addEventListener("load", () => {
    const btn = document.getElementById("submit");
    const inputLink = document.getElementById("github-link");

    if (!btn) {
        console.error("Button with ID 'submit' is not available");
        return;
    }

    btn.addEventListener("click", () => {
        if (!inputLink) {
            return;
        }

    });

});
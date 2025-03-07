interface GitHubUser {
    login: string;
    name: string;
    avatar_url: string;
    bio: string | null;
    followers: number;
    following: number;
    html_url: string;
    company: string | null;
    location: string | null;
    email: string | null;
    public_repos: number;
    private_repos: number;
    created_at: string;
    updated_at: string;
}

window.addEventListener("load", () => {
    const btn = document.getElementById("submit");
    const inputLink = document.getElementById("github-link") as HTMLInputElement;
    const profileSection = document.getElementById("profile");
    const mainSection = document.getElementById("main");
    const backButton = document.getElementById("back-button");

    if (!btn || !profileSection || !mainSection || !backButton) {
        console.error("Required elements are not available");
        return;
    }

    function showProfile() {
        if (mainSection && profileSection) {
            mainSection.classList.add("hidden");
            profileSection.classList.remove("hidden");
        }

    }

    function showInput() {
        if (mainSection && profileSection) {
            mainSection.classList.remove("hidden");
            profileSection.classList.add("hidden");
        }
    }

    btn.addEventListener("click", () => {
        const username = inputLink?.value.split('/').pop(); 
        if (username) {
            fetch(`https://api.github.com/users/${username}`)
                .then(response => response.json())
                .then((data: GitHubUser) => {
                    document.getElementById("username")!.textContent = data.name || data.login;
                    document.getElementById("bio")!.textContent = data.bio || "No bio available";
                    document.getElementById("followers")!.textContent = `Followers: ${data.followers}`;
                    document.getElementById("following")!.textContent = `Following: ${data.following}`;
                    document.getElementById("public_repos")!.textContent = `Public Repos: ${data.public_repos}`;

                    showProfile();
                })
                .catch(error => console.error("Error fetching GitHub profile:", error));
        } else {
            alert("Please enter a valid GitHub URL");
        }
    });

    backButton.addEventListener("click", () => {
        showInput();
    });
});
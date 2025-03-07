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
    const inputLink = (document.getElementById("github-link") as HTMLInputElement);

    if (!btn) {
        console.error("Button with ID 'submit' is not available");
        return;
    }

    btn.addEventListener("click", () => {
        const username = inputLink?.value;
        if (username) {
            fetch(`http://api.github.com/users/${username}`).then(response => response.json()).then((data: GitHubUser) => {
                localStorage.setItem('githubUser', JSON.stringify(data));

                window.location.href = 'stats.html';

            })
                .catch(error => console.error("error fetching GitHub Profile", error));
        } else {
            alert("please enter a proper github user-name");
        }
    });

    const profile = document.getElementById("profile");
    if (profile && window.location.pathname.endsWith('stats.html')) {
        const userData = localStorage.getItem('githubUser');
        if (userData) {
            const data: GitHubUser = JSON.parse(userData);
            document.getElementById("username")!.textContent = data.name || data.login;
            document.getElementById("bio")!.textContent = data.bio || "No bio available";
            document.getElementById("followers")!.textContent = `Followers: ${data.followers}`;
            document.getElementById("following")!.textContent = `Following: ${data.following}`;
            document.getElementById("public_repos")!.textContent = `Public Repos: ${data.public_repos}`;
        } else {
            profile.innerHTML = "<p>No data available</p>";
        }
    }
});
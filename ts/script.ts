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
        window.location.href = 'stats.html';
        const profile = document.getElementById("profile") as HTMLElement | null;
        if (!profile) {
            console.error("Profile cannot be reached");
            return;
        }

        function getProfile() {
            const username = (document.getElementById("inputLink") as HTMLInputElement)?.value;
            if (profile) {
                fetch(`https://api.github.com/users/${username}`)
                    .then(response => response.json())
                    .then(data => {
                        profile.innerHTML = `
                    <h2>${data.name} (@${data.login})</h2>
                    <img src="${data.avatar_url}" width="100">
                    <p>${data.bio}</p>
                    <p>Followers: ${data.followers} | Following: ${data.following}</p>
                    <a href="${data.html_url}" target="_blank">View Profile</a>
                `;
                    })


            }



        }



    });

});
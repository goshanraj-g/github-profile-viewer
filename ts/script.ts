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
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  description: string | null;
  fork: boolean;
}

interface LanguageStat {
  name: string;
  count: number;
  color: string;
}

window.addEventListener("load", () => {
  const submitBtn = document.getElementById("submit");
  const inputLink = document.getElementById("github-link") as HTMLInputElement;
  const profileSection = document.getElementById("profile");
  const mainSection = document.getElementById("main");
  const backButton = document.getElementById("back-button");
  const avatarImg = document.getElementById("avatar") as HTMLImageElement;
  const githubLinkButton = document.getElementById(
    "github-link-button"
  ) as HTMLAnchorElement;
  const languagesContainer = document.getElementById("languages-container");

  if (!submitBtn || !profileSection || !mainSection || !backButton) {
    console.error("Required elements are not available");
    return;
  }

  const languageColors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    "C#": "#178600",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    Ruby: "#701516",
    Go: "#00ADD8",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Rust: "#dea584",
    Dart: "#00B4AB",
    Shell: "#89e051",
    C: "#555555",
    Vue: "#41b883",
    "Jupyter Notebook": "#DA5B0B",
  };

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

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function fetchUserLanguages(username: string): Promise<LanguageStat[]> {
    return fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not fetch repositories");
        }
        return response.json();
      })
      .then((repos: GitHubRepo[]) => {
        const ownRepos = repos.filter((repo) => !repo.fork);

        const languageCounts: Record<string, number> = {};
        ownRepos.forEach((repo) => {
          if (repo.language) {
            languageCounts[repo.language] =
              (languageCounts[repo.language] || 0) + 1;
          }
        });

        const languageStats: LanguageStat[] = Object.keys(languageCounts)
          .map((language) => ({
            name: language,
            count: languageCounts[language],
            color: languageColors[language] || "#858585",
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return languageStats;
      });
  }

  function renderLanguages(languages: LanguageStat[]) {
    if (!languagesContainer) return;

    languagesContainer.innerHTML = "";

    if (languages.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No language data available";
      languagesContainer.appendChild(emptyMessage);
      return;
    }

    languages.forEach((lang) => {
      const langItem = document.createElement("div");
      langItem.className = "language-item";

      const langColor = document.createElement("span");
      langColor.className = "language-color";
      langColor.style.backgroundColor = lang.color;

      const langName = document.createElement("span");
      langName.className = "language-name";
      langName.textContent = lang.name;

      const langCount = document.createElement("span");
      langCount.className = "language-count";
      langCount.textContent = `${lang.count} repos`;

      langItem.appendChild(langColor);
      langItem.appendChild(langName);
      langItem.appendChild(langCount);

      languagesContainer.appendChild(langItem);
    });
  }

  submitBtn.addEventListener("click", () => {
    let username = inputLink?.value.trim();

    if (username.indexOf("github.com/") !== -1) {
      username = username.split("/").pop() || "";
    }

    if (username) {
      submitBtn.textContent = "Loading...";
      submitBtn.setAttribute("disabled", "true");

      fetch(`https://api.github.com/users/${username}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Profile not found");
          }
          return response.json();
        })
        .then((data: GitHubUser) => {
          document.getElementById("username")!.textContent =
            data.name || data.login;
          document.getElementById("login")!.textContent = `@${data.login}`;
          document.getElementById("bio")!.textContent =
            data.bio || "No bio available";
          document.getElementById("location")!.textContent =
            data.location ?? "Location not available";
          document.getElementById(
            "followers"
          )!.textContent = `${data.followers} followers`;
          document.getElementById(
            "following"
          )!.textContent = `${data.following} following`;
          document.getElementById(
            "public_repos"
          )!.textContent = `${data.public_repos} repositories`;
          document.getElementById(
            "created_at"
          )!.textContent = `Joined on ${formatDate(data.created_at)}`;

          if (avatarImg) {
            avatarImg.src = data.avatar_url;
          }

          if (githubLinkButton) {
            githubLinkButton.href = data.html_url;
          }

          return fetchUserLanguages(username);
        })
        .then((languages) => {
          renderLanguages(languages);
          showProfile();
        })
        .catch((error) => {
          alert(`Error: ${error.message || "Could not fetch profile"}`);
          console.error("Error fetching GitHub data:", error);
        })
        .then(() => {
          submitBtn.textContent = "View Profile";
          submitBtn.removeAttribute("disabled");
        });
    } else {
      alert("Please enter a valid GitHub username");
    }
  });

  inputLink.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      submitBtn.click();
    }
  });

  backButton.addEventListener("click", () => {
    showInput();
  });
});

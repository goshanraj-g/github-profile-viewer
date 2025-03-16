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

interface ContributionDate {
  date: string;
  count: number;
}

interface StarredRepo {
  name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
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

  function fetchContributions(username: string): Promise<ContributionDate[]> {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const since = oneYearAgo.toISOString();
    const until = now.toISOString();

    return fetch(`https://api.github.com/users/${username}/events?per_page=100`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not fetch contribution data");
        }
        return response.json();
      })
      .then((events) => {
        const contributionMap: Map<string, number> = new Map();

        for (let i = 0; i < 365; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          contributionMap.set(dateStr, 0);
        }

        events.forEach((event: any) => {
          if (event.type === "PushEvent") {
            const date = event.created_at.split("T")[0];
            const currentCount = contributionMap.get(date) || 0;
            const commitCount = event.payload.commits?.length || 0;
            contributionMap.set(date, currentCount + commitCount);
          }
        });

        const contributions: ContributionDate[] = [];
        contributionMap.forEach((count, date) => {
          contributions.push({ date, count });
        });

        return contributions.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
  }

  function fetchStarredRepos(username: string): Promise<StarredRepo[]> {
    return fetch(
      `https://api.github.com/users/${username}/starred?per_page=5&sort=updated`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not fetch starred repositories");
        }
        return response.json();
      })
      .then((repos: StarredRepo[]) => {
        return repos;
      });
  }

  function renderContributionGraph(contributions: ContributionDate[]) {
    const calendarContainer = document.querySelector(".contribution-calendar");
    if (!calendarContainer) return;

    calendarContainer.innerHTML = "";

    const maxCount = Math.max(...contributions.map((day) => day.count), 4);

    const recentContributions = contributions.slice(-91);

    for (let weekIndex = 0; weekIndex < 13; weekIndex++) {
      const weekContainer = document.createElement("div");
      weekContainer.className = "contribution-week";

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const index = weekIndex * 7 + dayIndex;
        const day =
          index < recentContributions.length
            ? recentContributions[index]
            : null;

        const daySquare = document.createElement("div");
        daySquare.className = "contribution-day";

        if (day) {
          let intensity = day.count / maxCount;
          let colorClass = "level-0";

          if (day.count > 0) {
            if (intensity < 0.25) colorClass = "level-1";
            else if (intensity < 0.5) colorClass = "level-2";
            else if (intensity < 0.75) colorClass = "level-3";
            else colorClass = "level-4";
          }

          daySquare.classList.add(colorClass);
          daySquare.setAttribute("data-date", day.date);
          daySquare.setAttribute("data-count", String(day.count));

          daySquare.title = `${day.date}: ${day.count} contributions`;
        }

        weekContainer.appendChild(daySquare);
      }

      calendarContainer.appendChild(weekContainer);
    }
  }

  function renderStarredRepos(repos: StarredRepo[]) {
    const starredContainer = document.getElementById("starred-repos-container");
    if (!starredContainer) return;

    starredContainer.innerHTML = "";

    if (repos.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No starred repositories";
      starredContainer.appendChild(emptyMessage);
      return;
    }

    repos.forEach((repo) => {
      const repoCard = document.createElement("div");
      repoCard.className = "repo-card";

      const repoHeader = document.createElement("div");
      repoHeader.className = "repo-header";

      const repoTitle = document.createElement("a");
      repoTitle.className = "repo-title";
      repoTitle.href = repo.html_url;
      repoTitle.target = "_blank";
      repoTitle.textContent = `${repo.owner.login}/${repo.name}`;

      const repoStars = document.createElement("span");
      repoStars.className = "repo-stars";
      repoStars.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${repo.stargazers_count}`;

      repoHeader.appendChild(repoTitle);
      repoHeader.appendChild(repoStars);
      repoCard.appendChild(repoHeader);

      if (repo.description) {
        const repoDesc = document.createElement("p");
        repoDesc.className = "repo-description";
        repoDesc.textContent = repo.description;
        repoCard.appendChild(repoDesc);
      }

      if (repo.language) {
        const repoLang = document.createElement("div");
        repoLang.className = "repo-language";

        const langColor = document.createElement("span");
        langColor.className = "language-color";
        langColor.style.backgroundColor =
          languageColors[repo.language] || "#858585";

        const langName = document.createElement("span");
        langName.textContent = repo.language;

        repoLang.appendChild(langColor);
        repoLang.appendChild(langName);
        repoCard.appendChild(repoLang);
      }

      starredContainer.appendChild(repoCard);
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

      Promise.all([
        fetch(`https://api.github.com/users/${username}`).then((response) => {
          if (!response.ok) throw new Error("Profile not found");
          return response.json();
        }),
        fetchUserLanguages(username),
        fetchContributions(username),
        fetchStarredRepos(username),
      ])
        .then(([userData, languages, contributions, starredRepos]) => {
          document.getElementById("username")!.textContent =
            userData.name || userData.login;
          document.getElementById("login")!.textContent = `@${userData.login}`;
          document.getElementById("bio")!.textContent =
            userData.bio || "No bio available";
          document.getElementById("location")!.textContent =
            userData.location ?? "Location not available";
          document.getElementById(
            "followers"
          )!.textContent = `${userData.followers} followers`;
          document.getElementById(
            "following"
          )!.textContent = `${userData.following} following`;
          document.getElementById(
            "public_repos"
          )!.textContent = `${userData.public_repos} public repositories`;
          document.getElementById(
            "created_at"
          )!.textContent = `Joined on ${formatDate(userData.created_at)}`;

          if (avatarImg) {
            avatarImg.src = userData.avatar_url;
          }

          if (githubLinkButton) {
            githubLinkButton.href = userData.html_url;
          }

          renderLanguages(languages);
          renderContributionGraph(contributions);
          renderStarredRepos(starredRepos);

          showProfile();
        })
        .catch((error) => {
          alert(`Error: ${error.message || "Could not fetch profile"}`);
          console.error("Error fetching GitHub data:", error);
        })
        .finally(() => {
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

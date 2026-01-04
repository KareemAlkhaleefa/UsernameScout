TARGET_SITES = [
    {
        "name": "GitHub",
        "url_template": "https://github.com/{}",
        "category": "Development",
        "official_site": "https://github.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "Youtube",
        "url_template": "https://youtube.com/@{}",
        "category": "Social",
        "official_site": "https://youtube.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "DockerHub",
        "url_template": "https://hub.docker.com/u/{}",
        "category": "Development",
        "official_site": "https://hub.docker.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "Dev.to",
        "url_template": "https://dev.to/{}",
        "category": "Development",
        "official_site": "https://dev.to",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "Replit",
        "url_template": "https://replit.com/@{}",
        "category": "Development",
        "official_site": "https://replit.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "BuyMeACoffee",
        "url_template": "https://buymeacoffee.com/{}",
        "category": "Social",
        "official_site": "https://buymeacoffee.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "GitLab",
        "url_template": "https://gitlab.com/{}",
        "category": "Development",
        "official_site": "https://gitlab.com",
        "availability_strategy": "status_redirect",
    },
    {
        "name": "Chess.com",
        "url_template": "https://chess.com/member/{}",
        "category": "Gaming",
        "official_site": "https://chess.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "BitBucket",
        "url_template": "https://bitbucket.org/{}/workspace/repositories/",
        "category": "Development",
        "official_site": "https://bitbucket.org",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "Snapchat",
        "url_template": "https://www.snapchat.com/@{}",
        "category": "Social",
        "official_site": "https://snapchat.com",
        "availability_strategy": "status_not_found",
    },
    {
        "name": "Reddit",
        "url_template": "https://www.reddit.com/user/{}/",
        "category": "Social",
        "availability_strategy": "content_match",
        "not_found_phrases": [
            "Sorry, nobody on Reddit goes by that name.",
            "This account may have been banned or the username is incorrect.",
        ],
    },
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.110 Mobile Safari/537.36",
]

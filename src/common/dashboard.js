const express = require("express");
const router = express.Router();

// Define download info
const downloads = [
    {
        name: "Android",
        icon: "https://img.icons8.com/color/48/android-os.png",
        url: "https://example.com/downloads/app-android.apk",
        isDownload: true,
    },
    {
        name: "iOS",
        icon: "https://img.icons8.com/ios/50/apple-logo.png",
        url: "https://example.com/downloads/app-ios.ipa",
        isDownload: false,
    },
    {
        name: "PC",
        icon: "https://img.icons8.com/fluency/48/windows-11.png",
        url: "https://example.com/downloads/app-windows.exe",
        isDownload: true,
    },
    {
        name: "macOS",
        icon: "https://img.icons8.com/color/48/mac-os.png",
        url: "https://example.com/downloads/app-macos.dmg",
        isDownload: false,
    }
];

router.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Galaxy Dashboard – Download Center</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        html, body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', sans-serif;
            background: radial-gradient(ellipse at center, #1b2735 0%, #090a0f 100%);
            color: white;
            min-height: 100vh;
        }

        body {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 40px 20px 10px;
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 1px;
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(6px);
        }

        header img {
            height: 48px;
            width: 48px;
        }

        .subtitle {
            text-align: center;
            font-size: 16px;
            color: #aaa;
            margin-top: 6px;
        }

        .container {
            flex: 1;
            padding: 40px 20px;
            max-width: 880px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 16px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.05);
            min-height: 500px;
        }

        .description {
            font-size: 16px;
            color: #ccc;
            line-height: 1.6;
            text-align: center;
            margin-bottom: 40px;
        }

        .platform-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 20px;
        }

        .platform-card {
            background: rgba(255,255,255,0.08);
            border-radius: 10px;
            text-align: center;
            padding: 20px;
            transition: transform 0.2s ease;
        }

        .platform-card:hover {
            transform: scale(1.03);
        }

        .platform-card img {
            width: 48px;
            height: 48px;
        }

        .platform-card p {
            margin: 10px 0;
            font-weight: bold;
        }

        .download-btn {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 16px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            text-decoration: none;
            transition: background 0.3s;
        }

        .download-btn:hover {
            background-color: #2980b9;
        }

        .download-btn.disabled {
            background: gray;
            pointer-events: none;
            cursor: not-allowed;
        }

        footer {
            text-align: center;
            font-size: 12px;
            color: rgba(255,255,255,0.3);
            padding: 20px 0;
        }

        @media (max-width: 600px) {
            header {
                font-size: 24px;
                flex-direction: column;
                gap: 6px;
            }
            .description {
                font-size: 14px;
                padding: 0 10px;
            }
        }
    </style>
</head>
<body>
    <header>
        <img src="https://example.com/logo.png" alt="Galaxy Logo" />
        <span>Galaxy Dashboard</span>
    </header>
    <div class="subtitle">Download Center</div>

    <div class="container">
        <div class="description">
            Welcome to the official Galaxy Dashboard.<br />
            Here you can download the latest versions of our software for all platforms.<br />
            Availability is updated regularly based on new releases.
        </div>

        <div class="platform-grid">
            ${downloads.map(p => `
                <div class="platform-card">
                    <img src="${p.icon}" alt="${p.name}" />
                    <p>${p.name}</p>
                    <a class="download-btn ${p.isDownload ? "" : "disabled"}" href="${p.isDownload ? p.url : '#'}">
                        ${p.isDownload ? "Download" : "Unavailable"}
                    </a>
                </div>
            `).join("")}
        </div>
    </div>

    <footer>&copy; ${new Date().getFullYear()} Galaxy Systems · All rights reserved</footer>
</body>
</html>
    `);
});

module.exports = router;
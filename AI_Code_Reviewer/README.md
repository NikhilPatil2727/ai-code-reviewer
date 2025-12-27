🧠 AI Code Reviewer – VS Code Extension

An AI-powered VS Code extension that reviews your project files, fixes bugs, improves code quality, and writes optimized code directly back into your files.

⚠️ Important (Read First)

Open only ONE project folder at a time.
Large or multiple folders can cause huge token usage, leading to high API cost, slow responses, or failed reviews.

▶️ How to Use
1️⃣ Open Your Project Folder

Open one project folder in VS Code.

2️⃣ Set Gemini API Key (One-Time Setup)

Open Settings → search for aiCodeReviewer.apiKey
or add to settings.json:

{
  "aiCodeReviewer.apiKey": "YOUR_GEMINI_API_KEY"
}

3️⃣ Run the Extension

Press Ctrl + Shift + P

Run:

AI Code Reviewer: Review Current Folder


Watch the Output panel for progress

✨ What It Does

Scans source files (.js, .ts, .html, .css, .jsx, .tsx)

Fixes bugs, security issues, and code quality problems

Improves HTML & CSS issues

Writes updated code back into the same files

Adds comments explaining the changes

⚠️ Notes

Files are modified directly (use Git or backup)

node_modules is ignored

Files are processed one by one
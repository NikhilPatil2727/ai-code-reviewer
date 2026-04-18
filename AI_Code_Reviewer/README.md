# 🧠 AI Code Reviewer – VS Code Extension

An AI-powered VS Code extension that reviews your project files, fixes bugs, improves code quality, and writes optimized code directly back into your files.

---

## ⚠️ Important (Read First)

Open only **ONE** project folder at a time.  

Large or multiple folders can cause:
- Huge token usage  
- High API costs  
- Slow responses  
- Failed reviews  

---

## ⚠️ AI Usage Guidelines

- Always **review the AI-generated code before using it**
- Do **not blindly trust AI output**
- Validate logic, security, and performance
- Test the code in your environment before deploying

> ⚡ Think of AI as a **helper, not a replacement for your judgment**

---

## ▶️ How to Use

### 1️⃣ Open Your Project Folder

Open **one** project folder in VS Code.

---

### 2️⃣ Set Gemini API Key (One-Time Setup)

Open **Settings** (`Ctrl + ,`)  
Search for: `aiCodeReviewer.apiKey`  

Add your API key:

```json
{
  "aiCodeReviewer.apiKey": "YOUR_GEMINI_API_KEY"
}
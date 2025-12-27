const vscode = require("vscode");
const { GoogleGenAI, Type } = require("@google/genai");
const fs = require("fs").promises;
const path = require("path");

/* ===========================
   FILE SYSTEM TOOLS
=========================== */

async function listFiles({ directory }) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    let files = [];

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        files.push(...(await listFiles({ directory: fullPath })));
      } else if (entry.isFile()) {
        if (/\.(js|ts|html|css|jsx|tsx)$/i.test(entry.name)) {
          files.push(path.normalize(fullPath));
        }
      }
    }
    return files;
  } catch (e) {
    return { error: e.message };
  }
}

async function readFile({ file_path }) {
  return fs.readFile(path.normalize(file_path), "utf-8");
}

async function writeFile({ file_path, content }) {
  await fs.writeFile(path.normalize(file_path), content, "utf-8");
  return "UPDATED";
}

const tools = {
  list_files: listFiles,
  read_file: readFile,
  write_file: writeFile,
};

/* ===========================
   TOOL DEFINITIONS
=========================== */

const toolConfig = [
  {
    functionDeclarations: [
      {
        name: "list_files",
        description: "List all source files ONCE",
        parameters: {
          type: Type.OBJECT,
          properties: { directory: { type: Type.STRING } },
          required: ["directory"],
        },
      },
      {
        name: "read_file",
        description: "Read a source file",
        parameters: {
          type: Type.OBJECT,
          properties: { file_path: { type: Type.STRING } },
          required: ["file_path"],
        },
      },
      {
        name: "write_file",
        description: "Write fixed code back",
        parameters: {
          type: Type.OBJECT,
          properties: {
            file_path: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["file_path", "content"],
        },
      },
    ],
  },
];

/* ===========================
   SYSTEM PROMPT (SHORT!)
=========================== */

const SYSTEM_PROMPT = `
You are an expert AI code reviewer.
Your task is to review and improve source code files.
Rules:
- Call list_files exactly once
- Read files one at a time
- ALWAYS call write_file for every file
- Add brief comments explaining changes
Fix the following:
- Bugs (logic errors, async issues, null/undefined)
- Security issues (hardcoded secrets, injections, unsafe APIs)
- Code quality (unused code, bad naming, complexity)
- HTML issues (doctype, accessibility, missing meta/alt)
- CSS issues (syntax errors, duplication, compatibility)
Process files sequentially and be concise.
After all files processed, return summary:


`;

/* ===========================
   MAIN AGENT
=========================== */

async function runAgent(rootDir, output, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  // STEP 1: List files once
  const files = await listFiles({ directory: rootDir });
  if (!Array.isArray(files) || files.length === 0) {
    output.appendLine("❌ No source files found");
    return;
  }

  let fixedCount = 0;

  for (const file of files) {
    output.appendLine(`🔍 Reviewing: ${file}`);

    const history = [
      {
        role: "user",
        parts: [{ text: `Review and fix this file: ${file}` }],
      },
    ];

    while (true) {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: history,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: toolConfig,
        },
      });

      if (result.functionCalls?.length) {
        for (const call of result.functionCalls) {
          const res = await tools[call.name](call.args);

          if (call.name === "write_file") {
            fixedCount++;
            output.appendLine(`✍ Fixed: ${call.args.file_path}`);
          }

          history.push({
            role: "model",
            parts: [{ functionCall: call }],
          });

          history.push({
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: { result: res },
                },
              },
            ],
          });
        }
      } else {
        output.appendLine(result.text);
        break;
      }
    }
  }

  output.appendLine(`
📊 CODE REVIEW COMPLETE
Total Files: ${files.length}
Files Fixed: ${fixedCount}
`);
}

/* ===========================
   VS CODE EXTENSION
=========================== */

function activate(context) {
  const output = vscode.window.createOutputChannel("AI Code Reviewer");

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codeReviewer.reviewCurrentFolder",
      async () => {
        const apiKey = vscode.workspace
          .getConfiguration("aiCodeReviewer")
          .get("apiKey");

        if (!apiKey) {
          vscode.window.showErrorMessage(
            "Please set Gemini API Key in settings"
          );
          return;
        }

        const folder = vscode.workspace.workspaceFolders?.[0];
        if (!folder) {
          vscode.window.showErrorMessage("No folder opened");
          return;
        }

        output.show();
        output.clear();
        output.appendLine("🚀 Starting AI Code Review...\n");

        try {
          await runAgent(folder.uri.fsPath, output, apiKey);
          vscode.window.showInformationMessage("Code Review Completed");
        } catch (e) {
          output.appendLine("❌ ERROR: " + e.message);
        }
      }
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };

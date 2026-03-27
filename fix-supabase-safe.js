const fs = require("fs");
const path = require("path");

const ROOT = "./";

/* folders to IGNORE */
const IGNORE_FOLDERS = ["functions", "api", "supabase", "edge"];

/* detect if file is server-side */
function isServerFile(content) {
  return content.includes("Deno.env") ||
         content.includes("createClient(") && content.includes("SERVICE_ROLE_KEY") ||
         content.includes("supabaseAdmin");
}

function processFile(filePath) {

  let content = fs.readFileSync(filePath, "utf8");

  // 🚫 skip server files
  if (isServerFile(content)) {
    console.log("⏭ Skipped (server file):", filePath);
    return;
  }

  if (content.includes("supabase.createClient(")) {

    // replace ONLY frontend client creation
    content = content.replace(
      /const supabaseClient\s*=\s*supabase\.createClient\([\s\S]*?\)/g,
      "const supabaseClient = window.supabaseClient"
    );

    content = content.replace(
      /let supabaseClient\s*=\s*supabase\.createClient\([\s\S]*?\)/g,
      "let supabaseClient = window.supabaseClient"
    );

    fs.writeFileSync(filePath, content);
    console.log("✅ Fixed:", filePath);
  }
}

function walk(dir) {

  if (IGNORE_FOLDERS.some(f => dir.includes(f))) return;

  fs.readdirSync(dir).forEach(file => {

    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } 
    else if (file.endsWith(".html") || file.endsWith(".js")) {
      processFile(fullPath);
    }

  });
}

walk(ROOT);

console.log("🎯 SAFE FIX COMPLETED");

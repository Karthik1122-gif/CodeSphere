const fs = require("fs");
const path = require("path");

const WORKSPACE = "c:\\Users\\banot\\OneDrive\\Desktop\\PROJECTS\\CodeSphere\\src";

// Helper to recursively list files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else {
      if (name.endsWith(".tsx") || name.endsWith(".ts") || name.endsWith(".css")) {
        fileList.push(name);
      }
    }
  }
  return fileList;
}

// 1. Update src/app/globals.css
const globalsCssPath = path.join(WORKSPACE, "app", "globals.css");
const newGlobalsCss = `@import "tailwindcss";

@theme {
  /* Brand Theme Colors (Four-Color Palette) */
  --color-brand-green: #FFA000;                  /* vibrant yellow/orange */
  --color-brand-green-dark: #7C521B;             /* brown/bronze */
  --color-brand-green-light: #FFA00030;          /* light yellow/orange transparent */
  --color-brand-green-extralight: #FFFAFE;       /* off-white base */
  --color-brand-green-medium: #7C521B;
  --color-brand-green-muted: #7C521B80;
  --color-brand-green-darkest: #000223;          /* very dark navy */
  --color-brand-green-dark-border: #7C521B;      /* bronze border */
  --color-ink-charcoal: #000223;
  --color-ink-black: #ffffff;
  --color-surface-white: #FFFAFE;
  --color-surface-offwhite: #FFFAFE;
  --color-accent-gold: #FFA000;
  --color-whatsapp-green: #FFA000;               /* map support bubble to amber */

  /* Override Tailwind defaults to prevent mixing external colors */
  --color-gray-50: #FFFAFE;
  --color-gray-100: #FFFAFE;
  --color-gray-200: #7C521B30;                   /* transparent brown for borders */
  --color-gray-250: #7C521B30;
  --color-gray-300: #7C521B50;
  --color-gray-400: #7C521B;
  --color-gray-500: #7C521B;
  --color-gray-650: #000223;
  --color-gray-700: #000223;
  --color-gray-800: #000223;
  --color-gray-900: #000223;

  --color-slate-100: #FFFAFE;
  --color-slate-200: #7C521B30;
  --color-slate-350: #7C521B50;
  --color-slate-500: #7C521B;

  --color-neutral-100: #FFFAFE;
  --color-neutral-200: #7C521B30;
  --color-neutral-300: #7C521B50;

  /* Typography Mapping */
  --font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
  --font-heading: var(--font-poppins), system-ui, -apple-system, sans-serif;
  
  /* Custom Animations */
  --animate-fade-in-up: fade-in-up 0.25s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Global Styles */
html,
body {
  font-family: var(--font-sans);
  background-color: var(--color-surface-offwhite);
  color: var(--color-ink-charcoal);
  margin: 0;
  padding: 0;
  scroll-behavior: smooth;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-ink-black);
  font-weight: 700;
}

/* Custom Utilities */
.text-brand {
  color: var(--color-brand-green);
}

.bg-brand {
  background-color: var(--color-brand-green);
}

.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus-ring:focus-visible {
  outline-color: var(--color-brand-green);
  box-shadow: 0 0 0 2px var(--color-surface-white), 0 0 0 4px var(--color-brand-green);
}
`;

fs.writeFileSync(globalsCssPath, newGlobalsCss, "utf8");
console.log("Updated globals.css");

// 2. Modify other files for colors and hydration mismatches
const files = getFiles(WORKSPACE);

for (const file of files) {
  if (file === globalsCssPath) continue;

  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Replace hardcoded arbitrary hex background & border colors to match our 4 colors
  const colorReplacements = [
    { from: "bg-[#1A1A1A]", to: "bg-[var(--color-brand-green-darkest)]" },
    { from: "bg-[#262626]", to: "bg-[var(--color-brand-green-darkest)]" },
    { from: "bg-[#F7F8F6]", to: "bg-surface-offwhite" },
    { from: "bg-[#F0F2EE]", to: "bg-surface-offwhite" },
    { from: "bg-[#FFF8E6]", to: "bg-[var(--color-brand-green-extralight)]" },
    { from: "bg-[#25D366]", to: "bg-brand" },
    { from: "bg-white", to: "bg-surface-white" },
    { from: "bg-[#FFF0F0]", to: "bg-surface-offwhite" },
    { from: "bg-[#FFF3CD]", to: "bg-surface-offwhite" },
    { from: "bg-[#FFF5F5]", to: "bg-surface-offwhite" },
    { from: "bg-red-50", to: "bg-surface-offwhite" },
    { from: "bg-red-600", to: "bg-brand-green-dark" },
    
    { from: "border-[#1A1A1A]", to: "border-[var(--color-brand-green-dark-border)]" },
    { from: "border-[#333333]", to: "border-[var(--color-brand-green-dark-border)]" },
    { from: "border-[#444444]", to: "border-[var(--color-brand-green-dark-border)]" },
    { from: "border-[#E07A5F]", to: "border-brand" },
    { from: "border-gray-200", to: "border-[var(--color-brand-green-dark-border)]/20" },
    { from: "border-gray-250", to: "border-[var(--color-brand-green-dark-border)]/20" },
    { from: "border-gray-300", to: "border-[var(--color-brand-green-dark-border)]/30" },
    { from: "border-[#E2E8F0]", to: "border-[var(--color-brand-green-dark-border)]/30" },

    { from: "text-[#E07A5F]", to: "text-brand" },
    { from: "text-[#D4A017]", to: "text-brand" },
    { from: "text-[#262626]", to: "text-ink-charcoal" },
    { from: "text-[#25D366]", to: "text-brand" },
    { from: "text-brand-green-dark", to: "text-brand-green-dark" },

    { from: "bg-[#E07A5F]", to: "bg-brand" },
    { from: "hover:bg-[#d0694e]", to: "hover:bg-[var(--color-brand-green-dark)]" },
    { from: "hover:bg-brand-green-dark", to: "hover:bg-[var(--color-brand-green-dark)]" },
  ];

  for (const rep of colorReplacements) {
    if (content.includes(rep.from)) {
      content = content.split(rep.from).join(rep.to);
      modified = true;
    }
  }

  // Add suppressHydrationWarning to Date expressions
  // Look for typical client/server mismatch Date formatting expressions and inject suppressHydrationWarning
  const datePatterns = [
    {
      find: "Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}",
      replace: "Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}",
      parentTag: "span",
    },
    {
      find: "{new Date(thr.lastMessageTime).toLocaleTimeString()}",
      replace: "{new Date(thr.lastMessageTime).toLocaleTimeString()}",
      parentTag: "span",
    },
    {
      find: "{new Date(msg.readAt ? msg.readAt : msg.createdAt).toLocaleTimeString()}",
      replace: "{new Date(msg.readAt ? msg.readAt : msg.createdAt).toLocaleTimeString()}",
      parentTag: "span",
    },
    {
      find: "{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}",
      replace: "{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}",
      parentTag: "span",
    },
    {
      find: "Last login: {new Date().toLocaleDateString()}",
      replace: "Last login: {new Date().toLocaleDateString()}",
      parentTag: "p",
    },
    {
      find: "Closes: {new Date(test.closesAt).toLocaleDateString()}",
      replace: "Closes: {new Date(test.closesAt).toLocaleDateString()}",
      parentTag: "span",
    },
    {
      find: "Deadline: {new Date(test.closesAt).toLocaleDateString()}",
      replace: "Deadline: {new Date(test.closesAt).toLocaleDateString()}",
      parentTag: "span",
    },
    {
      find: "{new Date(activeSubmission.submittedAt).toLocaleString()}",
      replace: "{new Date(activeSubmission.submittedAt).toLocaleString()}",
      parentTag: "span",
    },
    {
      find: "{new Date(t.opensAt).toLocaleDateString()}",
      replace: "{new Date(t.opensAt).toLocaleDateString()}",
      parentTag: "td",
    },
    {
      find: "{new Date(t.opensAt).toLocaleString()}",
      replace: "{new Date(t.opensAt).toLocaleString()}",
      parentTag: "td",
    },
    {
      find: "{new Date(t.closesAt).toLocaleString()}",
      replace: "{new Date(t.closesAt).toLocaleString()}",
      parentTag: "td",
    }
  ];

  for (const pat of datePatterns) {
    const escapedFind = pat.find;
    if (content.includes(escapedFind)) {
      if (escapedFind.includes("Last saved")) {
        content = content.replace(
          "Auto-save on · Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}",
          "Auto-save on · <span suppressHydrationWarning>Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>"
        );
      } else if (escapedFind.includes("thr.lastMessageTime")) {
        content = content.replace(
          "{new Date(thr.lastMessageTime).toLocaleTimeString()}",
          "<span suppressHydrationWarning>{new Date(thr.lastMessageTime).toLocaleTimeString()}</span>"
        );
      } else if (escapedFind.includes("msg.createdAt")) {
        content = content.replace(
          "<span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>",
          "<span suppressHydrationWarning>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>"
        );
      } else if (escapedFind.includes("Last login: {new Date().toLocaleDateString()}")) {
        content = content.replace(
          "Last login: {new Date().toLocaleDateString()}",
          "<span suppressHydrationWarning>Last login: {new Date().toLocaleDateString()}</span>"
        );
      } else if (escapedFind.includes("Closes: {new Date(test.closesAt).toLocaleDateString()}")) {
        content = content.replace(
          "Closes: {new Date(test.closesAt).toLocaleDateString()}",
          "<span suppressHydrationWarning>Closes: {new Date(test.closesAt).toLocaleDateString()}</span>"
        );
      } else if (escapedFind.includes("Deadline: {new Date(test.closesAt).toLocaleDateString()}")) {
        content = content.replace(
          "Deadline: {new Date(test.closesAt).toLocaleDateString()}",
          "<span suppressHydrationWarning>Deadline: {new Date(test.closesAt).toLocaleDateString()}</span>"
        );
      } else if (escapedFind.includes("activeSubmission.submittedAt")) {
        content = content.replace(
          "<span>{new Date(activeSubmission.submittedAt).toLocaleString()}</span>",
          "<span suppressHydrationWarning>{new Date(activeSubmission.submittedAt).toLocaleString()}</span>"
        );
      } else if (escapedFind.includes("t.opensAt).toLocaleDateString()")) {
        content = content.replace(
          `<td className="p-3 font-mono text-gray-500">{new Date(t.opensAt).toLocaleDateString()}</td>`,
          `<td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.opensAt).toLocaleDateString()}</td>`
        );
      } else if (escapedFind.includes("t.opensAt).toLocaleString()")) {
        content = content.replace(
          `<td className="p-3 font-mono text-gray-500">{new Date(t.opensAt).toLocaleString()}</td>`,
          `<td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.opensAt).toLocaleString()}</td>`
        );
      } else if (escapedFind.includes("t.closesAt).toLocaleString()")) {
        content = content.replace(
          `<td className="p-3 font-mono text-gray-500">{new Date(t.closesAt).toLocaleString()}</td>`,
          `<td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.closesAt).toLocaleString()}</td>`
        );
      }
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated theme/hydration in: ${file}`);
  }
}

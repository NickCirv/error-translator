#!/usr/bin/env node
'use strict';

// ─── Error Database ───────────────────────────────────────────────────────────

const ERROR_DB = [
  // Node.js / System
  {
    id: 'ENOENT',
    patterns: ['ENOENT', 'no such file or directory'],
    label: 'File Not Found',
    plain: "The file doesn't exist, fam. Check the path. Maybe you typo'd it.",
    fix: "Verify the file path. Run `ls` to check what's actually there. Common cause: wrong working directory or a typo.",
    confidence: 0.97,
    tags: ['node', 'system', 'filesystem'],
  },
  {
    id: 'EACCES',
    patterns: ['EACCES', 'permission denied'],
    label: 'Permission Denied',
    plain: "You don't have access to this file or port. System said nope.",
    fix: "Try `chmod 644 <file>` or `chmod +x <file>`. For port 80/443: use port 3000+ instead. If you must: `sudo` (carefully).",
    confidence: 0.95,
    tags: ['node', 'system', 'permissions'],
  },
  {
    id: 'EADDRINUSE',
    patterns: ['EADDRINUSE', 'address already in use'],
    label: 'Port Already In Use',
    plain: "That port is already taken. Something else is running there.",
    fix: "Find and kill it: `lsof -i :PORT` then `kill -9 <PID>`. Or just use a different port.",
    confidence: 0.99,
    tags: ['node', 'network', 'server'],
  },
  {
    id: 'ECONNREFUSED',
    patterns: ['ECONNREFUSED', 'connection refused'],
    label: 'Connection Refused',
    plain: "The server said no. It's either not running, crashed, or you've got the wrong address.",
    fix: "Check if the service is actually running. Verify host and port. If it's a DB, check the connection string.",
    confidence: 0.93,
    tags: ['node', 'network'],
  },
  {
    id: 'ENOMEM',
    patterns: ['ENOMEM', 'out of memory', 'allocation failed', 'javascript heap out of memory'],
    label: 'Out of Memory',
    plain: "Your machine ran out of memory. RIP.",
    fix: "Close some Chrome tabs (yes, all 47 of them). Or increase Node's heap: `NODE_OPTIONS=--max-old-space-size=4096 node script.js`",
    confidence: 0.91,
    tags: ['node', 'system', 'memory'],
  },
  {
    id: 'MODULE_NOT_FOUND',
    patterns: ['MODULE_NOT_FOUND', "cannot find module", "module not found"],
    label: 'Module Not Found',
    plain: "Node can't find that module. Did you `npm install`?",
    fix: "Run `npm install`. If it's a local file, check the relative path. If it's scoped (@org/pkg), make sure the full name is right.",
    confidence: 0.96,
    tags: ['node', 'modules'],
  },
  {
    id: 'ETIMEDOUT',
    patterns: ['ETIMEDOUT', 'connection timed out', 'etimedout'],
    label: 'Connection Timed Out',
    plain: "The connection hung and gave up. The other side isn't responding.",
    fix: "Check your network. If it's an external API, they might be down. Add a timeout + retry to your code.",
    confidence: 0.88,
    tags: ['node', 'network'],
  },
  {
    id: 'ECONNRESET',
    patterns: ['ECONNRESET', 'connection reset by peer', 'socket hang up'],
    label: 'Connection Reset',
    plain: "The other side slammed the door in your face mid-conversation.",
    fix: "Usually a server-side issue. Add retry logic. Check if the server has a keep-alive timeout shorter than your request.",
    confidence: 0.85,
    tags: ['node', 'network'],
  },
  {
    id: 'ENOTDIR',
    patterns: ['ENOTDIR', 'not a directory'],
    label: 'Not a Directory',
    plain: "You're treating a file like a folder. That path is a file, not a directory.",
    fix: "Check your path. You're probably one segment too deep — remove the last part of the path.",
    confidence: 0.92,
    tags: ['node', 'system', 'filesystem'],
  },
  {
    id: 'EEXIST',
    patterns: ['EEXIST', 'file already exists'],
    label: 'File Already Exists',
    plain: "That file already exists and you're trying to create it again.",
    fix: "Check before creating: use `fs.existsSync()`. Or use `{ flag: 'w' }` to overwrite intentionally.",
    confidence: 0.94,
    tags: ['node', 'system', 'filesystem'],
  },
  {
    id: 'EISDIR',
    patterns: ['EISDIR', 'illegal operation on a directory'],
    label: 'Is a Directory',
    plain: "You're trying to read/write a directory like it's a file. Bruv.",
    fix: "Your path points to a folder, not a file. Check the path — you're probably missing a filename at the end.",
    confidence: 0.93,
    tags: ['node', 'system', 'filesystem'],
  },

  // npm
  {
    id: 'ERESOLVE',
    patterns: ['ERESOLVE', 'could not resolve', 'peer dep', 'peer dependency'],
    label: 'Dependency Resolution Failed',
    plain: "npm can't figure out which version to install. Welcome to dependency hell.",
    fix: "Try `npm install --legacy-peer-deps`. If that fails, find the conflicting package and update it: `npm ls <package>`.",
    confidence: 0.89,
    tags: ['npm', 'dependencies'],
  },
  {
    id: 'NPM_E404',
    patterns: ['npm error 404', 'not found - 404', '404 not found'],
    label: 'Package Not Found on npm',
    plain: "That package doesn't exist on npm (or you typo'd the name).",
    fix: "Double-check the package name on npmjs.com. If it's scoped (@org/pkg), make sure you're logged into that registry.",
    confidence: 0.95,
    tags: ['npm'],
  },
  {
    id: 'EPERM',
    patterns: ['EPERM', 'operation not permitted'],
    label: 'Operation Not Permitted',
    plain: "Windows is holding the file hostage. Or your user doesn't have permission.",
    fix: "Close VS Code / any editors. Delete node_modules and package-lock.json, then reinstall. On Mac/Linux: check file ownership.",
    confidence: 0.87,
    tags: ['npm', 'system', 'windows'],
  },
  {
    id: 'EINTEGRITY',
    patterns: ['EINTEGRITY', 'integrity check failed', 'sha512'],
    label: 'Package Integrity Check Failed',
    plain: "The package you downloaded doesn't match what npm expected. Corrupted download or cache.",
    fix: "Clear the npm cache: `npm cache clean --force`, then reinstall.",
    confidence: 0.92,
    tags: ['npm'],
  },
  {
    id: 'ENOLOCK',
    patterns: ['ENOLOCK', 'missing lockfile'],
    label: 'Missing Lockfile',
    plain: "No package-lock.json found. npm is flying blind.",
    fix: "Run `npm install` to generate one. Commit the lockfile — it keeps your team on the same versions.",
    confidence: 0.90,
    tags: ['npm'],
  },

  // Git
  {
    id: 'GIT_NOT_REPO',
    patterns: ['not a git repository', 'fatal: not a git'],
    label: 'Not a Git Repo',
    plain: "You're not inside a git repository. Git has no idea where to look.",
    fix: "Run `git init` if starting fresh. Or `cd` into the right directory first. Check with `pwd`.",
    confidence: 0.99,
    tags: ['git'],
  },
  {
    id: 'GIT_CONFLICT',
    patterns: ['CONFLICT (content)', 'merge conflict', 'automatic merge failed'],
    label: 'Merge Conflict',
    plain: "Two people changed the same lines. Git can't decide who wins — that's your job.",
    fix: "Open the conflicted files. Find `<<<<<<< HEAD` markers. Pick the right version, delete the markers, then `git add . && git commit`.",
    confidence: 0.96,
    tags: ['git'],
  },
  {
    id: 'GIT_REJECTED',
    patterns: ['rejected', 'non-fast-forward', 'failed to push'],
    label: 'Push Rejected',
    plain: "Remote has commits you don't have locally. You're trying to overwrite history git doesn't want overwritten.",
    fix: "Run `git pull --rebase origin <branch>` first, resolve any conflicts, then push again.",
    confidence: 0.90,
    tags: ['git'],
  },
  {
    id: 'GIT_DETACHED',
    patterns: ['detached HEAD', 'HEAD detached'],
    label: 'Detached HEAD State',
    plain: "You checked out a specific commit instead of a branch. Changes made here will float away.",
    fix: "Create a branch to save your work: `git checkout -b my-branch`. Or just `git checkout main` to get back.",
    confidence: 0.97,
    tags: ['git'],
  },
  {
    id: 'GIT_UNTRACKED',
    patterns: ['nothing to commit', 'nothing added to commit'],
    label: 'Nothing to Commit',
    plain: "Git sees no changes. Either you already committed, or the files aren't staged.",
    fix: "Check what's changed: `git status`. Stage files: `git add <file>`. Or you already committed — check `git log`.",
    confidence: 0.88,
    tags: ['git'],
  },
  {
    id: 'GIT_STASH_CONFLICT',
    patterns: ['stash conflict', 'cannot apply stash'],
    label: 'Stash Conflict',
    plain: "Your stashed changes conflict with what's on your current branch.",
    fix: "Run `git stash show -p | git apply` and resolve manually. Or `git checkout stash -- <file>` for specific files.",
    confidence: 0.83,
    tags: ['git'],
  },

  // JavaScript Runtime
  {
    id: 'TYPEERROR_UNDEFINED',
    patterns: ['cannot read properties of undefined', 'cannot read property', "is not a function", 'typeerror: undefined'],
    label: 'TypeError: Property of Undefined',
    plain: "You're trying to access .something on undefined. That variable doesn't have what you think it has.",
    fix: "Add an optional chain: `obj?.property`. Or check first: `if (obj && obj.property)`. Log the variable to see what it actually is.",
    confidence: 0.91,
    tags: ['javascript', 'runtime'],
  },
  {
    id: 'TYPEERROR_NULL',
    patterns: ['cannot read properties of null', 'cannot read property.*null', 'null is not an object'],
    label: 'TypeError: Property of Null',
    plain: "Same as undefined but worse — you got null back when you expected an object.",
    fix: "Use optional chaining: `obj?.property`. Check if your API/DB call is actually returning data.",
    confidence: 0.91,
    tags: ['javascript', 'runtime'],
  },
  {
    id: 'RANGEERROR_STACK',
    patterns: ['maximum call stack', 'rangeerror: maximum', 'stack overflow'],
    label: 'Stack Overflow (Infinite Recursion)',
    plain: "Your function is calling itself forever. It'll never stop without a base case.",
    fix: "Check your recursive function — something isn't stopping the loop. Add a base condition that returns without recursing.",
    confidence: 0.97,
    tags: ['javascript', 'runtime'],
  },
  {
    id: 'SYNTAXERROR',
    patterns: ['syntaxerror', 'unexpected token', 'unexpected end of input', 'invalid or unexpected token'],
    label: 'Syntax Error',
    plain: "Your code has a typo. Missing bracket, comma, or quote somewhere.",
    fix: "Check the line number in the error. Look for missing `}`, `)`, `]`, or `,`. Your editor's linter would've caught this.",
    confidence: 0.93,
    tags: ['javascript', 'runtime'],
  },
  {
    id: 'REFERENCEERROR',
    patterns: ['referenceerror', 'is not defined'],
    label: 'ReferenceError: Not Defined',
    plain: "You're using a variable that doesn't exist yet (or in this scope).",
    fix: "Check: did you spell it right? Is it declared before use? Is it in scope? Maybe you forgot to import it.",
    confidence: 0.94,
    tags: ['javascript', 'runtime'],
  },
  {
    id: 'UNHANDLED_PROMISE',
    patterns: ['unhandledpromiserejection', 'unhandled promise rejection'],
    label: 'Unhandled Promise Rejection',
    plain: "An async operation threw an error and nothing caught it. Silent failure is loud failure.",
    fix: "Add `.catch()` to the promise chain, or wrap in `try/catch` if using `async/await`. Also add a global handler: `process.on('unhandledRejection', ...)`.",
    confidence: 0.95,
    tags: ['javascript', 'runtime', 'async'],
  },

  // Python
  {
    id: 'PYTHON_INDENT',
    patterns: ['IndentationError', 'indentationerror', 'unexpected indent', 'expected an indented block'],
    label: 'Python IndentationError',
    plain: "Your spaces and tabs are mixed up or just plain wrong.",
    fix: "Use spaces only (4 per level). No tabs. In VS Code: Format Document. Run `python -m py_compile <file>` to validate.",
    confidence: 0.96,
    tags: ['python'],
  },
  {
    id: 'PYTHON_MODULE',
    patterns: ['ModuleNotFoundError', 'modulenotfounderror', 'No module named'],
    label: 'Python Module Not Found',
    plain: "Python can't find that package. It's not installed in this environment.",
    fix: "Run `pip install <package>`. If using a venv, activate it first: `source venv/bin/activate`. Check you're on the right Python.",
    confidence: 0.97,
    tags: ['python'],
  },
  {
    id: 'PYTHON_KEYERROR',
    patterns: ['KeyError', 'keyerror'],
    label: 'Python KeyError',
    plain: "That key doesn't exist in the dictionary. You're asking for something that isn't there.",
    fix: "Use `.get()` to avoid the crash: `d.get('key', default)`. Or check first: `if 'key' in d:`. Print the dict to see what keys exist.",
    confidence: 0.92,
    tags: ['python'],
  },
  {
    id: 'PYTHON_ATTRIBUTE',
    patterns: ['AttributeError', 'attributeerror', 'has no attribute'],
    label: 'Python AttributeError',
    plain: "That object doesn't have that method or property. You're calling something that doesn't exist on it.",
    fix: "Print `type(obj)` and `dir(obj)` to see what it actually is and what's available on it.",
    confidence: 0.91,
    tags: ['python'],
  },

  // Docker
  {
    id: 'DOCKER_NO_SPACE',
    patterns: ['no space left on device', 'no space left'],
    label: 'Docker: No Disk Space',
    plain: "Docker ate all your disk space. It hoards images and containers like a digital dragon.",
    fix: "Run `docker system prune -a` to nuke everything unused. Check disk: `df -h`. Nuclear option: `docker system prune -a --volumes`.",
    confidence: 0.90,
    tags: ['docker', 'system'],
  },
  {
    id: 'DOCKER_PORT',
    patterns: ['port is already allocated', 'bind.*address already in use', 'port.*already in use'],
    label: 'Docker: Port Already Allocated',
    plain: "Another container (or process) is already using that port.",
    fix: "Find the culprit: `docker ps` for containers, `lsof -i :PORT` for processes. Stop it or map to a different host port.",
    confidence: 0.93,
    tags: ['docker', 'network'],
  },
  {
    id: 'DOCKER_NOT_FOUND',
    patterns: ['cannot connect to the docker daemon', 'docker daemon is not running', 'is the docker daemon running'],
    label: 'Docker Daemon Not Running',
    plain: "Docker Desktop isn't running. The engine is off.",
    fix: "Open Docker Desktop and wait for it to fully start. Or: `sudo systemctl start docker` on Linux.",
    confidence: 0.98,
    tags: ['docker'],
  },
  {
    id: 'DOCKER_IMAGE_NOT_FOUND',
    patterns: ['unable to find image', 'pull access denied', 'image not found', 'repository does not exist'],
    label: 'Docker Image Not Found',
    plain: "Docker can't find that image locally or on Docker Hub.",
    fix: "Check the image name and tag: `docker search <name>`. If it's private, `docker login` first. Check for typos in the tag.",
    confidence: 0.91,
    tags: ['docker'],
  },

  // TypeScript
  {
    id: 'TS_TYPE_ERROR',
    patterns: ['type.*is not assignable to type', 'ts(2322)', 'ts(2345)'],
    label: 'TypeScript Type Mismatch',
    plain: "You're passing the wrong type. TypeScript caught it before it could explode at runtime.",
    fix: "Check what type the function expects vs what you're passing. If you're sure it's fine: `as YourType` (last resort). Better: fix the type.",
    confidence: 0.90,
    tags: ['typescript'],
  },
  {
    id: 'TS_PROPERTY_NOT_EXIST',
    patterns: ['property.*does not exist on type', 'ts(2339)'],
    label: 'TypeScript Property Does Not Exist',
    plain: "You're accessing a property TypeScript doesn't know about on that type.",
    fix: "Add it to the interface/type definition. Or use optional: `property?: string`. Check you're accessing the right object.",
    confidence: 0.91,
    tags: ['typescript'],
  },
  {
    id: 'TS_IMPLICIT_ANY',
    patterns: ["implicitly has an 'any' type", 'ts(7006)', 'ts(7031)'],
    label: 'TypeScript Implicit Any',
    plain: "You forgot to type something and TypeScript is side-eyeing you.",
    fix: "Add an explicit type: `function foo(x: string)`. Or if you genuinely don't know: `x: unknown` (safer than `any`).",
    confidence: 0.93,
    tags: ['typescript'],
  },

  // Build tools
  {
    id: 'WEBPACK_LOADERS',
    patterns: ["you may need an appropriate loader", 'module parse failed'],
    label: 'Webpack Missing Loader',
    plain: "Webpack doesn't know how to handle that file type. It needs a loader for it.",
    fix: "Install the right loader: `babel-loader` for JS, `ts-loader` for TS, `css-loader` for CSS, `file-loader` for images. Add it to webpack.config.js.",
    confidence: 0.88,
    tags: ['webpack', 'build'],
  },
  {
    id: 'CORS',
    patterns: ['CORS', 'cross-origin', 'access-control-allow-origin', 'has been blocked by cors policy'],
    label: 'CORS Error',
    plain: "Your browser is blocking the request because the server didn't say it's OK to receive it from your origin.",
    fix: "On the SERVER: add CORS headers. In Express: `app.use(cors())`. In production: set `Access-Control-Allow-Origin` to your specific domain, not `*`.",
    confidence: 0.92,
    tags: ['http', 'browser', 'server'],
  },
  {
    id: 'SSL_CERT',
    patterns: ['certificate has expired', 'ssl certificate', 'certificate verify failed', 'ERR_CERT'],
    label: 'SSL Certificate Error',
    plain: "The SSL certificate is expired, self-signed, or just wrong. Your connection can't be verified as secure.",
    fix: "If it's your server: renew the cert (Let's Encrypt: `certbot renew`). If dev: `NODE_TLS_REJECT_UNAUTHORIZED=0` (NEVER in prod). If someone else's site: they messed up.",
    confidence: 0.89,
    tags: ['ssl', 'network', 'http'],
  },
];

// ─── Matching Engine ───────────────────────────────────────────────────────────

function normalise(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreEntry(entry, input) {
  const norm = normalise(input);
  let score = 0;
  let matched = [];

  for (const pattern of entry.patterns) {
    const p = pattern.toLowerCase();
    if (norm.includes(p)) {
      score += p.length > 10 ? 3 : 2; // longer pattern = stronger signal
      matched.push(pattern);
    }
  }

  return { score, matched };
}

function findBestMatch(input) {
  let best = null;
  let bestScore = 0;

  for (const entry of ERROR_DB) {
    const { score, matched } = scoreEntry(entry, input);
    if (score > bestScore) {
      bestScore = score;
      best = { entry, matched };
    }
  }

  return bestScore > 0 ? { ...best, rawScore: bestScore } : null;
}

// ─── Output ───────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE   = '\x1b[34m';
const CYAN   = '\x1b[36m';
const WHITE  = '\x1b[37m';
const GREY   = '\x1b[90m';

function confidenceBar(score) {
  const pct = Math.round(score * 100);
  const filled = Math.round(score * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  const color = pct >= 90 ? GREEN : pct >= 75 ? YELLOW : RED;
  return `${color}${bar}${RESET} ${BOLD}${pct}%${RESET}`;
}

function confidenceLabel(score) {
  if (score >= 0.90) return `${GREEN}High confidence${RESET}`;
  if (score >= 0.75) return `${YELLOW}Medium confidence${RESET}`;
  return `${RED}Low confidence — might not be exact${RESET}`;
}

function printResult(match, input, verbose) {
  const { entry, matched } = match;
  const isTTY = process.stdout.isTTY;

  // Title block
  process.stdout.write('\n');
  process.stdout.write(`${BOLD}${CYAN}[${entry.id}]${RESET} ${BOLD}${WHITE}${entry.label}${RESET}\n`);
  process.stdout.write(`${DIM}${'─'.repeat(52)}${RESET}\n`);

  // Plain English
  process.stdout.write(`\n${BOLD}What's happening:${RESET}\n`);
  process.stdout.write(`  ${entry.plain}\n`);

  // Fix
  process.stdout.write(`\n${BOLD}${GREEN}Fix:${RESET}\n`);
  process.stdout.write(`  ${entry.fix}\n`);

  // Confidence
  process.stdout.write(`\n${BOLD}Confidence:${RESET} ${confidenceBar(entry.confidence)}  ${confidenceLabel(entry.confidence)}\n`);

  if (verbose) {
    process.stdout.write(`\n${DIM}${'─'.repeat(52)}${RESET}\n`);
    process.stdout.write(`${BOLD}${GREY}Verbose info:${RESET}\n`);
    process.stdout.write(`  ${GREY}Error ID:${RESET}       ${entry.id}\n`);
    process.stdout.write(`  ${GREY}Tags:${RESET}           ${entry.tags.join(', ')}\n`);
    process.stdout.write(`  ${GREY}Matched on:${RESET}     ${matched.join(' + ')}\n`);
    process.stdout.write(`  ${GREY}Raw score:${RESET}      ${match.rawScore}\n`);
    process.stdout.write(`  ${GREY}DB entries:${RESET}     ${ERROR_DB.length}\n`);

    // Show the chunk of input that triggered the match
    const norm = normalise(input);
    const snippet = norm.length > 120 ? norm.slice(0, 120) + '...' : norm;
    process.stdout.write(`  ${GREY}Input:${RESET}          ${snippet}\n`);
  }

  process.stdout.write('\n');
}

function printNoMatch(input) {
  process.stdout.write('\n');
  process.stdout.write(`${BOLD}${YELLOW}No match found${RESET}\n`);
  process.stdout.write(`${DIM}${'─'.repeat(52)}${RESET}\n`);
  process.stdout.write(`  Couldn't identify a known error pattern in that input.\n`);
  process.stdout.write(`  Try pasting the full error message — more context helps.\n`);
  process.stdout.write(`\n  ${GREY}If you think this should match, open an issue:${RESET}\n`);
  process.stdout.write(`  ${BLUE}https://github.com/NickCirv/error-translator${RESET}\n`);
  process.stdout.write('\n');
}

function printHelp() {
  process.stdout.write(`
${BOLD}error-translator${RESET} — Translate cryptic errors into plain English

${BOLD}Usage:${RESET}
  npx error-translator "ENOENT: no such file or directory"
  npm install 2>&1 | npx error-translator
  cat error.log | npx error-translator --verbose

${BOLD}Flags:${RESET}
  --verbose, -v   Show matched patterns, tags, and input snippet
  --help, -h      Show this help

${BOLD}Examples:${RESET}
  ${GREY}$ npx error-translator "EADDRINUSE: address already in use :::3000"${RESET}
  ${GREY}$ docker build . 2>&1 | npx error-translator${RESET}
  ${GREY}$ npx error-translator "TypeError: Cannot read properties of undefined"${RESET}

${BOLD}Database:${RESET} ${ERROR_DB.length} error patterns across Node.js, npm, Git, Python, Docker, TypeScript

${BOLD}You might also like:${RESET}
  ${BLUE}https://github.com/NickCirv${RESET}
`);
}

// ─── CLI Entry ────────────────────────────────────────────────────────────────

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data.trim()));
    // If nothing comes within 200ms (not a pipe), resolve empty
    setTimeout(() => resolve(data.trim()), 200);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    printHelp();
    process.exit(0);
  }

  // Collect positional args (not flags)
  const positional = args.filter(a => !a.startsWith('-'));

  let input = '';

  if (positional.length > 0) {
    input = positional.join(' ');
  } else if (!process.stdin.isTTY) {
    // Pipe mode
    input = await readStdin();
  } else {
    printHelp();
    process.exit(0);
  }

  if (!input) {
    process.stderr.write('No input provided.\n');
    process.exit(1);
  }

  const match = findBestMatch(input);

  if (match) {
    printResult(match, input, verbose);
  } else {
    printNoMatch(input);
  }
}

main().catch((err) => {
  process.stderr.write(`error-translator crashed: ${err.message}\n`);
  process.exit(1);
});

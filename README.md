# error-translator

[![npm version](https://img.shields.io/npm/v/error-translator.svg)](https://www.npmjs.com/package/error-translator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](https://www.npmjs.com/package/error-translator)

```
 ____  ____  ____  __  ____     ____  ____   __   __ _  ____  __      __  ____  __  ____
(  __)(  _ \(  _ \(  )(  _ \   (_  _)(  _ \ / _\ (  ( \/ ___)(  )    / _\(_  _)/  \(  _ \
 ) _)  )   / )   / )(  ) _ <    )(   )   //    \/    /\___ \ )(__   /    \ )( (  O ))   /
(____)(__)\_)(__)(_)(__)____/   (__) (__\_)\_/\_/\_)__)(____/(____) \_/\_/(__) \__/(__)\_)
```

Stop googling cryptic error codes. Get the plain English + the actual fix.

---

## Install & Use

```bash
# One-off (no install needed)
npx error-translator "ENOENT: no such file or directory"

# Pipe mode
npm install 2>&1 | npx error-translator

# With verbose output
npx error-translator "TypeError: Cannot read properties of undefined" --verbose

# Install globally
npm install -g error-translator
error-translator "EADDRINUSE: address already in use :::3000"
```

---

## Example Translations

### ENOENT
```
$ npx error-translator "ENOENT: no such file or directory, open './config.json'"

[ENOENT] File Not Found
────────────────────────────────────────────────────────
What's happening:
  The file doesn't exist, fam. Check the path. Maybe you typo'd it.

Fix:
  Verify the file path. Run `ls` to check what's actually there.
  Common cause: wrong working directory or a typo.

Confidence: ██████████ 97%  High confidence
```

### Port Already In Use
```
$ npx error-translator "EADDRINUSE: address already in use :::3000"

[EADDRINUSE] Port Already In Use
────────────────────────────────────────────────────────
What's happening:
  That port is already taken. Something else is running there.

Fix:
  Find and kill it: `lsof -i :3000` then `kill -9 <PID>`.
  Or just use a different port.

Confidence: ██████████ 99%  High confidence
```

### Merge Conflict
```
$ npx error-translator "CONFLICT (content): Merge conflict in src/app.js"

[GIT_CONFLICT] Merge Conflict
────────────────────────────────────────────────────────
What's happening:
  Two people changed the same lines. Git can't decide who wins — that's your job.

Fix:
  Open the conflicted files. Find `<<<<<<< HEAD` markers.
  Pick the right version, delete the markers, then `git add . && git commit`.

Confidence: ██████████ 96%  High confidence
```

### Pipe from a real command
```bash
docker build . 2>&1 | npx error-translator --verbose
npm install 2>&1 | npx error-translator
python app.py 2>&1 | npx error-translator
```

---

## Error Database

42 error patterns across:

| Category    | Errors Covered |
|-------------|----------------|
| Node.js     | ENOENT, EACCES, EADDRINUSE, ECONNREFUSED, ENOMEM, MODULE_NOT_FOUND, ETIMEDOUT, ECONNRESET, ENOTDIR, EEXIST, EISDIR |
| npm         | ERESOLVE, E404, EPERM, EINTEGRITY, ENOLOCK |
| Git         | not-a-repo, merge conflicts, push rejected, detached HEAD, stash conflict |
| JavaScript  | TypeError (undefined/null), RangeError (stack overflow), SyntaxError, ReferenceError, Unhandled Promise |
| Python      | IndentationError, ModuleNotFoundError, KeyError, AttributeError |
| Docker      | no space left, port allocated, daemon not running, image not found |
| TypeScript  | type mismatch, property not exist, implicit any |
| Other       | CORS, SSL/TLS, Webpack loader |

---

## Flags

| Flag | Description |
|------|-------------|
| `--verbose` / `-v` | Show matched patterns, tags, raw score, input snippet |
| `--help` / `-h` | Show help |

---

## Zero Dependencies

Single `index.js` with a shebang. No `node_modules`. Works on Node 14+.

---

## Contributing

Missing an error? Open an issue or PR — the database is just a plain array at the top of `index.js`.

---

## You Might Also Like

Built by [NickCirv](https://github.com/NickCirv) — check out the other tools.

MIT License

---

If this made you mass-exhale through your nose, mass-hit that star button.

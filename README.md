<div align="center">

# error-translator

**Stop googling cryptic error codes — get the plain English explanation and the actual fix.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?labelColor=0B0A09)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?labelColor=0B0A09)](https://github.com/NickCirv/error-translator/blob/main/package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/error-translator "your error message"
```

## Usage

```bash
# Pass an error string directly
npx github:NickCirv/error-translator "ENOENT: no such file or directory"

# Pipe from a real command
npm install 2>&1 | npx github:NickCirv/error-translator

# Verbose output — shows matched patterns, tags, raw score
npx github:NickCirv/error-translator "EADDRINUSE: address already in use :::3000" --verbose
```

| Flag | Description |
|------|-------------|
| `--verbose` / `-v` | Show matched patterns, tags, raw score, input snippet |
| `--help` / `-h` | Show help |

## What it does

Matches your error text against a database of 42 known patterns across Node.js, npm, Git, JavaScript, Python, Docker, TypeScript, and Webpack. For each match it prints a plain-English explanation, a concrete fix, and a confidence score. Works as a direct argument or via stdin pipe — useful for filtering the output of `docker build`, `npm install`, `python app.py`, and similar.

---
<sub>Zero dependencies · Node ≥14 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>

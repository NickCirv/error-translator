# error-translator — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `d21a91ed85837268c65345000da91c71eb374363`. Commands are source-inspected; no execution results are asserted.

## Workflow

Accepts an argument or piped error text, scores matches against a local pattern catalogue, and prints an explanation with suggested next steps. --verbose includes matching details and an input excerpt.

No model service is used by the inspected implementation. Remove secrets before sharing verbose output.

```bash
node index.js "ECONNREFUSED 127.0.0.1:3000"
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `TEXT` | Supply an error string or use stdin |
| `--verbose` | Include match details and an input excerpt |
| `--help` | Show invocation help |

## Interpretation and side effects

Suggestions are static advice and can include destructive commands such as Docker pruning. Read them in context rather than executing them blindly. The match confidence is a heuristic score, not a validated probability.

## Implementation reference

- [package.json](https://github.com/NickCirv/error-translator/blob/d21a91ed85837268c65345000da91c71eb374363/package.json)
- [index.js](https://github.com/NickCirv/error-translator/blob/d21a91ed85837268c65345000da91c71eb374363/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/error-translator/blob/d21a91ed85837268c65345000da91c71eb374363/test/smoke.test.js)

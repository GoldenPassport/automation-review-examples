# automation-review-examples

Runnable, hands-on companion code for the **Automation Review** series on [goldenpassport.blog](https://goldenpassport.blog/blog).

Each review on the blog has a hands-on demo tab that walks through building something with the tool under review. The runnable, final-state version of each demo lives here, one folder per review.

## What is in the repo

| Folder | Review | What it is | Status |
| --- | --- | --- | --- |
| [`langgraph-triage-demo-answer/`](./langgraph-triage-demo-answer) | [Automation Review: LangGraph](https://goldenpassport.blog/blog/automation-review-langgraph) | CLI version, mock model calls, Steps 1–8 | Live |
| [`langgraph-triage-demo-ui-answer/`](./langgraph-triage-demo-ui-answer) | [Automation Review: LangGraph](https://goldenpassport.blog/blog/automation-review-langgraph) | React + Vite UI, real Ollama model calls, Step 9 | Live |

More folders will land here as the review series grows.

## How the folders are named

- `*-demo-answer/`: the final-state working code for a follow-along demo. If you tried the tutorial on the blog and got stuck, clone this folder and diff against your own copy.
- `*-template/`: an empty starting scaffold for a tutorial. (Not yet populated.)

## Run any project

Each project is a self-contained Node / TypeScript app with its own `package.json`. From the project folder:

```bash
pnpm install
pnpm dev
```

See the project's own README for what it does and expected output.

## Why a monorepo

Each review's demo runs on a different stack, so each lives in its own folder with its own `package.json`. Keeping them in one repo makes:

- The companion-code link on every blog post stable (the repo URL never changes; the folder per review is appended)
- CI cheap to set up once and reuse across demos
- Cross-references between reviews easy when one demo builds on another's primitives

## License

MIT.

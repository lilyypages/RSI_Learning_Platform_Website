<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Server Start

`npx next start` (or `next start`) resolves the `next` binary from the parent `RSI_Learning_Platform_Website` workspace and changes CWD there, causing it to serve from the wrong `.next` directory. Always use:

```bash
bash -c 'cd /home/archian/RSI_IAN && node node_modules/next/dist/bin/next start -p 3001'
```

## Build

```bash
npx next build
```

# Chrome Extension

Developed using [Vite + React](https://crxjs.dev/vite-plugin/).

## Development

Start the development server locally:

```bash
npm run dev
```

Open Chrome and go to `chrome://extensions/` and click on `Load unpacked` and select the `dist` folder.

HMR is enabled, so you can edit the files in the `src` folder and the extension will be reloaded automatically.

> [!NOTE]
> If you make changes to the `manifest.json`, you need to restart the development server and refresh the extension in Chrome.

Run tests with:

```bash
npm test
```

Format your code with:

```bash
npm run format
```

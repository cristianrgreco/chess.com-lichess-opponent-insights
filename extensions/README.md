# How to release

1. Update the version in `manifest.json`.
2. Build the app `npm run build`.
3. Navigate into the dist dir, e.g `chrome/dist`.
4. Create an archive out of the contents.
5. Rename the archive as `release-{browser}-{version}.zip`.
6. `git tag release-{browser}-{version} && git push --tags`
7. Create a new release on GitHub and attach the archive.
8. Upload the new package to the Chrome Web Store Developer dashboard.
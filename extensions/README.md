# How to release

1. Update the version in `manifest.json`.
2. Navigate into the browser dir, e.g `chrome`.
3. Create an archive out of the contents.
4. Rename the archive as `release-{browser}-{version}.zip`.
5. `git tag release-{browser}-{version} && git push --tags`
6. Create a new release on GitHub and attach the archive.
7. Upload the new package to the Chrome Web Store Developer dashboard.
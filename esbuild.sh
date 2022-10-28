npx esbuild ./src/extension.ts \
  --external:vscode \
    --external:"@tokencss/postcss" \
  --format=cjs \
  --platform=node \
  --target=node16 \
  --outfile=out/extension.js \
  --bundle --minify --define:process.env.NODE_ENV='"production"'

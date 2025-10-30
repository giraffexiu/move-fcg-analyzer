#!/bin/bash
set -e

echo "Building TypeScript indexer..."
npm run build:indexer

echo "Copying dist and build to package..."
rm -rf move_fcg_analyzer/dist move_fcg_analyzer/build
cp -r dist move_fcg_analyzer/
mkdir -p move_fcg_analyzer/build/Release
cp build/Release/tree_sitter_move_binding.node move_fcg_analyzer/build/Release/

echo "Package prepared successfully!"

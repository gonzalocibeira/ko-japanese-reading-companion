# Bundled vision runtime

Kō packages the original Cactus 4.0.0 JavaScript loader and WebAssembly runtime from the [pinned Cactus release](https://huggingface.co/Cactus-Compute/cactus/tree/1a028f5a3972b67dd8d8752f882113d475e7ec4c/releases/4.0.0) with the [2-bit Mirage weights](https://huggingface.co/Cactus-Compute/mirage/blob/76c1e9e/mirage.cact). Both are distributed under Apache 2.0. The build checks the artifacts against the upstream SHA-256 values in `scripts/build.mjs`. Inference loads bundled files and runs in an extension worker.

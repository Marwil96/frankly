import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/frankly-widget.min.js",
    format: "iife",
    name: "FranklyWidget",
  },
  plugins: [
    nodeResolve(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
  ],
};

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import path from "path";

const production = process.env.production;

const SOURCE = {};

SOURCE.DIRECTORY = path.join(__dirname, "src");
SOURCE.FILE = path.join(SOURCE.DIRECTORY, "index.ts");

const DIST = {};

DIST.DIRECTORY = path.join(__dirname, "dist");
DIST.FILE = path.join(DIST.DIRECTORY, "index.js");


export default {
  input: SOURCE.FILE,
  output: [
    {
      file: DIST.FILE,
      format: "cjs",
      exports: "auto"
    }
  ],
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript({
      typescript: require("typescript")
    }),
    production && terser()
  ]
}
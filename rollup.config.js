import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import path from "path";
import fs from 'fs';

const banner = `/*******************************************************************************\n${fs.readFileSync(path.join(__dirname, "LICENSE"))}\n*******************************************************************************/`;

const SOURCE = {};

SOURCE.DIRECTORY = path.join(__dirname, "src");
SOURCE.FILE = path.join(SOURCE.DIRECTORY, "index.ts");

const DIST = {};

DIST.DIRECTORY = path.join(__dirname, "dist");
DIST.CJS = path.join(DIST.DIRECTORY, "index.cjs.js");
DIST.ESM = path.join(DIST.DIRECTORY, "index.esm.js");


export default {
  input: SOURCE.FILE,
  output: [
    {
      file: DIST.CJS,
      format: "cjs",
      exports: "auto",
      banner: banner
    },
    {
      file: DIST.ESM,
      format: "esm",
      banner: banner
    }
  ],
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript({
      typescript: require("typescript")
    })
  ]
}
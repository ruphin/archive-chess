import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "webrtc.js",
  output: {
    file: "dist/out.js",
    format: "es",
  },
  plugins: [nodeResolve()],
};

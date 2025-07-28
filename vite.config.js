import { defineConfig } from "vite";
import stringPlugin from "vite-plugin-string";

export default defineConfig({
  root: ".",
  server: {
    host: true,
  },
  plugins: [
    stringPlugin({
      include: ["**/*.glsl", "**/*.frag", "**/*.vert"],
    }),
  ],
});

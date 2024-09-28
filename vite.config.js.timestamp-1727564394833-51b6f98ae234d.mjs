// vite.config.js
import { svelte } from 'file:///D:/Faey/ethereal-plane/node_modules/@sveltejs/vite-plugin-svelte/src/index.js';
import preprocess from 'file:///D:/Faey/ethereal-plane/node_modules/svelte-preprocess/dist/index.js';
import {
  postcssConfig,
  terserConfig
} from 'file:///D:/Faey/ethereal-plane/node_modules/@typhonjs-fvtt/runtime/.rollup/remote/index.js';
import { visualizer } from 'file:///D:/Faey/ethereal-plane/node_modules/rollup-plugin-visualizer/dist/plugin/index.js';
import { transform } from 'file:///D:/Faey/ethereal-plane/node_modules/esbuild/lib/main.js';

var s_PACKAGE_ID = 'modules/ethereal-plane';
var s_SVELTE_HASH_ID = 'ethpla';
var s_TERSER = false;
var s_SOURCEMAPS = true;
var s_MINIFY = true;
var vite_config_default = () => {
  return {
    root: 'src/',
    // Source location / esbuild root.
    base: `/${s_PACKAGE_ID}/`,
    // Base module path that 30001 / served dev directory.
    publicDir: '../public',
    // No public resources to copy.
    cacheDir: '../.vite-cache',
    // Relative from root directory.
    resolve: { conditions: ['import', 'browser'] },
    esbuild: {
      target: ['es2022']
    },
    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({ compress: s_TERSER, sourceMap: s_SOURCEMAPS })
    },
    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry redirects requests under the module path for `style.css` and following standard static
    // directories: `assets`, `lang`, and `packs` and will pull those resources from the main Foundry / 30000 server.
    // This is necessary to reference the dev resources as the root is `/src` and there is no public / static
    // resources served with this particular Vite configuration. Modify the proxy rule as necessary for your
    // static resources / project.
    server: {
      port: 30001,
      open: '/game',
      proxy: {
        // Serves static files from main Foundry server.
        [`^(/${s_PACKAGE_ID}/(assets|lang|packs|style.css))`]:
          'http://localhost:30000',
        // All other paths besides package ID path are served from main Foundry server.
        [`^(?!/${s_PACKAGE_ID}/)`]: 'http://localhost:30000',
        // Enable socket.io from main Foundry server.
        '/socket.io': { target: 'ws://localhost:30000', ws: true }
      }
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_TERSER ? 'terser' : 'esbuild',
      target: ['es2022'],
      terserOptions: s_TERSER ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: './index.js',
        formats: ['es'],
        fileName: `index`
      }
    },
    plugins: [
      svelte({
        compilerOptions: {
          // Provides a custom hash adding the string defined in `s_SVELTE_HASH_ID` to scoped Svelte styles;
          // This is reasonable to do as the framework styles in TRL compiled across `n` different packages will
          // be the same. Slightly modifying the hash ensures that your package has uniquely scoped styles for all
          // TRL components and makes it easier to review styles in the browser debugger.
          cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`
        },
        preprocess: preprocess()
      }),
      minifyEs(),
      visualizer()
    ]
  };
};

function minifyEs() {
  return {
    name: 'minifyEs',
    renderChunk: {
      order: 'post',
      async handler(code) {
        if (s_MINIFY) {
          return await transform(code, {
            minify: true,
            sourcemap: s_SOURCEMAPS
          });
        }
        return code;
      }
    }
  };
}

export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxGYWV5XFxcXGV0aGVyZWFsLXBsYW5lXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxGYWV5XFxcXGV0aGVyZWFsLXBsYW5lXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9GYWV5L2V0aGVyZWFsLXBsYW5lL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCBwcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcG9zdGNzc0NvbmZpZywgdGVyc2VyQ29uZmlnIH0gZnJvbSBcIkB0eXBob25qcy1mdnR0L3J1bnRpbWUvcm9sbHVwXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHsgdHJhbnNmb3JtIH0gZnJvbSBcImVzYnVpbGRcIjtcblxuLy8gQVRURU5USU9OIVxuLy8gUGxlYXNlIG1vZGlmeSB0aGUgYmVsb3cgdmFyaWFibGVzOiBzX1BBQ0tBR0VfSUQgYW5kIHNfU1ZFTFRFX0hBU0hfSUQgYXBwcm9wcmlhdGVseS5cblxuLy8gRm9yIGNvbnZlbmllbmNlLCB5b3UganVzdCBuZWVkIHRvIG1vZGlmeSB0aGUgcGFja2FnZSBJRCBiZWxvdyBhcyBpdCBpcyB1c2VkIHRvIGZpbGwgaW4gZGVmYXVsdCBwcm94eSBzZXR0aW5ncyBmb3Jcbi8vIHRoZSBkZXYgc2VydmVyLlxuY29uc3Qgc19QQUNLQUdFX0lEID0gXCJtb2R1bGVzL2V0aGVyZWFsLXBsYW5lXCI7XG5cbi8vIEEgc2hvcnQgYWRkaXRpb25hbCBzdHJpbmcgdG8gYWRkIHRvIFN2ZWx0ZSBDU1MgaGFzaCB2YWx1ZXMgdG8gbWFrZSB5b3VycyB1bmlxdWUuIFRoaXMgcmVkdWNlcyB0aGUgYW1vdW50IG9mXG4vLyBkdXBsaWNhdGVkIGZyYW1ld29yayBDU1Mgb3ZlcmxhcCBiZXR3ZWVuIG1hbnkgVFJMIHBhY2thZ2VzIGVuYWJsZWQgb24gRm91bmRyeSBWVFQgYXQgdGhlIHNhbWUgdGltZS4gJ2VzZScgaXMgY2hvc2VuXG4vLyBieSBzaG9ydGVuaW5nICdlc3NlbnRpYWwtc3ZlbHRlLWVzbScuXG5jb25zdCBzX1NWRUxURV9IQVNIX0lEID0gXCJldGhwbGFcIjtcblxuY29uc3Qgc19URVJTRVIgPSBmYWxzZTsgLy8gU2V0IHRvIHRydWUgdG8gdXNlIHRlcnNlclxuY29uc3Qgc19TT1VSQ0VNQVBTID0gdHJ1ZTsgLy8gR2VuZXJhdGUgc291cmNlbWFwcyBmb3IgdGhlIGJ1bmRsZSAocmVjb21tZW5kZWQpLlxuY29uc3Qgc19NSU5JRlkgPSB0cnVlOyAvLyBTZXQgdG8gdHJ1ZSB0byBjb21wcmVzcyB0aGUgbW9kdWxlIGJ1bmRsZS5cblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICAvKiogQHR5cGUge2ltcG9ydChcInZpdGVcIikuVXNlckNvbmZpZ30gKi9cbiAgcmV0dXJuIHtcbiAgICByb290OiBcInNyYy9cIiwgLy8gU291cmNlIGxvY2F0aW9uIC8gZXNidWlsZCByb290LlxuICAgIGJhc2U6IGAvJHtzX1BBQ0tBR0VfSUR9L2AsIC8vIEJhc2UgbW9kdWxlIHBhdGggdGhhdCAzMDAwMSAvIHNlcnZlZCBkZXYgZGlyZWN0b3J5LlxuICAgIHB1YmxpY0RpcjogXCIuLi9wdWJsaWNcIiwgLy8gTm8gcHVibGljIHJlc291cmNlcyB0byBjb3B5LlxuICAgIGNhY2hlRGlyOiBcIi4uLy52aXRlLWNhY2hlXCIsIC8vIFJlbGF0aXZlIGZyb20gcm9vdCBkaXJlY3RvcnkuXG5cbiAgICByZXNvbHZlOiB7IGNvbmRpdGlvbnM6IFtcImltcG9ydFwiLCBcImJyb3dzZXJcIl0gfSxcblxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogW1wiZXMyMDIyXCJdLFxuICAgIH0sXG5cbiAgICBjc3M6IHtcbiAgICAgIC8vIENyZWF0ZXMgYSBzdGFuZGFyZCBjb25maWd1cmF0aW9uIGZvciBQb3N0Q1NTIHdpdGggYXV0b3ByZWZpeGVyICYgcG9zdGNzcy1wcmVzZXQtZW52LlxuICAgICAgcG9zdGNzczogcG9zdGNzc0NvbmZpZyh7IGNvbXByZXNzOiBzX1RFUlNFUiwgc291cmNlTWFwOiBzX1NPVVJDRU1BUFMgfSksXG4gICAgfSxcblxuICAgIC8vIEFib3V0IHNlcnZlciBvcHRpb25zOlxuICAgIC8vIC0gU2V0IHRvIGBvcGVuYCB0byBib29sZWFuIGBmYWxzZWAgdG8gbm90IG9wZW4gYSBicm93c2VyIHdpbmRvdyBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3Ugc2V0IHVwIGFcbiAgICAvLyBkZWJ1Z2dlciBpbnN0YW5jZSBpbiB5b3VyIElERSBhbmQgbGF1bmNoIGl0IHdpdGggdGhlIFVSTDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMDEvZ2FtZScuXG4gICAgLy9cbiAgICAvLyAtIFRoZSB0b3AgcHJveHkgZW50cnkgcmVkaXJlY3RzIHJlcXVlc3RzIHVuZGVyIHRoZSBtb2R1bGUgcGF0aCBmb3IgYHN0eWxlLmNzc2AgYW5kIGZvbGxvd2luZyBzdGFuZGFyZCBzdGF0aWNcbiAgICAvLyBkaXJlY3RvcmllczogYGFzc2V0c2AsIGBsYW5nYCwgYW5kIGBwYWNrc2AgYW5kIHdpbGwgcHVsbCB0aG9zZSByZXNvdXJjZXMgZnJvbSB0aGUgbWFpbiBGb3VuZHJ5IC8gMzAwMDAgc2VydmVyLlxuICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHJlZmVyZW5jZSB0aGUgZGV2IHJlc291cmNlcyBhcyB0aGUgcm9vdCBpcyBgL3NyY2AgYW5kIHRoZXJlIGlzIG5vIHB1YmxpYyAvIHN0YXRpY1xuICAgIC8vIHJlc291cmNlcyBzZXJ2ZWQgd2l0aCB0aGlzIHBhcnRpY3VsYXIgVml0ZSBjb25maWd1cmF0aW9uLiBNb2RpZnkgdGhlIHByb3h5IHJ1bGUgYXMgbmVjZXNzYXJ5IGZvciB5b3VyXG4gICAgLy8gc3RhdGljIHJlc291cmNlcyAvIHByb2plY3QuXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwMSxcbiAgICAgIG9wZW46IFwiL2dhbWVcIixcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFNlcnZlcyBzdGF0aWMgZmlsZXMgZnJvbSBtYWluIEZvdW5kcnkgc2VydmVyLlxuICAgICAgICBbYF4oLyR7c19QQUNLQUdFX0lEfS8oYXNzZXRzfGxhbmd8cGFja3N8c3R5bGUuY3NzKSlgXTpcbiAgICAgICAgICBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDBcIixcblxuICAgICAgICAvLyBBbGwgb3RoZXIgcGF0aHMgYmVzaWRlcyBwYWNrYWdlIElEIHBhdGggYXJlIHNlcnZlZCBmcm9tIG1haW4gRm91bmRyeSBzZXJ2ZXIuXG4gICAgICAgIFtgXig/IS8ke3NfUEFDS0FHRV9JRH0vKWBdOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDBcIixcblxuICAgICAgICAvLyBFbmFibGUgc29ja2V0LmlvIGZyb20gbWFpbiBGb3VuZHJ5IHNlcnZlci5cbiAgICAgICAgXCIvc29ja2V0LmlvXCI6IHsgdGFyZ2V0OiBcIndzOi8vbG9jYWxob3N0OjMwMDAwXCIsIHdzOiB0cnVlIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCIuLi9kaXN0XCIsXG4gICAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICAgIHNvdXJjZW1hcDogc19TT1VSQ0VNQVBTLFxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgIG1pbmlmeTogc19URVJTRVIgPyBcInRlcnNlclwiIDogXCJlc2J1aWxkXCIsXG4gICAgICB0YXJnZXQ6IFtcImVzMjAyMlwiXSxcbiAgICAgIHRlcnNlck9wdGlvbnM6IHNfVEVSU0VSID8geyAuLi50ZXJzZXJDb25maWcoKSwgZWNtYTogMjAyMiB9IDogdm9pZCAwLFxuICAgICAgbGliOiB7XG4gICAgICAgIGVudHJ5OiBcIi4vaW5kZXguanNcIixcbiAgICAgICAgZm9ybWF0czogW1wiZXNcIl0sXG4gICAgICAgIGZpbGVOYW1lOiBgaW5kZXhgLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgcGx1Z2luczogW1xuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgLy8gUHJvdmlkZXMgYSBjdXN0b20gaGFzaCBhZGRpbmcgdGhlIHN0cmluZyBkZWZpbmVkIGluIGBzX1NWRUxURV9IQVNIX0lEYCB0byBzY29wZWQgU3ZlbHRlIHN0eWxlcztcbiAgICAgICAgICAvLyBUaGlzIGlzIHJlYXNvbmFibGUgdG8gZG8gYXMgdGhlIGZyYW1ld29yayBzdHlsZXMgaW4gVFJMIGNvbXBpbGVkIGFjcm9zcyBgbmAgZGlmZmVyZW50IHBhY2thZ2VzIHdpbGxcbiAgICAgICAgICAvLyBiZSB0aGUgc2FtZS4gU2xpZ2h0bHkgbW9kaWZ5aW5nIHRoZSBoYXNoIGVuc3VyZXMgdGhhdCB5b3VyIHBhY2thZ2UgaGFzIHVuaXF1ZWx5IHNjb3BlZCBzdHlsZXMgZm9yIGFsbFxuICAgICAgICAgIC8vIFRSTCBjb21wb25lbnRzIGFuZCBtYWtlcyBpdCBlYXNpZXIgdG8gcmV2aWV3IHN0eWxlcyBpbiB0aGUgYnJvd3NlciBkZWJ1Z2dlci5cbiAgICAgICAgICBjc3NIYXNoOiAoeyBoYXNoLCBjc3MgfSkgPT4gYHN2ZWx0ZS0ke3NfU1ZFTFRFX0hBU0hfSUR9LSR7aGFzaChjc3MpfWAsXG4gICAgICAgIH0sXG4gICAgICAgIHByZXByb2Nlc3M6IHByZXByb2Nlc3MoKSxcbiAgICAgIH0pLFxuXG4gICAgICBtaW5pZnlFcygpLFxuICAgICAgdmlzdWFsaXplcigpLFxuICAgIF0sXG4gIH07XG59O1xuXG5mdW5jdGlvbiBtaW5pZnlFcygpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcIm1pbmlmeUVzXCIsXG4gICAgcmVuZGVyQ2h1bms6IHtcbiAgICAgIG9yZGVyOiBcInBvc3RcIixcbiAgICAgIGFzeW5jIGhhbmRsZXIoY29kZSkge1xuICAgICAgICBpZiAoc19NSU5JRlkpIHtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdHJhbnNmb3JtKGNvZGUsIHtcbiAgICAgICAgICAgIG1pbmlmeTogdHJ1ZSxcbiAgICAgICAgICAgIHNvdXJjZW1hcDogc19TT1VSQ0VNQVBTLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUCxTQUFTLGNBQWM7QUFDalIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxlQUFlLG9CQUFvQjtBQUM1QyxTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGlCQUFpQjtBQU8xQixJQUFNLGVBQWU7QUFLckIsSUFBTSxtQkFBbUI7QUFFekIsSUFBTSxXQUFXO0FBQ2pCLElBQU0sZUFBZTtBQUNyQixJQUFNLFdBQVc7QUFFakIsSUFBTyxzQkFBUSxNQUFNO0FBRW5CLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTSxJQUFJLFlBQVk7QUFBQTtBQUFBLElBQ3RCLFdBQVc7QUFBQTtBQUFBLElBQ1gsVUFBVTtBQUFBO0FBQUEsSUFFVixTQUFTLEVBQUUsWUFBWSxDQUFDLFVBQVUsU0FBUyxFQUFFO0FBQUEsSUFFN0MsU0FBUztBQUFBLE1BQ1AsUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNuQjtBQUFBLElBRUEsS0FBSztBQUFBO0FBQUEsTUFFSCxTQUFTLGNBQWMsRUFBRSxVQUFVLFVBQVUsV0FBVyxhQUFhLENBQUM7QUFBQSxJQUN4RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBV0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsUUFFTCxDQUFDLE1BQU0sWUFBWSxpQ0FBaUMsR0FDbEQ7QUFBQTtBQUFBLFFBR0YsQ0FBQyxRQUFRLFlBQVksSUFBSSxHQUFHO0FBQUE7QUFBQSxRQUc1QixjQUFjLEVBQUUsUUFBUSx3QkFBd0IsSUFBSSxLQUFLO0FBQUEsTUFDM0Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUEsTUFDWCxZQUFZO0FBQUEsTUFDWixRQUFRLFdBQVcsV0FBVztBQUFBLE1BQzlCLFFBQVEsQ0FBQyxRQUFRO0FBQUEsTUFDakIsZUFBZSxXQUFXLEVBQUUsR0FBRyxhQUFhLEdBQUcsTUFBTSxLQUFLLElBQUk7QUFBQSxNQUM5RCxLQUFLO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxTQUFTLENBQUMsSUFBSTtBQUFBLFFBQ2QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFFQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxpQkFBaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS2YsU0FBUyxDQUFDLEVBQUUsTUFBTSxJQUFJLE1BQU0sVUFBVSxnQkFBZ0IsSUFBSSxLQUFLLEdBQUcsQ0FBQztBQUFBLFFBQ3JFO0FBQUEsUUFDQSxZQUFZLFdBQVc7QUFBQSxNQUN6QixDQUFDO0FBQUEsTUFFRCxTQUFTO0FBQUEsTUFDVCxXQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLFNBQVMsV0FBVztBQUNsQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsTUFDWCxPQUFPO0FBQUEsTUFDUCxNQUFNLFFBQVEsTUFBTTtBQUNsQixZQUFJLFVBQVU7QUFDWixpQkFBTyxNQUFNLFVBQVUsTUFBTTtBQUFBLFlBQzNCLFFBQVE7QUFBQSxZQUNSLFdBQVc7QUFBQSxVQUNiLENBQUM7QUFBQSxRQUNIO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=

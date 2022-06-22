import { defineConfig, Plugin, ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from 'path';
import APP_CONFIG from "./config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    immersed({
      src_sw: "sw.ts",
      filename_sw: "sw.js",
      src_inject: "inject.ts",
      filename_inject: "inject.js",
    }),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __PAGE_URI__: JSON.stringify(APP_CONFIG.page_uri),
    __PROXY_URI__: JSON.stringify(APP_CONFIG.proxy_uri),
  },
});

interface ImmersedConfig {
  src_sw: string;
  filename_sw: string;
  src_inject: string;
  filename_inject: string;
}

function immersed(config: ImmersedConfig): Plugin {
  let viteConfig: ResolvedConfig;

  const name = "vite-plugin-immersed";
  return {
    name,
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async closeBundle() {
      const builds = [
        {
          input: config.src_sw,
          output: config.filename_sw
        },
        {
          input: config.src_inject,
          output: config.filename_inject
        }
      ]

      // https://github.com/antfu/vite-plugin-pwa/blob/main/src/constants.ts
      const defaultInjectManifestVitePlugins = [
        'alias',
        'commonjs',
        'vite:resolve',
        'vite:esbuild',
        'replace',
        'vite:define',
        'rollup-plugin-dynamic-import-variables',
        'vite:esbuild-transpile',
        'vite:json',
        'vite:terser',
      ]
      
      const plugins = viteConfig.plugins.filter(i=>defaultInjectManifestVitePlugins.includes(i.name));
      const { rollup } = await import('rollup');

      for (const build of builds) {
        const bundle = await rollup({
          input: build.input,
          plugins,
        });
        try {
          await bundle.write({
            format: 'es',
            exports: 'none',
            inlineDynamicImports: true,
            file: resolve(viteConfig.root, viteConfig.build.outDir || 'dist', build.output),
            sourcemap: viteConfig.build.sourcemap,
          })
        } finally {
          await bundle.close()
        }
      }
    },
    
    transform(code, id) {
      if (viteConfig.command === "serve") {
        if (
          id.endsWith("/" + config.src_sw) ||
          id.endsWith("/" + config.src_inject)
        ) {
          const regex = `\\b(${Object.keys(viteConfig.define).join("|")})\\b`;
          return code.replace(new RegExp(regex, "g"), (_, match) => {
            return "" + viteConfig.define[match];
          });
        }
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === `/${config.filename_sw}`) {
          req.url = `/${config.src_sw}`;
        }

        if (req.url === `/${config.filename_inject}`) {
          req.url = `/${config.src_inject}`;
        }
        next();
      });
    },
  };
}

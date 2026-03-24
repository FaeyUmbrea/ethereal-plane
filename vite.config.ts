import { svelte } from '@sveltejs/vite-plugin-svelte';
import { visualizer } from 'rollup-plugin-visualizer';
import { sveltePreprocess } from 'svelte-preprocess';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import moduleJSON from './module.json' with { type: 'json' };

const s_PACKAGE_ID = `modules/${moduleJSON.id}`;
const s_SVELTE_HASH_ID = 'ethpla';

const s_COMPRESS = false;
const s_SOURCEMAPS = true;

export default defineConfig(({ mode }) => {
	const compilerOptions = mode === 'production'
		? {
				cssHash: ({ hash, css }: { hash: (css: string) => string; css: string }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`,
			}
		: {};

	return {
		root: 'src/',
		base: `/${s_PACKAGE_ID}/dist`,
		publicDir: false,
		cacheDir: '../.vite-cache',

		resolve: {
			conditions: ['browser', 'import'],
		},

		esbuild: {
			target: 'es2022',
		},

		test: {
			globals: true,
			environment: 'jsdom',
			exclude: [...configDefaults.exclude, 'tests/**'],
			coverage: {
				enabled: true,
				provider: 'istanbul',
				reporter: ['json'],
				exclude: ['node_modules/', 'tests/'],
				reportsDirectory: '../test-results/coverage/vitest',
			},
		},

		server: {
			port: 30001,
			open: '/game',
			proxy: {
				[`^(/${s_PACKAGE_ID}/(assets|lang|packs|storage|dist/${moduleJSON.id}.css))`]: 'http://localhost:30000',
				[`^(?!/${s_PACKAGE_ID}/)`]: 'http://localhost:30000',
				[`/${s_PACKAGE_ID}/dist/${moduleJSON.id}.js`]: {
					target: `http://localhost:30001/${s_PACKAGE_ID}/dist`,
					rewrite: () => '/index.ts',
				},
				'/socket.io': { target: 'ws://localhost:30000', ws: true },
			},
		},

		build: {
			outDir: '../dist',
			emptyOutDir: false,
			sourcemap: s_SOURCEMAPS,
			target: ['esnext', 'chrome127'],
			cssCodeSplit: false,
			minify: s_COMPRESS ? 'esbuild' : false,
			lib: {
				entry: './index.ts',
				formats: ['es'],
				fileName: moduleJSON.id,
				cssFileName: moduleJSON.id,
			},
			rollupOptions: {
				output: {
					assetFileNames: assetInfo =>
						assetInfo.name ? assetInfo.name as string : 'assets/[name][extname]',
				},
			},
		},

		optimizeDeps: {
			esbuildOptions: {
				target: ['esnext', 'chrome127'],
			},
		},

		plugins: [
			svelte({
				compilerOptions,
				preprocess: sveltePreprocess(),
			}),
			visualizer(),
		],
	};
});

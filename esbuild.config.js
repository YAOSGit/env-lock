import * as esbuild from 'esbuild';
import { createEsbuildConfig } from '@yaos-git/toolkit/build';

// Build CLI
await esbuild.build({
	...createEsbuildConfig({ entry: 'src/app/cli.ts' }),
	outfile: 'dist/cli.js',
});

// Build TUI (Ink/React vault browser)
await esbuild.build({
	...createEsbuildConfig({ entry: 'src/app/tui.tsx' }),
	outfile: 'dist/tui.js',
});

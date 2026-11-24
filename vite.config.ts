import { defineConfig } from 'vite';

// itch.io serves uploads from a subdirectory, not the site's root.
// Relative paths also work when this same build is served on Vercel.
export default defineConfig({ base: './' });

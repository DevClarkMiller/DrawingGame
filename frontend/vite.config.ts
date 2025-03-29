import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv';
import path from 'path';
// import tsconfigpaths from 'vite-tsconfig-paths';

// Load env variables
dotenv.config();


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, './lib'),
        '@components': path.resolve(__dirname, "./src/components"),
        '@pages': path.resolve(__dirname, "./src/pages"),
        '@context': path.resolve(__dirname, "./src/context"),
        '@reducers': path.resolve(__dirname, "./src/reducers"),
        '@hooks': path.resolve(__dirname, "./src/hooks"),
        "@def": path.resolve(__dirname, "./src/def.ts")
      }
    },
    define: {
      'process.env': env, // Expose environment variables to your app
    },
    plugins: [react(), tailwindcss()], 
  };
});

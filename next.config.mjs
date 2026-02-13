import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable tree shaking for better optimization
    productionBrowserSourceMaps: false,
    // Exclude heavy packages from serverless function bundle
    outputFileTracingExcludes: {
        '*': [
            'node_modules/@swc/core-linux-x64-gnu',
            'node_modules/@swc/core-linux-x64-musl',
            'node_modules/@esbuild/linux-x64',
            'node_modules/webpack',
            'node_modules/terser',
            'python_backend/**',
            'data/**',
            'tests/**',
            '**/*.md',
            '**/*.log',
            '**/*.txt',
            '**/*.tsbuildinfo',
            '**/*.py',
            '**/*.pyc',
            '**/__pycache__/**',
            '**/.git/**',
            '**/.next/**',
            '**/node_modules/.cache/**',
            '**/node_modules/.prisma/**',
            '**/node_modules/.bin/**',
            '**/node_modules/@swc/core-*',
            '**/node_modules/@esbuild/*',
            '**/node_modules/esbuild',
            '**/node_modules/webpack',
            '**/node_modules/terser',
            '**/scripts/**',
            '**/patches/**',
            '**/api/**/*.py',
            '**/python_backend/**',
            '**/data/**',
            '**/tests/**',
            '**/.env*',
            '**/prisma/migrations/**',
        ]
    },
    // Configure webpack to handle mermaid's dynamic imports
    webpack: (config, { isServer }) => {
        // Exclude mermaid from server-side bundling
        if (!isServer) {
            config.module.rules.push({
                test: /mermaid\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['next/babel'],
                        plugins: ['@babel/plugin-syntax-dynamic-import']
                    }
                }]
            });
        }
        return config;
    }
};

export default withNextIntl(nextConfig);

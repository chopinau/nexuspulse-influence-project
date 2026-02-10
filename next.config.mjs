import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable tree shaking for better optimization
    productionBrowserSourceMaps: false,
    // Optimize file tracing to reduce bundle size
    outputFileTracing: true,
    // Exclude heavy packages from serverless function bundle
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                'node_modules/@swc/core-linux-x64-gnu',
                'node_modules/@swc/core-linux-x64-musl',
                'node_modules/@esbuild/linux-x64',
                'node_modules/webpack',
                'node_modules/terser',
                'node_modules/@google/genai',
                'node_modules/@tremor/react',
                'node_modules/chart.js',
                'node_modules/react-chartjs-2',
                'node_modules/recharts',
                'node_modules/mermaid',
                'node_modules/chevrotain',
                'node_modules/embla-carousel-react',
                'node_modules/input-otp',
                'node_modules/cmdk',
                'node_modules/@radix-ui',
                'node_modules/framer-motion',
                'node_modules/@prisma/client',
                'node_modules/prisma',
                'node_modules/@next-auth',
                'node_modules/swr',
                'node_modules/date-fns',
                'node_modules/uuid',
                'node_modules/vaul',
                'node_modules/zod',
                'node_modules/chevrotain',
                'node_modules/@tailwindcss',
                'node_modules/tailwindcss',
                'node_modules/postcss',
                'node_modules/autoprefixer',
                'node_modules/@types',
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
        serverComponentsExternalPackages: [
            '@google/genai',
            '@tremor/react',
            'chart.js',
            'react-chartjs-2',
            'recharts',
            'mermaid',
            'chevrotain',
            'embla-carousel-react',
            'input-otp',
            'cmdk',
            '@radix-ui',
            'framer-motion',
            '@prisma/client',
            'prisma',
            '@next-auth',
            'swr',
            'date-fns',
            'uuid',
            'vaul',
            'zod',
            'chevrotain',
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

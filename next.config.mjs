import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable tree shaking for better optimization
    productionBrowserSourceMaps: false,
    // Optimize file tracing to reduce bundle size
    outputFileTracing: true,
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
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable tree shaking for better optimization
    productionBrowserSourceMaps: false
};

export default withNextIntl(nextConfig);
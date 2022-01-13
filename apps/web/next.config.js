// without the next-transpile-modules, webpack will fail to recognize our custom improts
const withTM = require('next-transpile-modules')(['custom-types', 'utils']); // pass the modules you would like to see transpiled

/** @type {import('next').NextConfig} */
module.exports = withTM({
    reactStrictMode: true,
    // https://stackoverflow.com/a/65467719
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3001/:path*' // Proxy to Backend
            }
        ]
    }
})

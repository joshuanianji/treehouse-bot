/** @type {import('next').NextConfig} */
module.exports = {
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
}

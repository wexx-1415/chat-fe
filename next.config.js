/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	webpack: (
		config,
		{ buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
	) => {
		// Important: return the modified config
		return {
			...config,
			devServer: {
				allowedHosts: [
					'host.com',
					'subdomain.host.com',
					'subdomain2.host.com',
					'host2.com',
					'localhost.charlesproxy.com:3001',
					'localhost.charlesproxy.com:3000',
					'localhost',
				],
			},
		};
	},
};

module.exports = nextConfig;

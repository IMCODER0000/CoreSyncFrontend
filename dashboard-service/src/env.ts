interface Env {
		mode: string | undefined;
		api: {
				VITE_ATT_API_BASE_URL: string | undefined;
				VITE_USER_API_BASE_URL: string | undefined;
				VITE_LEAVE_API_BASE_URL: string | undefined;
				VITE_AUTH_TOKEN_KEY: string | undefined;
		};
}

const env: Env = {
		mode: process.env.NODE_ENV,
		api: {
				VITE_ATT_API_BASE_URL: process.env.VITE_ATT_API_BASE_URL,
				VITE_USER_API_BASE_URL: process.env.VITE_USER_API_BASE_URL,
				VITE_LEAVE_API_BASE_URL: process.env.VITE_LEAVE_API_BASE_URL,
				VITE_AUTH_TOKEN_KEY: process.env.VITE_AUTH_TOKEN_KEY,

		},
};

export default env;
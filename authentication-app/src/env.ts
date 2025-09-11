interface Env {
    mode: string | undefined;
    api: {
        KAKAO_AUTH_URL: string | undefined;
        MAIN_API_URL: string | undefined
    };
    origins: {
        kakao: string[];
    };
}

const parseOrigins = (val?: string): string[] =>
    val ? val.split(",").map(s => s.trim()) : [];

const env: Env = {
    mode: process.env.NODE_ENV,
    api: {
        KAKAO_AUTH_URL: process.env.REACT_KAKAO_AUTH_URL,
        MAIN_API_URL: process.env.REACT_APP_BASE_URL,
    },
    origins: {
        kakao: parseOrigins(process.env.REACT_KAKAO_ORIGINS),
    }
};

export default env;

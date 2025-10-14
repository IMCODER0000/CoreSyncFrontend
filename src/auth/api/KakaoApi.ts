// import axios from "axios";
//
//
//
// export const useKakaoLogin = () => {
//
//     const requestKakaoLoginToSpring = async () => {
//         try {
//
//             const springAxiosInstance = axios.create({
//                 baseURL: import.meta.env.VITE_SPRING_API,
//                 withCredentials: true,
//             });
//             const res = await springAxiosInstance.get("/authentication/kakao/link");
//             if (!res.data) throw new Error("응답에 URL이 없습니다.");
//
//
//             const popup = window.open(res.data, "_blank", "width=500,height=600");
//             if (!popup) return alert("팝업 차단되어 있습니다.");
//
//             const receiveMessage = (event: MessageEvent) => {
//                 // if (event.origin !== import.meta.env.VITE_ORIGIN) return;
//
//                 console.log("📩 받은 메시지 데이터:", event.data);
//
//                 const {accessToken, isNewUser, user} = event.data;
//                 const MAIN_CONTAINER_URL = import.meta.env.VITE_MAIN_CONTAINER_URL as string;
//                 const VITE_MAIN_TERMS_URL = import.meta.env.VITE_MAIN_TERMS_URL as string;
//
//                 console.log("🔑 accessToken:", accessToken);
//                 console.log("👤 isNewUser:", isNewUser);
//                 console.log("📍 MAIN_CONTAINER_URL:", MAIN_CONTAINER_URL);
//
//                 // accessToken이 없으면 처리하지 않음
//                 if (!accessToken) {
//                     console.warn("⚠️ accessToken이 없습니다!");
//                     return;
//                 }
//
//                 window.removeEventListener("message", receiveMessage);
//
//                 if (isNewUser) {
//                     // 신규 사용자: 임시 토큰 저장
//                     console.log("🆕 신규 사용자 처리");
//                     sessionStorage.setItem("tempToken", accessToken);
//                     sessionStorage.setItem("userInfo", JSON.stringify(user));
//                     localStorage.setItem("isNewUser", JSON.stringify(isNewUser));
//                     console.log("로그인 결과 : " + isNewUser);
//                     window.location.href = VITE_MAIN_TERMS_URL;
//                 } else {
//                     // 기존 사용자: 로그인 완료
//                     console.log("✅ 기존 사용자 로그인 성공");
//                     console.log("💾 localStorage 저장 시작...");
//                     localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
//                     localStorage.setItem("userToken", accessToken);
//                     localStorage.setItem("nickname", user.nickname);
//                     console.log("💾 저장 완료 - isLoggedIn:", localStorage.getItem("isLoggedIn"));
//                     console.log("💾 저장 완료 - userToken:", localStorage.getItem("userToken"));
//                     console.log("🚀 페이지 이동:", MAIN_CONTAINER_URL);
//                     window.location.href = MAIN_CONTAINER_URL;
//                 }
//
//                 try {
//                     popup.close();
//                 } catch {
//                 }
//             };
//
//             window.addEventListener("message", receiveMessage);
//         } catch (error) {
//             console.error(error);
//         }
//     }
//
//     const requestRegister = async () => {
//         try {
//
//             const springAxiosInstance = axios.create({
//                 baseURL: import.meta.env.VITE_SPRING_API,
//                 withCredentials: true,
//             });
//             const accessToken = sessionStorage.getItem("tempToken");
//             let userInfo = null;
//             const user = sessionStorage.getItem("userInfo");
//
//             if (user) {
//                 userInfo = JSON.parse(user);
//                 userInfo.loginType = "KAKAO";
//             }
//
//             const res = await springAxiosInstance.post(
//                 "/account/register",
//                 userInfo,
//                 {
//                     headers: {
//                         "Authentication": accessToken
//                     }
//                 }
//             );
//
//             localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
//             localStorage.setItem("userToken", res.data);
//             localStorage.removeItem("tempToken");
//             window.location.href = "/";
//
//         }catch (error) {
//             console.error(error);
//             return;
//         }
//     }
//
//
//
//
//
//
//
//
//
//     return { requestKakaoLoginToSpring, requestRegister };
// };

// KakaoApi.ts
// 목표: 팝업이 tempToken을 안 내려줘도 약관 동의 시 /account/login 으로 우회 가입
// - isNewUser 시: tempToken 우선 저장, 없으면 accessToken 저장 (fallback)
// - requestRegister():
//    1) tempToken 있으면  -> /account/register (Authorization: Bearer <tempToken>)
//    2) tempToken 없고 accessToken 있으면 -> /account/login (Authorization: Bearer <accessToken>)
// - UI/흐름 변경 없음

import axios from "axios";

type KakaoUserInfo = {
    id?: string | number;
    email?: string;
    nickname?: string;
    oauthId?: string | number;
    [key: string]: any;
};

function pickTempTokenFromMessage(data: any): string | null {
    if (!data || typeof data !== "object") return null;
    const candidates = [
        "tempToken",
        "temporaryToken",
        "temporaryUserToken",
        "registerToken",
        "signupToken",
        "kakaoTempToken",
    ];
    for (const k of candidates) {
        const v = data[k];
        if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return null;
}

function printAxiosError(prefix: string, err: unknown) {
    if (axios.isAxiosError(err)) {
        const data =
            typeof err.response?.data === "string"
                ? err.response?.data
                : JSON.stringify(err.response?.data, null, 2);
        // eslint-disable-next-line no-console
        console.error(prefix, {
            status: err.response?.status,
            data,
            url: err.config?.url,
            method: err.config?.method,
        });
    } else {
        // eslint-disable-next-line no-console
        console.error(prefix, err);
    }
}

export const useKakaoLogin = () => {
    const requestKakaoLoginToSpring = async () => {
        try {
            const springAxiosInstance = axios.create({
                baseURL: import.meta.env.VITE_SPRING_API,
                withCredentials: true,
                timeout: 8000,
            });
            const res = await springAxiosInstance.get("/authentication/kakao/link");
            if (!res.data) throw new Error("응답에 URL이 없습니다.");

            const popup = window.open(res.data, "_blank", "width=500,height=600");
            if (!popup) {
                alert("팝업 차단되어 있습니다.");
                return;
            }

            const receiveMessage = (event: MessageEvent) => {
                // if (event.origin !== import.meta.env.VITE_ORIGIN) return;

                try {
                    const data = event.data || {};
                    const tempToken = pickTempTokenFromMessage(data); // [NEW]
                    const accessToken: string | undefined = data.accessToken;
                    const isNewUser: boolean | undefined = data.isNewUser;
                    const user: KakaoUserInfo | undefined = data.user;

                    const MAIN_CONTAINER_URL = import.meta.env.VITE_MAIN_CONTAINER_URL as string;
                    const VITE_MAIN_TERMS_URL = import.meta.env.VITE_MAIN_TERMS_URL as string;

                    if (isNewUser) {
                        // [NEW] 신규가입: tempToken 우선, 없으면 accessToken 폴백 저장
                        const regToken = tempToken || accessToken || "";
                        if (!regToken) {
                            console.error("⚠️ 신규가입인데 토큰이 없습니다. 팝업 메시지에 tempToken 또는 accessToken이 있어야 합니다.");
                            alert("신규 가입 토큰이 유실되었습니다. 다시 로그인해주세요.");
                            return;
                        }
                        // 무엇으로 받았는지 구분 저장
                        if (tempToken) {
                            sessionStorage.setItem("tempToken", tempToken); // [NEW]
                        } else if (accessToken) {
                            sessionStorage.setItem("accessToken", accessToken); // [NEW] 폴백
                        }

                        const normalized: KakaoUserInfo = {
                            ...(user ?? {}),
                            oauthId: (user?.oauthId ?? user?.id) as any,
                            loginType: "KAKAO",
                        };
                        sessionStorage.setItem("userInfo", JSON.stringify(normalized));

                        window.location.href = VITE_MAIN_TERMS_URL;
                        return;
                    }

                    // 기존 사용자 로그인(가입완료자)
                    if (!accessToken) {
                        console.warn("⚠️ 기존 로그인인데 accessToken이 없습니다.");
                        return;
                    }
                    localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
                    localStorage.setItem("userToken", accessToken);
                    if (user?.nickname) localStorage.setItem("nickname", user.nickname);
                    window.location.href = MAIN_CONTAINER_URL;
                } finally {
                    try { popup.close(); } catch {}
                    window.removeEventListener("message", receiveMessage);
                }
            };

            window.addEventListener("message", receiveMessage);
        } catch (error) {
            printAxiosError("kakao/link 실패", error);
        }
    };

    const requestRegister = async () => {
        const springAxiosInstance = axios.create({
            baseURL: import.meta.env.VITE_SPRING_API,
            withCredentials: true,
            timeout: 8000,
            headers: { Accept: "application/json, text/plain, */*" },
        });

        try {
            const temp = sessionStorage.getItem("tempToken");       // [CHANGED] 1순위
            const acc = sessionStorage.getItem("accessToken");      // [NEW] 2순위
            const raw = sessionStorage.getItem("userInfo");

            if (!temp && !acc) {
                console.warn("⚠️ tempToken과 accessToken이 모두 없습니다. 카카오 로그인부터 다시 진행하세요.");
                throw new Error("NO_TOKEN");
            }
            if (!raw) {
                console.warn("⚠️ userInfo가 없습니다. 카카오 로그인부터 다시 진행하세요.");
                throw new Error("NO_USER_INFO");
            }

            let userInfo: KakaoUserInfo = {};
            try {
                userInfo = JSON.parse(raw);
            } catch {
                throw new Error("INVALID_USER_INFO");
            }

            const payload = {
                email: userInfo.email ?? "",
                nickname: userInfo.nickname ?? "",
                loginType: "KAKAO",
            };

            if (temp) {
                // [CHANGED] 정상 루트: 임시 토큰으로 register 호출
                const res = await springAxiosInstance.post("/account/register", payload, {
                    headers: {
                        Authorization: `Bearer ${temp}`,
                        "Content-Type": "application/json",
                    },
                });
                const newToken =
                    typeof res.data === "string" ? res.data : res.data?.accessToken ?? "";
                localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
                if (newToken) localStorage.setItem("userToken", newToken);

                // 청소
                localStorage.removeItem("isNewUser");
                sessionStorage.removeItem("tempToken");
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("userInfo");
                window.location.href = "/";
                return;
            }

            // [NEW] 폴백 루트: tempToken이 없고 accessToken만 있는 신규 유입 → /account/login 으로 우회 가입
            if (acc) {
                const res = await springAxiosInstance.post("/account/login", null, {
                    headers: {
                        Authorization: `Bearer ${acc}`,
                    },
                });
                const newToken =
                    typeof res.data === "string" ? res.data : res.data?.accessToken ?? "";
                localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
                if (newToken) localStorage.setItem("userToken", newToken);

                // 선택: 닉네임 로컬 저장(뷰 편의)
                if (userInfo.nickname) {
                    localStorage.setItem("nickname", String(userInfo.nickname));
                }

                // 청소
                localStorage.removeItem("isNewUser");
                sessionStorage.removeItem("tempToken");
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("userInfo");
                window.location.href = "/";
                return;
            }
        } catch (error) {
            printAxiosError("회원가입/로그인 처리 실패", error);
        }
    };

    return { requestKakaoLoginToSpring, requestRegister };
};

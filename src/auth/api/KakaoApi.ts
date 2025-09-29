import axios from "axios";



export const useKakaoLogin = () => {

    const requestKakaoLoginToSpring = async () => {
        try {

            const springAxiosInstance = axios.create({
                baseURL: import.meta.env.VITE_SPRING_API,
                withCredentials: true,
            });
            const res = await springAxiosInstance.get("/authentication/kakao/link");
            if (!res.data) throw new Error("응답에 URL이 없습니다.");


            const popup = window.open(res.data, "_blank", "width=500,height=600");
            if (!popup) return alert("팝업 차단되어 있습니다.");

            const receiveMessage = (event: MessageEvent) => {
                // if (event.origin !== import.meta.env.VITE_ORIGIN) return;

                const { accessToken, isNewUser, user } = event.data;
                const MAIN_CONTAINER_URL = import.meta.env.VITE_MAIN_CONTAINER_URL as string;
                const VITE_MAIN_TERMS_URL = import.meta.env.VITE_MAIN_TERMS_URL as string;

                if (!accessToken) return;

                window.removeEventListener("message", receiveMessage);



                if (isNewUser) {
                    sessionStorage.setItem("tempToken", accessToken);
                    sessionStorage.setItem("userInfo", JSON.stringify(user));
                    localStorage.setItem("isNewUser", JSON.stringify(isNewUser));
                    console.log("로그인 결과 : " + isNewUser);
                    window.location.href = VITE_MAIN_TERMS_URL;
                } else {
                    localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
                    localStorage.setItem("nickname", user.nickname);
                    window.location.href = MAIN_CONTAINER_URL;
                }

                try { popup.close(); } catch {}
            };

            window.addEventListener("message", receiveMessage);
        } catch (error) {
            console.error(error);
        }
    };






    return { requestKakaoLoginToSpring };
};

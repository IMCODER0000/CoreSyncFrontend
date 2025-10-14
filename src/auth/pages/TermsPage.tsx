// import React from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '../../common_ui';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useKakaoLogin } from "../api/KakaoApi";
//
//
// interface TermsPageProps {
//   onAccept?: () => void;
//   onDecline?: () => void;
// }
//
// const TermsPage: React.FC<TermsPageProps> = ({ onAccept, onDecline }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const provider = location.state?.provider || 'kakao';
//   const fromRouter = !onAccept || !onDecline;
//   const { requestRegister } = useKakaoLogin();
//
//   const handleAccept = () => {
//     if (fromRouter) {
//       // URL에서 직접 접근한 경우
//       requestRegister();
//     } else if (onAccept) {
//       // 컴포넌트 props로 전달된 경우
//       onAccept();
//     }
//   };
//
//   const handleDecline = () => {
//     if (fromRouter) {
//       // URL에서 직접 접근한 경우
//       navigate('/');
//     } else if (onDecline) {
//       // 컴포넌트 props로 전달된 경우
//       onDecline();
//     }
//   };
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="bg-white rounded-2xl shadow-lg overflow-hidden"
//     >
//       {/* 헤더 영역 */}
//       <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
//         <h1 className="text-2xl font-bold text-white">서비스 이용약관</h1>
//         <p className="text-blue-100 mt-1 text-sm">서비스를 이용하기 전에 아래 약관을 확인해주세요</p>
//       </div>
//
//       {/* 약관 내용 영역 */}
//       <div className="p-6">
//         <div className="bg-gray-50 rounded-lg p-4 mb-6 h-64 overflow-y-auto text-sm text-gray-700">
//           <h3 className="font-bold text-lg mb-3">제 1 조 (목적)</h3>
//           <p className="mb-4">
//             이 약관은 애자일론머스킹(이하 "회사")이 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
//           </p>
//
//           <h3 className="font-bold text-lg mb-3">제 2 조 (용어의 정의)</h3>
//           <p className="mb-4">
//             이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
//             <br /><br />
//             1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.<br />
//             2. "회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인 또는 법인을 말합니다.<br />
//             3. "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인하는 문자 또는 숫자의 조합을 말합니다.<br />
//             4. "비밀번호"란 회원이 부여 받은 아이디와 일치된 회원임을 확인하고 회원의 개인정보를 보호하기 위해 회원 자신이 정한 문자와 숫자의 조합을 말합니다.
//           </p>
//
//           <h3 className="font-bold text-lg mb-3">제 3 조 (약관의 효력 및 변경)</h3>
//           <p className="mb-4">
//             1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br />
//             2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.<br />
//             3. 회원은 변경된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.
//           </p>
//
//           <h3 className="font-bold text-lg mb-3">제 4 조 (개인정보보호)</h3>
//           <p className="mb-4">
//             1. 회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.<br />
//             2. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.<br />
//             3. 회사는 서비스를 중단하거나 회원이 개인정보 제공 동의를 철회한 경우에는 신속하게 회원의 개인정보를 파기합니다.
//           </p>
//         </div>
//
//         <div className="flex flex-col space-y-3">
//           <Button
//             onClick={handleAccept}
//             color="primary"
//             variant="filled"
//             size="lg"
//             fullWidth
//             className="shadow-sm"
//           >
//             약관에 동의합니다
//           </Button>
//
//           <Button
//             onClick={handleDecline}
//             color="secondary"
//             variant="outline"
//             size="lg"
//             fullWidth
//             className="shadow-sm"
//           >
//             동의하지 않습니다
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };
//
// export default TermsPage;

// TermsPage.tsx
// 목표: 약관 동의 시 requestRegister()만 호출 (토큰 분기 처리는 KakaoApi.ts가 수행)

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../common_ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKakaoLogin } from "../api/KakaoApi";

interface TermsPageProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onAccept, onDecline }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const provider = location.state?.provider || 'kakao';
  const fromRouter = !onAccept || !onDecline;
  const { requestRegister } = useKakaoLogin();

  const handleAccept = async () => {
    if (fromRouter) {
      try {
        await requestRegister(); // [CHANGED] KakaoApi.ts에서 temp/login 분기 처리
      } catch {}
    } else if (onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    if (fromRouter) {
      navigate('/');
    } else if (onDecline) {
      onDecline();
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* 헤더 영역 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">서비스 이용약관</h1>
          <p className="text-blue-100 mt-1 text-sm">서비스를 이용하기 전에 아래 약관을 확인해주세요</p>
        </div>

        {/* 약관 내용 영역 */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 h-64 overflow-y-auto text-sm text-gray-700">
            <h3 className="font-bold text-lg mb-3">제 1 조 (목적)</h3>
            <p className="mb-4">
              이 약관은 애자일론머스킹(이하 "회사")이 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>

            <h3 className="font-bold text-lg mb-3">제 2 조 (용어의 정의)</h3>
            <p className="mb-4">
              이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
              <br /><br />
              1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.<br />
              2. "회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인 또는 법인을 말합니다.<br />
              3. "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인하는 문자 또는 숫자의 조합을 말합니다.<br />
              4. "비밀번호"란 회원이 부여 받은 아이디와 일치된 회원임을 확인하고 회원의 개인정보를 보호하기 위해 회원 자신이 정한 문자와 숫자의 조합을 말합니다.
            </p>

            <h3 className="font-bold text-lg mb-3">제 3 조 (약관의 효력 및 변경)</h3>
            <p className="mb-4">
              1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br />
              2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.<br />
              3. 회원은 변경된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.
            </p>

            <h3 className="font-bold text-lg mb-3">제 4 조 (개인정보보호)</h3>
            <p className="mb-4">
              1. 회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.<br />
              2. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.<br />
              3. 회사는 서비스를 중단하거나 회원이 개인정보 제공 동의를 철회한 경우에는 신속하게 회원의 개인정보를 파기합니다.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
                onClick={handleAccept}
                color="primary"
                variant="filled"
                size="lg"
                fullWidth
                className="shadow-sm"
            >
              약관에 동의합니다
            </Button>

            <Button
                onClick={handleDecline}
                color="secondary"
                variant="outline"
                size="lg"
                fullWidth
                className="shadow-sm"
            >
              동의하지 않습니다
            </Button>
          </div>
        </div>
      </motion.div>
  );
};

export default TermsPage;

import React, { forwardRef } from 'react';

/**
 * 텍스트필드 컴포넌트 사용 예시:
 * 
 * ```tsx
 * // 기본 사용법
 * <TextField placeholder="이름을 입력하세요" />
 * 
 * // 라벨과 도움말 텍스트
 * <TextField 
 *   label="이메일" 
 *   placeholder="example@email.com" 
 *   helperText="회사 이메일을 입력하세요" 
 * />
 * 
 * // 유효성 검사 오류
 * <TextField 
 *   label="비밀번호" 
 *   type="password" 
 *   error="비밀번호는 8자 이상이어야 합니다" 
 * />
 * 
 * // 상태 표시
 * <TextField status="success" helperText="사용 가능한 아이디입니다" />
 * <TextField status="warning" helperText="특수문자를 포함하면 더 안전합니다" />
 * <TextField status="error" helperText="필수 입력 항목입니다" />
 * 
 * // 크기 조절
 * <TextField size="sm" placeholder="작은 입력창" />
 * <TextField size="md" placeholder="중간 입력창" />
 * <TextField size="lg" placeholder="큰 입력창" />
 * 
 * // 전체 너비
 * <TextField fullWidth placeholder="전체 너비 입력창" />
 * ```
 */

export type TextFieldSize = 'sm' | 'md' | 'lg';
export type TextFieldStatus = 'default' | 'error' | 'success' | 'warning';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 입력 필드 위에 표시될 라벨 */
  label?: string;
  /** 입력 필드 아래 표시될 도움말 텍스트 */
  helperText?: string;
  /** 오류 메시지 (문자열) 또는 오류 상태 (boolean) */
  error?: string | boolean;
  /** 상태 표시 (default, error, success, warning) */
  status?: TextFieldStatus;
  /** 입력 필드 크기 */
  size?: TextFieldSize;
  /** 전체 너비로 확장 */
  fullWidth?: boolean;
  /** 왼쪽에 표시될 아이콘 요소 */
  startIcon?: React.ReactNode;
  /** 오른쪽에 표시될 아이콘 요소 */
  endIcon?: React.ReactNode;
}

// 스타일 클래스 생성 함수
const getTextFieldClasses = ({
  size = 'md',
  status = 'default',
  fullWidth = false,
  hasStartIcon = false,
  hasEndIcon = false,
}: {
  size: TextFieldSize;
  status: TextFieldStatus;
  fullWidth: boolean;
  hasStartIcon: boolean;
  hasEndIcon: boolean;
}) => {
  // 기본 클래스
  const baseClasses = 'rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 outline-none transition';
  
  // 크기 클래스
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3.5 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  }[size];
  
  // 상태 클래스
  const statusClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-300',
    error: 'border-red-400 focus:border-red-500 focus:ring-red-300',
    success: 'border-green-400 focus:border-green-500 focus:ring-green-300',
    warning: 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-300',
  }[status];
  
  // 포커스 클래스
  const focusClasses = 'focus:ring-2 focus:ring-offset-1';
  
  // 아이콘 패딩 조정
  const iconPaddingClasses = [
    hasStartIcon ? 'pl-10' : '',
    hasEndIcon ? 'pr-10' : '',
  ].filter(Boolean).join(' ');
  
  // 너비 클래스
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return `${baseClasses} ${sizeClasses} ${statusClasses} ${focusClasses} ${iconPaddingClasses} ${widthClasses}`;
};

// 상태에 따른 텍스트 색상
const getStatusTextColor = (status: TextFieldStatus) => {
  return {
    default: 'text-gray-500',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  }[status];
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ 
    id, 
    label, 
    helperText, 
    error, 
    status: propStatus, 
    size = 'md', 
    className, 
    fullWidth = false,
    startIcon,
    endIcon,
    ...rest 
  }, ref) => {
    // 에러가 있으면 상태를 에러로 설정
    const status = error ? 'error' : (propStatus || 'default');
    const describedBy = helperText || error ? `${id || rest.name || 'field'}-help` : undefined;
    
    // 에러 메시지 처리
    const displayHelperText = typeof error === 'string' ? error : helperText;
    
    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={id}
            className={`text-sm font-medium ${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            className={`${getTextFieldClasses({
              size,
              status,
              fullWidth,
              hasStartIcon: !!startIcon,
              hasEndIcon: !!endIcon,
            })} ${className || ''}`}
            aria-invalid={status === 'error' || undefined}
            aria-describedby={describedBy}
            {...rest}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>
        
        {displayHelperText && (
          <p
            id={describedBy}
            className={`text-xs ${getStatusTextColor(status)}`}
          >
            {displayHelperText}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;

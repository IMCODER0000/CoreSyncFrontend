import React, { forwardRef } from 'react';

/**
 * 버튼 컴포넌트 사용 예시:
 * 
 * ```tsx
 * // 기본 사용법
 * <Button>기본 버튼</Button>
 * 
 * // 색상 변형
 * <Button color="primary">주요 버튼</Button>
 * <Button color="secondary">보조 버튼</Button>
 * <Button color="danger">위험 버튼</Button>
 * 
 * // 스타일 변형
 * <Button variant="filled">채워진 버튼</Button>
 * <Button variant="outline">외곽선 버튼</Button>
 * <Button variant="ghost">투명 버튼</Button>
 * 
 * // 크기 변형
 * <Button size="sm">작은 버튼</Button>
 * <Button size="md">중간 버튼</Button>
 * <Button size="lg">큰 버튼</Button>
 * 
 * // 상태 변형
 * <Button loading>로딩중</Button>
 * <Button disabled>비활성화</Button>
 * <Button fullWidth>전체 너비</Button>
 * ```
 */

export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export type ButtonVariant = 'filled' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 색상 테마 */
  color?: ButtonColor;
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 로딩 상태 표시 */
  loading?: boolean;
  /** 전체 너비 적용 */
  fullWidth?: boolean;
}

// 스타일 클래스 매핑
const getButtonClasses = ({
  color = 'primary',
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
}: {
  color: ButtonColor;
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  disabled: boolean;
  loading: boolean;
}) => {
  // 기본 클래스
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // 크기 클래스
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg',
  }[size];
  
  // 색상 + 변형 클래스 조합
  const colorVariantClasses = {
    primary: {
      filled: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
      outline: 'border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    },
    secondary: {
      filled: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300',
      outline: 'border border-gray-500 text-gray-600 hover:bg-gray-50 focus:ring-gray-200',
      ghost: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-200',
    },
    danger: {
      filled: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
      outline: 'border border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-200',
      ghost: 'text-red-600 hover:bg-red-50 focus:ring-red-200',
    },
    success: {
      filled: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300',
      outline: 'border border-green-500 text-green-600 hover:bg-green-50 focus:ring-green-200',
      ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-200',
    },
    warning: {
      filled: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300',
      outline: 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-200',
      ghost: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-200',
    },
  }[color][variant];
  
  // 상태 클래스
  const stateClasses = [
    fullWidth ? 'w-full' : '',
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');
  
  return `${baseClasses} ${sizeClasses} ${colorVariantClasses} ${stateClasses}`;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      color = 'primary',
      variant = 'filled',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const buttonClasses = getButtonClasses({
      color,
      variant,
      size,
      fullWidth,
      disabled: !!isDisabled,
      loading,
    });

    return (
      <button
        ref={ref}
        className={`${buttonClasses} ${className || ''}`}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;

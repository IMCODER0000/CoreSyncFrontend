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
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]';
  
  // 크기 클래스
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-2.5 px-6 text-base',
    lg: 'py-3.5 px-8 text-lg',
  }[size];
  
  // 색상 + 변형 클래스 조합
  const colorVariantClasses = {
    primary: {
      filled: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 focus:ring-indigo-300 shadow-md hover:shadow-lg',
      outline: 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200 shadow-sm hover:shadow-md',
      ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200',
    },
    secondary: {
      filled: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-300 shadow-md hover:shadow-lg',
      outline: 'border-2 border-gray-500 text-gray-600 hover:bg-gray-50 focus:ring-gray-200 shadow-sm hover:shadow-md',
      ghost: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-200',
    },
    danger: {
      filled: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-300 shadow-md hover:shadow-lg',
      outline: 'border-2 border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-200 shadow-sm hover:shadow-md',
      ghost: 'text-red-600 hover:bg-red-50 focus:ring-red-200',
    },
    success: {
      filled: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 focus:ring-emerald-300 shadow-md hover:shadow-lg',
      outline: 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-200 shadow-sm hover:shadow-md',
      ghost: 'text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-200',
    },
    warning: {
      filled: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-300 shadow-md hover:shadow-lg',
      outline: 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50 focus:ring-amber-200 shadow-sm hover:shadow-md',
      ghost: 'text-amber-600 hover:bg-amber-50 focus:ring-amber-200',
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

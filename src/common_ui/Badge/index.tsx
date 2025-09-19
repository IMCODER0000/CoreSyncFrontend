import React from 'react';

/**
 * 뱃지 컴포넌트 사용 예시:
 * 
 * ```tsx
 * // 기본 사용법
 * <Badge>기본</Badge>
 * 
 * // 색상 변형
 * <Badge color="primary">주요</Badge>
 * <Badge color="secondary">보조</Badge>
 * <Badge color="success">성공</Badge>
 * <Badge color="warning">경고</Badge>
 * <Badge color="danger">위험</Badge>
 * <Badge color="info">정보</Badge>
 * 
 * // 스타일 변형
 * <Badge variant="filled">채워진 뱃지</Badge>
 * <Badge variant="outline">외곽선 뱃지</Badge>
 * <Badge variant="soft">연한 뱃지</Badge>
 * 
 * // 크기 변형
 * <Badge size="sm">작은 뱃지</Badge>
 * <Badge size="md">중간 뱃지</Badge>
 * <Badge size="lg">큰 뱃지</Badge>
 * 
 * // 둥근 정도
 * <Badge rounded="full">완전히 둥근 뱃지</Badge>
 * <Badge rounded="md">중간 둥근 뱃지</Badge>
 * <Badge rounded="none">각진 뱃지</Badge>
 * ```
 */

export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'filled' | 'outline' | 'soft';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 뱃지 색상 테마 */
  color?: BadgeColor;
  /** 뱃지 스타일 변형 */
  variant?: BadgeVariant;
  /** 뱃지 크기 */
  size?: BadgeSize;
  /** 뱃지 모서리 둥근 정도 */
  rounded?: BadgeRounded;
}

// 뱃지 스타일 클래스 생성 함수
const getBadgeClasses = ({
  color = 'primary',
  variant = 'filled',
  size = 'md',
  rounded = 'md',
}: {
  color: BadgeColor;
  variant: BadgeVariant;
  size: BadgeSize;
  rounded: BadgeRounded;
}) => {
  // 기본 클래스
  const baseClasses = 'inline-flex items-center justify-center font-medium';
  
  // 크기 클래스
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-2.5 py-1.5 text-base',
  }[size];
  
  // 둥근 정도 클래스
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];
  
  // 색상 + 변형 클래스 조합
  const colorVariantClasses = {
    primary: {
      filled: 'bg-blue-500 text-white',
      outline: 'border border-blue-500 text-blue-600',
      soft: 'bg-blue-50 text-blue-700',
    },
    secondary: {
      filled: 'bg-gray-500 text-white',
      outline: 'border border-gray-500 text-gray-600',
      soft: 'bg-gray-100 text-gray-700',
    },
    success: {
      filled: 'bg-green-500 text-white',
      outline: 'border border-green-500 text-green-600',
      soft: 'bg-green-50 text-green-700',
    },
    warning: {
      filled: 'bg-yellow-500 text-white',
      outline: 'border border-yellow-500 text-yellow-600',
      soft: 'bg-yellow-50 text-yellow-700',
    },
    danger: {
      filled: 'bg-red-500 text-white',
      outline: 'border border-red-500 text-red-600',
      soft: 'bg-red-50 text-red-700',
    },
    info: {
      filled: 'bg-blue-400 text-white',
      outline: 'border border-blue-400 text-blue-500',
      soft: 'bg-blue-50 text-blue-600',
    },
  }[color][variant];
  
  return `${baseClasses} ${sizeClasses} ${roundedClasses} ${colorVariantClasses}`;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  color = 'primary',
  variant = 'filled',
  size = 'md',
  rounded = 'md',
  ...rest
}) => {
  const badgeClasses = getBadgeClasses({ color, variant, size, rounded });
  
  return (
    <span className={`${badgeClasses} ${className || ''}`} {...rest}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;

import React from 'react';

/**
 * 카드 컴포넌트 사용 예시:
 * 
 * ```tsx
 * // 기본 사용법
 * <Card>
 *   <Card.Header>카드 제목</Card.Header>
 *   <Card.Body>카드 내용입니다.</Card.Body>
 *   <Card.Footer>
 *     <Button>확인</Button>
 *   </Card.Footer>
 * </Card>
 * 
 * // 변형
 * <Card variant="outlined">윤곽선만 있는 카드</Card>
 * <Card variant="elevated">그림자가 있는 카드</Card>
 * <Card variant="filled">배경색이 있는 카드</Card>
 * 
 * // 크기
 * <Card size="sm">작은 카드</Card>
 * <Card size="md">중간 카드</Card>
 * <Card size="lg">큰 카드</Card>
 * 
 * // 전체 너비
 * <Card fullWidth>전체 너비 카드</Card>
 * ```
 */

export type CardVariant = 'outlined' | 'elevated' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 카드 스타일 변형 */
  variant?: CardVariant;
  /** 카드 크기 */
  size?: CardSize;
  /** 전체 너비로 확장 */
  fullWidth?: boolean;
}

interface CardComposition {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Body: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

// 카드 스타일 클래스 생성 함수
const getCardClasses = ({
  variant = 'outlined',
  size = 'md',
  fullWidth = false,
}: {
  variant: CardVariant;
  size: CardSize;
  fullWidth: boolean;
}) => {
  // 기본 클래스
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300 bg-white';
  
  // 변형 클래스
  const variantClasses = {
    outlined: 'border border-gray-200 hover:border-indigo-200 hover:shadow-md',
    elevated: 'border border-gray-100 shadow-lg hover:shadow-xl',
    filled: 'bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm hover:shadow-md',
  }[variant];
  
  // 크기 클래스
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[size];
  
  // 너비 클래스
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses}`;
};

export const Card: React.FC<CardProps> & CardComposition = ({
  children,
  className,
  variant = 'outlined',
  size = 'md',
  fullWidth = false,
  ...rest
}) => {
  const cardClasses = getCardClasses({ variant, size, fullWidth });
  
  return (
    <div className={`${cardClasses} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

// 카드 헤더 컴포넌트
const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <div className={`font-bold text-xl mb-4 pb-3 border-b border-gray-100 text-gray-800 ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

// 카드 본문 컴포넌트
const Body: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <div className={`${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

// 카드 푸터 컴포넌트
const Footer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <div className={`mt-5 pt-4 border-t border-gray-100 ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

// 컴포넌트 조합
Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

Card.displayName = 'Card';
Header.displayName = 'Card.Header';
Body.displayName = 'Card.Body';
Footer.displayName = 'Card.Footer';

export default Card;

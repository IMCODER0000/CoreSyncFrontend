/**
 * 모든 카드의 공통 래퍼.
 * - 그림자/라운드/패딩만 통일
 * - children: 실제 카드 내용
 */
import { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

type CardProps = PropsWithChildren<{
		className?: string;
}>;

export default function Card({ className, children }: CardProps) {
		return (
				<div
						className={cn(
								"bg-white rounded-[30px] shadow-[1px_1px_20px_0px_rgba(112,124,154,0.10)]",
								"p-6",
								className
						)}
				>
						{children}
				</div>
		);
}

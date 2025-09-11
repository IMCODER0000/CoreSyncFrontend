import React from "react";

export type TabItem<T extends string> = { value: T; label: string };

type Props<T extends string> = {
		items: TabItem<T>[];
		value: T;
		onChange: (v: T) => void;
		className?: string;
		showDots?: boolean; // "·" 구분자
};

export default function SegmentedTabs<T extends string>({
																														items,
																														value,
																														onChange,
																														className = "",
																														showDots = true,
																												}: Props<T>) {
		return (
				<div className={`flex items-center gap-2 text-sm ${className}`}>
						{items.map((t, i) => {
								const active = value === t.value;
								return (
										<div key={t.value} className="flex items-center gap-2">
												<button
														type="button"
														onClick={() => onChange(t.value)}
														className={active ? "text-blue-600 font-semibold" : "text-gray-400"}
												>
														{t.label}
												</button>
												{showDots && i < items.length - 1 && <span className="text-gray-300">·</span>}
										</div>
								);
						})}
				</div>
		);
}

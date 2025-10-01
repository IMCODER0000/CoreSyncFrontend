// src/meeting/components/NotionLikeEditor.tsx
// [NEW] React 19 + Lexical '노션풍' 에디터 (value/onChange/placeholder 지원)

import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
		$getSelection,
		$isRangeSelection,
		$getRoot,
		$createParagraphNode,
		$createTextNode,
} from "lexical";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createCodeNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";

// [NEW] 마크다운 단축키용 트랜스포머
import { TRANSFORMERS } from "@lexical/markdown";

const theme = {
		paragraph: "my-1",
		text: {
				bold: "font-bold",
				italic: "italic",
				underline: "underline",
				code: "px-1 py-0.5 rounded bg-neutral-100 text-neutral-800",
		},
		quote: "border-l-4 border-neutral-300 pl-3 my-2 text-neutral-700",
		heading: { h1: "text-2xl font-bold mt-3 mb-2", h2: "text-xl font-bold mt-3 mb-2" },
		list: { ul: "list-disc ml-6", ol: "list-decimal ml-6", listitem: "my-0.5" },
		code: "rounded bg-neutral-50 border border-neutral-200 p-3 font-mono text-sm overflow-auto",
};

type Props = {
		initialTemplate?: "empty" | "scrum" | "retro" | "project";
		storageKey?: string;
		value?: string;                       // [NEW]
		onChange?: (v: string) => void;       // [NEW]
		placeholder?: string;                 // [NEW]
};

function Placeholder({ text }: { text: string }) {
		return <div className="text-neutral-400 select-none">{text}</div>;
}

export default function NotionLikeEditor({
																						 initialTemplate = "empty",
																						 storageKey = "editor:onflow:notionlike",
																						 value,
																						 onChange,
																						 placeholder,
																				 }: Props) {
		// [CHANGED] 필요한 노드 등록
		const initialConfig = React.useMemo(
				() => ({
						namespace: "onflow-notionlike",
						theme,
						onError: console.error,
						nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode], // [NEW]
				}),
				[]
		);

		// [NEW] 문제 생기면 로컬에서 끌 수 있는 킬스위치 (선택)
		const LEXICAL_OFF =
				typeof window !== "undefined" && localStorage.getItem("editor.lexical") === "off";
		if (LEXICAL_OFF) {
				return (
						<div className="p-4 bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <textarea
						className="w-full min-h-64 p-4 border border-neutral-200 rounded-xl outline-none"
						value={value ?? ""}
						onChange={(e) => onChange?.(e.target.value)}
						placeholder={placeholder ?? "빈 화면에 바로 작성하세요."}
				/>
						</div>
				);
		}

		return (
				<div className="p-4 bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
						<LexicalComposer initialConfig={initialConfig}>
								<ToolbarInner initialTemplate={initialTemplate} storageKey={storageKey} externalValue={value} />

								<div className="mt-3 border border-neutral-200 rounded-xl overflow-hidden">
										<div className="p-4">
												<RichTextPlugin
														contentEditable={<ContentEditable className="min-h-64 outline-none prose max-w-none" />}
														placeholder={
																<Placeholder text={placeholder ?? "빈 화면에 바로 작성하세요.  / 로 명령을 열 수 있어요"} />
														}
														ErrorBoundary={LexicalErrorBoundary}
												/>
												<HistoryPlugin />
												<ListPlugin />
												<LinkPlugin />
												<MarkdownShortcutPlugin transformers={TRANSFORMERS} /> {/* [CHANGED] */}
												<OnChangePlugin
														onChange={(editorState) => {
																try { localStorage.setItem(storageKey, JSON.stringify(editorState)); } catch {}
																if (onChange) {
																		editorState.read(() => {
																				const text = $getRoot().getTextContent();
																				onChange(text);
																		});
																}
														}}
												/>
										</div>
								</div>
						</LexicalComposer>
				</div>
		);
}

// ───────── Toolbar ─────────
function ToolbarInner({
													initialTemplate,
													storageKey,
													externalValue,
											}: {
		initialTemplate: "empty" | "scrum" | "retro" | "project";
		storageKey: string;
		externalValue?: string;
}) {
		const [editor] = useLexicalComposerContext();
		const lastAppliedRef = React.useRef<string | null>(null);

		// 최초: 외부 value 우선 → 없으면 로컬 복구 → 템플릿
		React.useEffect(() => {
				if (externalValue != null) {
						editor.update(() => {
								const root = $getRoot();
								root.clear();
								const p = $createParagraphNode();
								p.append($createTextNode(externalValue));
								root.append(p);
						});
						lastAppliedRef.current = externalValue;
						return;
				}
				const saved = localStorage.getItem(storageKey);
				if (saved) {
						try {
								editor.setEditorState(editor.parseEditorState(saved));
								return;
						} catch {}
				}
				applyTemplate(initialTemplate);
				// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// 외부 value 변경 시 반영(루프 방지)
		React.useEffect(() => {
				if (externalValue == null) return;
				if (externalValue === lastAppliedRef.current) return;
				editor.update(() => {
						const root = $getRoot();
						root.clear();
						const p = $createParagraphNode();
						p.append($createTextNode(externalValue));
						root.append(p);
				});
				lastAppliedRef.current = externalValue;
		}, [externalValue, editor]);

		const setBlock = React.useCallback(
				(kind: "paragraph" | "h1" | "h2" | "quote" | "code") => {
						editor.update(() => {
								const selection = $getSelection();
								if (!$isRangeSelection(selection)) return;
								if (kind === "paragraph") $setBlocksType(selection, () => $createParagraphNode());
								if (kind === "h1") $setBlocksType(selection, () => $createHeadingNode("h1"));
								if (kind === "h2") $setBlocksType(selection, () => $createHeadingNode("h2"));
								if (kind === "quote") $setBlocksType(selection, () => $createQuoteNode());
								if (kind === "code") $setBlocksType(selection, () => $createCodeNode());
						});
				},
				[editor]
		);

		const execList = React.useCallback(
				(type: "ul" | "ol" | "todo") => {
						if (type === "ul") editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
						if (type === "ol") editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
						if (type === "todo") editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
				},
				[editor]
		);

		function applyTemplate(kind: "empty" | "scrum" | "retro" | "project") {
				editor.update(() => {
						const root = $getRoot();
						root.clear();
						const p = (t: string) => {
								const n = $createParagraphNode(); n.append($createTextNode(t)); root.append(n);
						};
						if (kind === "scrum") {
								const h = $createHeadingNode("h1"); h.append($createTextNode("Daily Scrum"));
								root.append(h); p("- 어제 한 일"); p("- 오늘 할 일"); p("- 장애물/이슈");
						} else if (kind === "retro") {
								const h = $createHeadingNode("h1"); h.append($createTextNode("Retrospective"));
								root.append(h); p("👍 잘된 점"); p("👎 아쉬운 점"); p("✅ 액션 아이템");
						} else if (kind === "project") {
								const h = $createHeadingNode("h1"); h.append($createTextNode("Project Meeting"));
								root.append(h); p("Agenda"); p("Decisions"); p("Action Items");
						} else { p(""); }
				});
		}

		return (
				<div className="flex flex-wrap items-center gap-2">
						<div className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 p-1">
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => setBlock("paragraph")}>문단</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => setBlock("h1")}>H1</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => setBlock("h2")}>H2</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => setBlock("quote")}>인용</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => setBlock("code")}>{"</>"} 코드</button>
						</div>
						<div className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 p-1">
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => execList("ul")}>• 리스트</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => execList("ol")}>1. 리스트</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => execList("todo")}>☑ 체크리스트</button>
						</div>
						<div className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 p-1">
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => applyTemplate("scrum")}>템플릿: Scrum</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => applyTemplate("project")}>Project</button>
								<button className="px-3 h-9 rounded-lg hover:bg-neutral-100" onClick={() => applyTemplate("retro")}>Retro</button>
						</div>
				</div>
		);
}

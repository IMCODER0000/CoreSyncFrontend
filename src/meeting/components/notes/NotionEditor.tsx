import React from "react";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";
import "@blocknote/core/style.css";

type Props = {
    value: string;                 // JSON 문자열로 저장
    onChange: (v: string) => void; // JSON 문자열 반환
    placeholder?: string;
};

export default function NotionEditor({ value, onChange, placeholder }: Props) {
    // 저장된 notes(JSON) → 초기 블록
    const initialBlocks: Block[] | undefined = React.useMemo(() => {
        try {
            if (!value) return undefined;
            return JSON.parse(value);
        } catch {
            return undefined;
        }
    }, [value]);

    // 에디터 생성
    const editor = useCreateBlockNote({
        initialContent: initialBlocks,
    });

    // 변경 시 JSON 문자열로 lift
    const handleChange = React.useCallback(() => {
        try {
            const json = JSON.stringify(editor.document, null, 0);
            onChange(json);
        } catch {
            /* ignore */
        }
    }, [editor, onChange]);

    // placeholder는 노션처럼 첫 입력 전만 보이도록
    const showPlaceholder =
        !value || value === "[]" || value === "{}" || value.trim().length === 0;

    return (
        <div className="min-h-[220px]">
            {showPlaceholder && (
                <div className="pointer-events-none select-none text-[#9CA3AF] mb-2">
                    {placeholder || "빈 화면에 바로 작성하세요.  / 를 눌러 명령을 열 수 있어요"}
                </div>
            )}
            <BlockNoteView editor={editor} onChange={handleChange} />
        </div>
    );
}

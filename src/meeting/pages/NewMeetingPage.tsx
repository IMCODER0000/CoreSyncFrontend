import { useNavigate } from "react-router-dom";
import MeetingEditorBody, {type MeetingCore, type MeetingMeta } from "../components/MeetingEditorBody";
import { createMeeting } from "../api/meetings.ts";

//로컬 저장 키
const notesKey = (id: string) => `meeting:notes:${id}`;
const metaKey  = (id: string) => `meeting:meta:${id}`;

export default function NewMeetingPage() {
		const navigate = useNavigate();
		const now = new Date();

		// 초기값
		const initial = {
				meeting: {
						title: "",
						start: now,
						end: new Date(now.getTime() + 60 * 60 * 1000),
						allDay: false,
				} as MeetingCore,
				meta: { location: "", participants: "", links: [], files: [], notes: "" } as MeetingMeta,
		};

		return (
				<div className="min-h-[100dvh] w-full bg-[#F5F6F8] px-8 py-6 flex flex-col">
						<div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-4 flex-1 flex">
								<div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)] min-h-0">
										{/* 본문 공용 */}
										<MeetingEditorBody
												mode="new"
												initial={initial}
												onCancel={() => navigate(-1)} // [NEW]
												onSave={({ meeting, meta }) => { // [NEW]
														const created = createMeeting(meeting) as any; // id 반환 가정
														const id = String(created.id);
														if (meta.notes) localStorage.setItem(notesKey(id), meta.notes);
														localStorage.setItem(metaKey(id), JSON.stringify(meta));
														navigate(`/meeting/detail/${id}`);
												}}
										/>
								</div>
						</div>
				</div>
		);
}

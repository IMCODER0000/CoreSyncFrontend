import { useState, useMemo } from "react";
import Card from "../dashbord/Card";
import { useLeaveSummary } from "../../hooks/useLeaveSummary";

export default function LeaveApplyForm() {
    const { isLoading, data, availableDays } = useLeaveSummary();
    const [days, setDays] = useState<number>(1);
    const [reason, setReason] = useState("");

    const over = days > availableDays;
    const disabled = isLoading || availableDays <= 0;

    const helper = useMemo(() => {
        if (isLoading) return "잔여 연차를 불러오는 중...";
        if (availableDays <= 0) return "사용 가능한 연차가 없습니다.";
        if (over) return `잔여 연차(${availableDays}일)를 초과했습니다.`;
        return `잔여 ${availableDays}일 중 ${days}일 신청`;
    }, [isLoading, availableDays, days, over]);

    function submit() {
        if (disabled || over) return;
        // TODO: 백엔드 신청 API 호출 (예: leaveApi.post("/leave/apply", { days, reason }))
        alert(`휴가 ${days}일 신청 완료! (사유: ${reason || "없음"})`);
    }

    return (
        <Card className="w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">휴가 신청</h3>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">신청 일수</label>
                    <input
                        type="number"
                        min={1}
                        value={days}
                        onChange={(e) => setDays(Math.max(1, Number(e.target.value || 1)))}
                        className="w-full rounded border px-3 py-2"
                        disabled={disabled}
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">사유 (선택)</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="예: 가족 행사"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <p className={`text-sm ${over ? "text-red-600" : "text-gray-600"}`}>{helper}</p>

            <button
                onClick={submit}
                disabled={disabled || over}
                className={`px-4 py-2 rounded text-white ${disabled || over ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
                신청하기
            </button>
        </Card>
    );
}

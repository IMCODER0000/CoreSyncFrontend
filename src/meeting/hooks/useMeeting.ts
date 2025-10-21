import { useState, useEffect } from 'react';
import { meetingApi } from '../../api/meetingApi';

export interface Meeting {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  team?: string;
}

export function useMeeting() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingApi.getMeetingList();
      const formattedMeetings: Meeting[] = data.items.map(m => ({
        id: m.publicId,
        title: m.title,
        start: m.startTime,
        end: m.endTime,
        allDay: m.allDay,
      }));
      setMeetings(formattedMeetings);
    } catch (err) {
      setError(err as Error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    meetings,
    loading,
    error,
    reload: loadMeetings,
  };
}

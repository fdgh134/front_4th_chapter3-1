import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventFormActions } from '../../hooks/useEventFormActions';
import { Event, EventForm } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';

vi.mock('../../utils/eventOverlap', () => ({
  findOverlappingEvents: vi.fn()
}));

describe('useEventFormActions 훅', () => {
  const mockEvents: Event[] = [
    { id: '1', title: 'Event 1', date: '2023-05-20', startTime: '10:00', endTime: '11:00', description: 'Description 1', location: 'Location 1', category: 'Work', repeat: { type: 'none', interval: 1, endDate: undefined }, notificationTime: 10 },
    { id: '2', title: 'Event 2', date: '2023-05-21', startTime: '09:00', endTime: '10:00', description: 'Description 2', location: 'Location 2', category: 'Meeting', repeat: { type: 'none', interval: 1, endDate: undefined }, notificationTime: 15 }
  ];

  const mockSaveEvent = vi.fn();
  const mockOnOverlap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks(); // 이전의 mock 함수 호출 기록을 초기화
  });

  it('겹치는 이벤트가 없으면 saveEvent를 호출한다', async () => {
    const mockEventData: EventForm = { title: 'New Event', date: '2023-05-22', startTime: '12:00', endTime: '13:00', description: 'New event description', location: 'New location', category: 'Work', repeat: { type: 'none', interval: 1, endDate: undefined }, notificationTime: 10 };

    // findOverlappingEvents가 빈 배열을 반환하도록 설정
    (findOverlappingEvents as vi.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useEventFormActions(mockEvents, mockSaveEvent, mockOnOverlap));

    await act(async () => {
      await result.current.handleSaveEvent(mockEventData);
    });

    // 겹치는 이벤트가 없으므로 saveEvent가 호출되었는지 확인
    expect(mockSaveEvent).toHaveBeenCalledWith(mockEventData);
    expect(mockOnOverlap).not.toHaveBeenCalled(); // onOverlap은 호출되지 않았어야 함
  });

  it('겹치는 이벤트가 있으면 onOverlap을 호출한다', async () => {
    const mockEventData: EventForm = { title: 'New Event', date: '2023-05-20', startTime: '10:30', endTime: '11:30', description: 'New event description', location: 'New location', category: 'Work', repeat: { type: 'none', interval: 1, endDate: undefined }, notificationTime: 10 };

    // findOverlappingEvents가 겹치는 이벤트를 반환하도록 설정
    (findOverlappingEvents as vi.Mock).mockReturnValue([mockEvents[0]]);

    const { result } = renderHook(() => useEventFormActions(mockEvents, mockSaveEvent, mockOnOverlap));

    await act(async () => {
      await result.current.handleSaveEvent(mockEventData);
    });

    // 겹치는 이벤트가 있으므로 onOverlap가 호출되었는지 확인
    expect(mockOnOverlap).toHaveBeenCalledWith([mockEvents[0]], mockEventData);
    expect(mockSaveEvent).not.toHaveBeenCalled(); // saveEvent는 호출되지 않았어야 함
  });
});

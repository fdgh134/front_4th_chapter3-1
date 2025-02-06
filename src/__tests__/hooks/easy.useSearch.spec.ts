import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import * as eventUtils from '../../utils/eventUtils.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    description: '프로젝트 진행 상황 공유',
    location: '회의실 A',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    description: '팀 회식',
    location: '한식당',
    date: '2024-10-02',
    startTime: '12:00',
    endTime: '13:00',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '운동',
    description: '헬스장에서 운동',
    location: '헬스장',
    date: '2024-10-15',
    startTime: '18:00',
    endTime: '19:00',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

describe('useSearch', () => {
  const currentDate = new Date('2024-10-01');

  beforeEach(() => {
    vi.spyOn(eventUtils, 'getFilteredEvents').mockImplementation((events, searchTerm) => {
      if (!searchTerm) return events;
      return events.filter(
        (event) =>
          event.title.includes(searchTerm) ||
          event.description.includes(searchTerm) ||
          event.location.includes(searchTerm)
      );
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.filteredEvents).toEqual(mockEvents);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    // 초기 렌더링
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    // 초기 상태 확인
    expect(result.current.filteredEvents).toHaveLength(3);

    // 검색어 변경
    act(() => {
      result.current.setSearchTerm('회의');
    });

    // 검색어가 현재 상태인지 확인
    expect(result.current.searchTerm).toBe('회의');

    // 필터링된 결과 확인
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('한식');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].location).toBe('한식당');

    act(() => {
      result.current.setSearchTerm('회식');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].description).toBe('팀 회식');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    expect(eventUtils.getFilteredEvents).toHaveBeenCalledWith(mockEvents, '', currentDate, 'month');

    renderHook(() => useSearch(mockEvents, currentDate, 'week'));
    expect(eventUtils.getFilteredEvents).toHaveBeenCalledWith(mockEvents, '', currentDate, 'week');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('점심 식사');
  });
});

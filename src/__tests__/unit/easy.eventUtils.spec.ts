import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const createMockEvents = (): Event[] => [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 설명',
      location: '서울',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 설명',
      location: '부산',
      date: '2024-07-03',
      startTime: '11:00',
      endTime: '12:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'EVENT 3',
      description: '세 번째 설명',
      location: '대전',
      date: '2024-07-15',
      startTime: '13:00',
      endTime: '14:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '마지막 일정',
      description: '마지막 설명',
      location: '대구',
      date: '2024-06-30',
      startTime: '15:00',
      endTime: '16:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(3);
    expect(new Set(result.map((event) => event.date))).toEqual(
      new Set(['2024-06-30', '2024-07-01', '2024-07-03'])
    );
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    const julyEvents = events.filter((event) => event.date.startsWith('2024-07'));

    expect(result).toHaveLength(julyEvents.length);
    result.forEach((event) => {
      expect(event.date.startsWith('2024-07')).toBe(true);
    });
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');

    expect(result).toHaveLength(2); // 6/30~7/6 기간의 '이벤트' 포함 이벤트
    expect(
      result.every((event) => {
        const eventDate = new Date(event.date);
        const weekStart = new Date('2024-06-30');
        const weekEnd = new Date('2024-07-06');
        return (
          eventDate >= weekStart &&
          eventDate <= weekEnd &&
          event.title.toLowerCase().includes('이벤트')
        );
      })
    ).toBe(true);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    const julyEvents = events.filter((event) => event.date.startsWith('2024-07'));

    expect(result).toHaveLength(julyEvents.length);
    expect(result.every((event) => event.date.startsWith('2024-07'))).toBe(true);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, 'EVENT', new Date('2024-07-01'), 'month');
    const expectedEvents = events.filter(
      (event) =>
        event.date.startsWith('2024-07') &&
        (event.title.toLowerCase().includes('event') ||
          event.description.toLowerCase().includes('event'))
    );

    expect(result).toHaveLength(expectedEvents.length);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = createMockEvents();
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(3);
    const dates = result.map((event) => event.date);
    expect(dates).toContain('2024-06-30');
    expect(dates).toContain('2024-07-01');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

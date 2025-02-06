import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('Event Overlap Utils', () => {
  const mockDate = new Date('2024-07-01');

  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parseDateTime', () => {
    it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
      const result = parseDateTime('2024-07-01', '09:00');
      expect(result).toEqual(new Date('2024-07-01T09:00'));
    });

    it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
      const result = parseDateTime('2024/07/01', '14:30');
      expect(result.toString()).toBe('Invalid Date');
    });

    it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
      const result = parseDateTime('2024-07-01', '14:3O');
      expect(result.toString()).toBe('Invalid Date');
    });

    it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
      const result = parseDateTime('', '14:30');
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  describe('convertEventToDateRange', () => {
    const createMockEvent = (overrides = {}): Event => ({
      id: '1',
      title: 'Test Event',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
      ...overrides,
    });
    it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
      const event = createMockEvent();
      const result = convertEventToDateRange(event);

      expect(result).toEqual({
        start: new Date('2024-07-01T09:00'),
        end: new Date('2024-07-01T17:00'),
      });
    });

    it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
      const event = createMockEvent({
        date: '2024/07/01',
        startTime: '09:00',
        endTime: '17:00',
      });
      const result = convertEventToDateRange(event);

      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });

    it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
      const event = createMockEvent({
        date: '2024-07-01',
        startTime: '',
        endTime: '',
      });
      const result = convertEventToDateRange(event);

      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });
  });

  describe('isOverlapping & findOverlappingEvents', () => {
    const createMockEvent = (id: string, startTime: string, endTime: string): Event => ({
      id,
      title: `Event ${id}`,
      date: '2024-07-01',
      startTime,
      endTime,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    });

    const mockEvents: Event[] = [
      createMockEvent('1', '09:00', '12:00'),
      createMockEvent('2', '13:00', '17:00'),
      createMockEvent('3', '11:00', '16:00'),
    ];

    describe('isOverlapping', () => {
      it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
        const event1 = createMockEvent('1', '10:00', '12:00');
        const event2 = createMockEvent('2', '11:00', '13:00');

        expect(isOverlapping(event1, event2)).toBe(true);
      });

      it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
        const event1 = createMockEvent('1', '09:00', '10:00');
        const event2 = createMockEvent('2', '11:00', '12:00');

        expect(isOverlapping(event1, event2)).toBe(false);
      });
    });

    describe('findOverlappingEvents', () => {
      it('새 이벤트와 겹치는 모든 이벤트를 반환한다', async () => {
        const newEvent = createMockEvent('4', '10:00', '14:00');
        const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);

        expect(overlappingEvents).toHaveLength(3);
        expect(overlappingEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
      });

      it('겹치는 이벤트가 없으면 빈 배열을 반환한다', async () => {
        const newEvent = createMockEvent('4', '17:00', '20:00');
        const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);

        expect(overlappingEvents).toHaveLength(0);
      });
    });
  });
});

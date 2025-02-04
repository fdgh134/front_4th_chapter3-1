import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '09:00');
    expect(result).toEqual(new Date('2024-07-01T09:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const dateString = '2024/07/01';
    const timeString = '14:30';

    const result = parseDateTime(dateString, timeString);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const dateString = '2024-07-01';
    const timeString = '14:3O'; // 'O' instead of '0'

    const result = parseDateTime(dateString, timeString);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const dateString = '';
    const timeString = '14:30';

    const result = parseDateTime(dateString, timeString);
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
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
    };

    const result = convertEventToDateRange(event);
    const expectedStart = new Date('2024-07-01T09:00');
    const expectedEnd = new Date('2024-07-01T17:00');

    expect(result.start).toEqual(expectedStart);
    expect(result.end).toEqual(expectedEnd);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'Test Event',
      date: '2024/07/01',
      startTime: '09:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'Test Event',
      date: '2024-07-01',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: 'Event 1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const event2: Event = {
      id: '2',
      title: 'Event 2',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: 'Event 1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const event2: Event = {
      id: '2',
      title: 'Event 2',
      date: '2024-07-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        title: 'Event 1',
        date: '2024-07-01',
        startTime: '09:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: 'Event 2',
        date: '2024-07-01',
        startTime: '13:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: 'Event 3',
        date: '2024-07-01',
        startTime: '11:00',
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    setupMockHandlerCreation(mockEvents);
  });

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', async () => {
    const newEvent: Event = {
      id: '4',
      title: 'New Event',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    // ✅ mockEvents를 findOverlappingEvents()에 전달
    const overlappingEvents = await findOverlappingEvents(newEvent, mockEvents);
    expect(overlappingEvents.length).toBe(3);
    expect(overlappingEvents.map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', async () => {
    const newEvent: Event = {
      id: '4',
      title: 'New Event',
      date: '2024-07-01',
      startTime: '17:00',
      endTime: '20:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const overlappingEvents = await findOverlappingEvents(newEvent, mockEvents);
    expect(overlappingEvents.length).toBe(0);
  });
});

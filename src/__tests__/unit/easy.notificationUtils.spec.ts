import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 현재 시각을 10:00으로 설정
    const now = new Date('2025-02-05T10:00:00');
    vi.setSystemTime(now);

    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      date: '2025-02-05',
      startTime: '10:10', // 10분 후 시작
      endTime: '11:10',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10 // 10분 전 알림
    };
    
    const result = getUpcomingEvents([event], now, []);
    expect(result).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-02-05T10:00:00');
    vi.setSystemTime(now);

    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      date: '2025-02-05',
      startTime: '10:10',
      endTime: '11:10',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10
    };
    
    const result = getUpcomingEvents([event], now, ['1']);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-05T10:00:00');
    vi.setSystemTime(now);

    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      date: '2025-02-05',
      startTime: '12:30',
      endTime: '13:30',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10
    };
    
    const result = getUpcomingEvents([event], now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-05T10:00:00');
    vi.setSystemTime(now);

    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      date: '2025-02-05',
      startTime: '09:30',
      endTime: '10:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10
    };
    
    const result = getUpcomingEvents([event], now, []);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      date: '2025-02-05',
      startTime: '11:00',
      endTime: '12:00',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10
    };
    
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 테스트 이벤트 일정이 시작됩니다.');
  });
});

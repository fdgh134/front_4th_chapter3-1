import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

// useInterval을 mock 함수로 만들어서 callback을 캡처할 수 있게 함
const useIntervalMock = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void) => useIntervalMock(callback),
}));

describe('useNotifications', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(new Date('2024-10-01'));
    vi.clearAllMocks();
  });
  const currentTime = new Date('2024-10-01').getTime();
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: formatDate(new Date(currentTime)),
      startTime: parseHM(currentTime + 10 * 60 * 1000), // 10분 후
      endTime: parseHM(currentTime + 60 * 60 * 1000), // 1시간 후
      description: '팀 회의입니다',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 식사',
      date: formatDate(new Date(currentTime)),
      startTime: parseHM(currentTime + 120 * 60 * 1000), // 2시간 후
      endTime: parseHM(currentTime + 180 * 60 * 1000), // 3시간 후
      description: '점심 식사',
      location: '구내 식당',
      category: '개인',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 5,
    },
  ];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // useInterval에 전달된 callback을 실행
    const [[callback]] = useIntervalMock.mock.calls;
    act(() => {
      callback();
    });

    // 현재 시간이 10:00이고, 첫 번째 이벤트는 10:10 시작, 10분 전 알림이므로
    // 이 시점에서 알림이 생성되어야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 팀 회의 일정이 시작됩니다.',
    });
    expect(result.current.notifiedEvents).toContain('1');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // useInterval에 전달된 callback을 실행하여 알림 생성
    const [[callback]] = useIntervalMock.mock.calls;
    act(() => {
      callback();
    });

    // 초기 알림 확인
    expect(result.current.notifications).toHaveLength(1);

    // 첫 번째 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });

    // 알림이 제거되었는지 확인
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // useInterval에 전달된 callback을 실행하여 첫 번째 알림 생성
    const [[callback]] = useIntervalMock.mock.calls;
    act(() => {
      callback();
    });

    // 첫 번째 알림 발생 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // useInterval에 의해 다시 체크되더라도
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 동일한 이벤트에 대한 알림이 추가되지 않아야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
  });
});

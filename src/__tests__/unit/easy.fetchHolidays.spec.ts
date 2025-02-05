import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('주어진 월의 공휴일만 반환한다', () => {
    const marchDate = new Date('2024-03-01');
    const result = fetchHolidays(marchDate);
    
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['2024-03-01']).toBe('삼일절');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const aprilDate = new Date('2024-04-01');
    const result = fetchHolidays(aprilDate);
    
    expect(Object.keys(result)).toHaveLength(0);
    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const septemberDate = new Date('2024-09-01');
    const result = fetchHolidays(septemberDate);
    
    expect(Object.keys(result)).toHaveLength(3);
    expect(result).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석'
    });
  });
});

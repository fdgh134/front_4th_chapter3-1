import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 13)).toBe(31); // 다음 년도 1월
    expect(getDaysInMonth(2024, 0)).toBe(31); // 이전 년도 12월
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const testDate = new Date('2025-02-05'); // 수요일
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2025-02-02').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2025-02-08').toISOString());
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 어플이 일-토 주를 사용하므로 일요일로 수정
    const testDate = new Date('2025-02-10'); // 월요일
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2025-02-09').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2025-02-15').toISOString());
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 어플이 일-토 주를 사용하므로 토요일로 수정
    const testDate = new Date('2025-02-22'); // 토요일
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2025-02-16').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2025-02-22').toISOString());
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const testDate = new Date('2025-12-31');
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2025-12-28').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2026-01-03').toISOString());
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const testDate = new Date('2025-01-01');
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2024-12-29').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2025-01-04').toISOString());
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const testDate = new Date('2024-02-29');
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2024-02-25').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2024-03-02').toISOString());
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const testDate = new Date('2025-02-28');
    const weekDates = getWeekDates(testDate);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString()).toBe(new Date('2025-02-23').toISOString());
    expect(weekDates[6].toISOString()).toBe(new Date('2025-03-01').toISOString());
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2024-07-01'));

    expect(weeks).toHaveLength(5); // 24년 7월은 5주로 구성
    expect(weeks[0][0]).toBeNull(); // 1일이 월요일이므로 일요일은 null
    expect(weeks[0][1]).toBe(1); // 첫째 주 월요일은 1일
    expect(weeks[4][2]).toBe(30); // 마지막 주 화요일은 30일
    expect(weeks[4][3]).toBe(31); // 마지막 주 수요일은 31일
    expect(weeks[4][4]).toBeNull(); // 이후 날짜는 null
  });
});

describe('getEventsForDay', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 1);
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 3);
    expect(events).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 0);
    expect(events).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 32);
    expect(events).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-04-16'));
    expect(week).toBe('2025년 4월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-04-01'));
    expect(week).toBe('2025년 4월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-02-28'));
    expect(week).toBe('2025년 2월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-12-31'));
    expect(week).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-02-29'));
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-02-28'));
    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const result = formatMonth(new Date('2024-07-10'));
    expect(result).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const testDate = new Date('2024-07-10');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const testDate = new Date('2024-07-01');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const testDate = new Date('2024-07-31');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const testDate = new Date('2024-06-30');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const testDate = new Date('2024-08-01');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const testDate = new Date('2024-07-10');
    expect(isDateInRange(testDate, rangeEnd, rangeStart)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 2)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const testData = new Date(2025, 0, 2);
    expect(formatDate(testData)).toBe('2025-01-02');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const testData = new Date(2025, 0, 2);
    expect(formatDate(testData, 10)).toBe('2025-01-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testData = new Date(2025, 2, 2);
    expect(formatDate(testData)).toBe('2025-03-02');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testData = new Date(2025, 0, 2);
    expect(formatDate(testData)).toBe('2025-01-02');
  });
});

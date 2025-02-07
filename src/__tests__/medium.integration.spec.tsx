import { ChakraProvider } from '@chakra-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { formatDate } from '../utils/dateUtils';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
    Toast: ({ title, description }: { title: string; description: string }) => (
      <div role="alert">
        <div>{title}</div>
        <div>{description}</div>
      </div>
    ),
  };
});

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
  // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고,
    // 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const newEvent = {
      title: '신규 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 킥오프',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId('event-list');

    const eventTitles = await within(eventList).findAllByText(newEvent.title);
    expect(eventTitles.length).toBeGreaterThan(0);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initialEvent: Event = {
      id: '1',
      title: '수정 전 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0, endDate: undefined },
      notificationTime: 10,
    };

    let currentEvents: Event[] = [initialEvent];

    // Mock 서버 응답 설정
    server.use(
      // GET 요청 처리
      http.get('/api/events', () => {
        return HttpResponse.json({ events: currentEvents });
      }),

      // PUT 요청 처리
      http.put('/api/events/:id', async ({ request }) => {
        const updatedEvent = (await request.json()) as Event;
        currentEvents = currentEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        );
        return HttpResponse.json(updatedEvent);
      })
    );

    const { user } = setup(<App />);

    // 초기 이벤트 확인
    const eventList = await screen.findByTestId('event-list');
    const initialTitle = await within(eventList).findByText('수정 전 회의');
    expect(initialTitle).toBeInTheDocument();

    // Edit 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    // 날짜 입력
    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, initialEvent.date);

    // 시간 입력
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(startTimeInput);
    await user.clear(endTimeInput);
    await user.type(startTimeInput, initialEvent.startTime);
    await user.type(endTimeInput, initialEvent.endTime);

    // 카테고리 선택
    const categorySelect = screen.getByLabelText('카테고리');
    await user.selectOptions(categorySelect, initialEvent.category);

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 이벤트 확인
    await waitFor(async () => {
      const updatedTitle = await within(eventList).findByText('수정된 회의');
      expect(updatedTitle).toBeInTheDocument();
    });

    // Toast 메시지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      })
    );
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    // 삭제할 이벤트의 초기 존재 확인
    const eventTitles = await screen.findAllByText('삭제할 이벤트');
    const targetEvent = eventTitles[0];
    expect(targetEvent).toBeInTheDocument();

    // Delete 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 후 이벤트가 없어졌는지 확인
    await screen.findByText('검색 결과가 없습니다.');
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      })
    );
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]); // 일정이 없는 상태 모킹

    const { user } = setup(<App />);

    // 주별 뷰로 변경
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 일정이 없는 것 확인
    const weekView = screen.getByTestId('week-view');
    expect(weekView).not.toContainHTML('bg-gray-100');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 주별 뷰로 변경
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 일정 표시 확인
    const weekView = screen.getByTestId('week-view');
    const eventElement = await within(weekView).findByText('주간 회의');
    expect(eventElement).toBeInTheDocument();
  });
});

describe('월간 뷰', () => {
  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);

    // 월별 뷰가 기본이므로 별도 변경 불필요

    // 일정이 없는 것 확인
    const monthView = screen.getByTestId('month-view');
    expect(monthView).not.toContainHTML('bg-gray-100');
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '월간 정기 회의',
        date: '2024-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '10월 정기 회의',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    setup(<App />);

    // 일정 표시 확인
    const monthView = screen.getByTestId('month-view');
    const eventElement = await within(monthView).findByText('월간 정기 회의');
    expect(eventElement).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 1월로 이동 (10월 -> 1월)
    const prevButton = screen.getByLabelText('Previous');
    for (let i = 0; i < 9; i++) {
      await user.click(prevButton);
    }

    // 공휴일 표시 확인
    const monthView = screen.getByTestId('month-view');
    const holidayText = await within(monthView).findByText('신정');
    expect(holidayText).toHaveStyle({ color: expect.stringMatching(/red/) });
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 회의');

    const noResultText = await screen.findByText('검색 결과가 없습니다.');
    expect(noResultText).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    const eventTitle = await within(eventList).findByText('팀 회의');
    expect(eventTitle).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    // 먼저 검색어 입력
    await user.type(searchInput, '존재하지 않는 회의');
    await screen.findByText('검색 결과가 없습니다.');

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventTitle = await within(eventList).findByText('팀 회의');
    expect(eventTitle).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    server.resetHandlers();
    toastFn.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 직접 409 Conflict 응답 설정
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({ message: '일정이 겹칩니다' }, { status: 409 });
      })
    );

    const { user } = setup(<App />);

    const newEvent = {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '새로운 회의',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    server.use(
      http.get('/api/events', () => {
        const mockEvents = [
          {
            id: '1',
            title: '테스트 회의',
            date: '2024-10-15',
            startTime: '09:00',
            endTime: '10:00',
            description: '팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none' as const, interval: 0 },
            notificationTime: 10,
          },
        ];
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ message: '일정이 겹칩니다' }, { status: 409 });
      })
    );

    const { user } = setup(<App />);

    // 초기 이벤트 확인 - 첫 번째 요소만 선택
    const eventTitles = await screen.findAllByText('테스트 회의');
    const firstEvent = eventTitles[0];
    expect(firstEvent).toBeInTheDocument();

    // 첫 번째 Edit 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 시간 수정
    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:30');

    // 저장 시도
    await user.click(screen.getByTestId('event-submit-button'));

    // 에러 토스트 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    // 현재 시간 기준으로 10분 후의 시간을 가진 이벤트 생성
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
    const hours = tenMinutesLater.getHours().toString().padStart(2, '0');
    const minutes = tenMinutesLater.getMinutes().toString().padStart(2, '0');

    server.use(
      http.get('/api/events', () => {
        const mockEvents = [
          {
            id: '1',
            title: '알림 테스트 회의',
            date: formatDate(tenMinutesLater),
            startTime: `${hours}:${minutes}`,
            endTime: '23:59',
            description: '알림 테스트',
            location: '회의실',
            category: '업무',
            repeat: { type: 'none' as const, interval: 0 },
            notificationTime: 10,
          },
        ];
        return HttpResponse.json({ events: mockEvents });
      })
    );

    // vi.useFakeTimers();를 사용하여 타이머 모킹
    vi.useFakeTimers();
    setup(<App />);

    // 타이머 진행
    await act(async () => {
      vi.advanceTimersByTime(1000); // 1초 진행
    });

    // 알림 확인
    await waitFor(() => {
      expect(screen.getByText('10분 후 알림 테스트 회의 일정이 시작됩니다.')).toBeInTheDocument();
    });

    // 타이머 리셋
    vi.useRealTimers();
  });
});

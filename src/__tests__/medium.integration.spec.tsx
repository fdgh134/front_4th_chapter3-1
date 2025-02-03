import { ChakraProvider, Toast } from '@chakra-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

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
  });

  vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
      ...actual,
      useToast: () => vi.fn(),
      useInterval: () => vi.fn()
    };
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 
    // 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 새로운 일정 정보
    const newEvent = {
      title: '신규 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 킥오프',
      location: '회의실 A',
      category: '업무'
    };

    // 일정 저장
    await saveSchedule(user, newEvent);

    // 이벤트 리스트에서 저장된 일정 확인
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(newEvent.title);
    await within(eventList).findByText(newEvent.description);
    await within(eventList).findByText(newEvent.location);
    expect(within(eventList).getByText('카테고리: ' + newEvent.category)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);
    
    // Edit 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 제목과 시간 수정
    const titleInput = screen.getByLabelText('제목');
    const endTimeInput = screen.getByLabelText('종료 시간');
    
    await user.clear(titleInput);
    await user.clear(endTimeInput);
    
    await user.type(titleInput, '수정된 회의');
    await user.type(endTimeInput, '12:00');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 변경사항 확인
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('수정된 회의');
    expect(within(eventList).getByText('12:00')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 삭제할 이벤트의 초기 존재 확인
    const eventTitle = await screen.findByText('삭제할 이벤트');
    expect(eventTitle).toBeInTheDocument();

    // Delete 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 후 이벤트가 없어졌는지 확인
    await screen.findByText('검색 결과가 없습니다.');
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 주별 뷰로 변경
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 일정이 없는 것 확인
    const weekView = screen.getByTestId('week-view');
    expect(weekView).not.toContainHTML('bg-gray-100');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents = [{
      id: '1',
      title: '주간 회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10
    }];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 주별 뷰로 변경
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 일정 표시 확인
    const weekView = screen.getByTestId('week-view');
    await within(weekView).findByText('주간 회의');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});

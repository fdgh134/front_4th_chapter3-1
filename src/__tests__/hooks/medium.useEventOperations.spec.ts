import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// Chakra UI의 useToast를 모킹(mocking)하는 코드
const toastFn = vi.fn(); 
// Vitest의 mock 함수 생성. 이 함수는 호출 여부, 호출 횟수, 
// 호출 시 전달된 인자 등을 추적할 수 있음

vi.mock('@chakra-ui/react', async () => { // @chakra-ui/react 모듈 전체를 모킹
  const actual = await vi.importActual('@chakra-ui/react'); // 실제 Chakra UI 모듈의 내용을 가져옴
  return {
    ...actual, // 기존 Chakra UI의 모든 기능을 그대로 유지
    useToast: () => toastFn, // useToast 함수를 mock 함수로 대체
  };
});
// useToast()를 호출하면 toastFn이 반환

describe('useEventOperations', () => {
  beforeEach(() => {
    toastFn.mockClear(); // useToast 함수가 호출된 내역을 초기화
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const mockEvents: Event[] = [{
      id: '1',
      title: '팀 회의',
      description: '프로젝트 진행 상황 공유',
      location: '회의실 A',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10
    }];

    setupMockHandlerCreation(mockEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.events).toEqual(mockEvents);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    server.resetHandlers();
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    const newEvent: Omit<Event, 'id'> = {
      title: '새로운 회의',
      description: '신규 프로젝트 논의',
      location: '회의실 B',
      date: '2024-10-02',
      startTime: '14:00',
      endTime: '15:00',
      category: '업무',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
  
  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    
    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent: Event = {
      id: '1',
      title: '수정된 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 수정되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
  
  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    server.resetHandlers();
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });
  
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
  
  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent({
        id: 'non-existent',
        title: '존재하지 않는 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '존재하지 않는 회의',
        location: '회의실 X',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      });
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
  
  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});


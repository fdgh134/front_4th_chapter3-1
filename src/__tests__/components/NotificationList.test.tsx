import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { NotificationList } from '../../components/NotificationList';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('알림 목록 컴포넌트', () => {
  const mockNotifications = [
    { id: '1', message: '첫 번째 알림' },
    { id: '2', message: '두 번째 알림' },
  ];

  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  it('알림 목록이 비어있을 때 아무것도 렌더링하지 않는다', () => {
    renderWithChakra(<NotificationList notifications={[]} onRemove={mockOnRemove} />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('알림을 정확히 렌더링한다', () => {
    renderWithChakra(
      <NotificationList notifications={mockNotifications} onRemove={mockOnRemove} />
    );

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onRemove 함수를 호출한다', () => {
    renderWithChakra(
      <NotificationList notifications={mockNotifications} onRemove={mockOnRemove} />
    );

    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });
});

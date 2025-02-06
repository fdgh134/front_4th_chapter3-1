import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EventDialog } from '../../components/EventDialog';
import { Event } from '../../types';
import React from 'react';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('이벤트 겹침 다이얼로그 컴포넌트', () => {
  const mockOverlappingEvents: Event[] = [
    {
      id: '1',
      title: '겹치는 일정 1',
      date: '2023-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: 'Work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '겹치는 일정 2',
      date: '2023-05-20',
      startTime: '11:30',
      endTime: '12:30',
      description: '',
      location: '',
      category: 'Personal',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const mockCancelRef = React.createRef<HTMLButtonElement>();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('겹치는 일정을 정확히 표시한다', () => {
    renderWithChakra(
      <EventDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={mockCancelRef}
      />
    );

    expect(screen.getByText('겹치는 일정 1 (2023-05-20 10:00-11:00)')).toBeInTheDocument();
    expect(screen.getByText('겹치는 일정 2 (2023-05-20 11:30-12:30)')).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onClose 함수를 호출한다', () => {
    renderWithChakra(
      <EventDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={mockCancelRef}
      />
    );

    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('계속 진행 버튼 클릭 시 onConfirm 함수를 호출한다', () => {
    renderWithChakra(
      <EventDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={mockCancelRef}
      />
    );

    const confirmButton = screen.getByText('계속 진행');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});

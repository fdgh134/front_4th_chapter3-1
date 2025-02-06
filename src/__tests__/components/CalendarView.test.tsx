import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { CalendarView } from '../../components/CalendarView';
import { Event } from '../../types';
import { formatWeek, formatMonth } from '../../utils/dateUtils';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('캘린더 뷰 컴포넌트', () => {
  const mockCurrentDate = new Date('2023-05-15');
  const mockFilteredEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2023-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: 'Work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];
  const mockNotifiedEvents: string[] = ['1'];
  const mockHolidays: { [key: string]: string } = {
    '2023-05-15': '스승의 날',
  };

  const mockOnViewChange = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
    mockOnNavigate.mockClear();
  });

  it('주간 뷰를 정확히 렌더링한다', () => {
    renderWithChakra(
      <CalendarView
        view="week"
        currentDate={mockCurrentDate}
        filteredEvents={mockFilteredEvents}
        notifiedEvents={mockNotifiedEvents}
        holidays={mockHolidays}
        onViewChange={mockOnViewChange}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText(formatWeek(mockCurrentDate))).toBeInTheDocument();
    expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('월간 뷰를 정확히 렌더링한다', () => {
    renderWithChakra(
      <CalendarView
        view="month"
        currentDate={mockCurrentDate}
        filteredEvents={mockFilteredEvents}
        notifiedEvents={mockNotifiedEvents}
        holidays={mockHolidays}
        onViewChange={mockOnViewChange}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText(formatMonth(mockCurrentDate))).toBeInTheDocument();
    expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('이전/다음 버튼 클릭 시 onNavigate 함수를 호출한다', () => {
    renderWithChakra(
      <CalendarView
        view="week"
        currentDate={mockCurrentDate}
        filteredEvents={mockFilteredEvents}
        notifiedEvents={mockNotifiedEvents}
        holidays={mockHolidays}
        onViewChange={mockOnViewChange}
        onNavigate={mockOnNavigate}
      />
    );

    const prevButton = screen.getByLabelText('Previous');
    const nextButton = screen.getByLabelText('Next');

    fireEvent.click(prevButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('prev');

    fireEvent.click(nextButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });

  it('뷰 변경 시 onViewChange 함수를 호출한다', () => {
    renderWithChakra(
      <CalendarView
        view="week"
        currentDate={mockCurrentDate}
        filteredEvents={mockFilteredEvents}
        notifiedEvents={mockNotifiedEvents}
        holidays={mockHolidays}
        onViewChange={mockOnViewChange}
        onNavigate={mockOnNavigate}
      />
    );

    const viewSelect = screen.getByLabelText('view');
    fireEvent.change(viewSelect, { target: { value: 'month' } });

    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });
});

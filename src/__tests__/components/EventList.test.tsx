import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EventList } from '../../components/EventList';
import { Event } from '../../types';

const mockEvents = [
  {
    id: '1',
    title: 'Test Event',
    date: '2023-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Test description',
    location: 'Test location',
    category: 'Work',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  },
] as Event[];

// Chakra UI 컴포넌트를 감싸는 래퍼 함수
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('이벤트 목록 컴포넌트', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
    mockOnSearchChange.mockClear();
  });

  it('이벤트를 정확히 렌더링한다', () => {
    renderWithChakra(
      <EventList
        events={mockEvents}
        notifiedEvents={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('2023-05-20')).toBeInTheDocument();
  });

  it('편집 버튼 클릭 시 onEdit 함수를 호출한다', () => {
    renderWithChakra(
      <EventList
        events={mockEvents}
        notifiedEvents={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSearchChange={mockOnSearchChange}
      />
    );

    const editButton = screen.getByLabelText('Edit event');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('삭제 버튼 클릭 시 onDelete 함수를 호출한다', () => {
    renderWithChakra(
      <EventList
        events={mockEvents}
        notifiedEvents={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSearchChange={mockOnSearchChange}
      />
    );

    const deleteButton = screen.getByLabelText('Delete event');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('검색어에 따라 이벤트를 필터링한다', () => {
    renderWithChakra(
      <EventList
        events={mockEvents}
        notifiedEvents={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        searchTerm="Test"
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});

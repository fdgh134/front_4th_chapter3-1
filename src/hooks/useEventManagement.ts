import { useState } from "react";
import { Event, EventForm } from "../types";
import { findOverlappingEvents } from "../utils/eventOverlap";

interface UseEventManagementProps {
  initialEvents?: Event[];
  onSave?: (event: Event | EventForm) => void;
  onDelete?: (id: string) => void;
}

// 유니크 ID 생성 유틸리티 함수
const generateUniqueId = () => {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const isEvent = (data: Event | EventForm): data is Event => {
  return 'id' in data;
};

export const useEventManagement = ({
  initialEvents = [],
  onSave,
  onDelete
}: UseEventManagementProps) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const saveEvent = async (eventData: Event | EventForm) => {
    // 겹치는 이벤트 확인 로직
    const overlapping = findOverlappingEvents(eventData, events);
    
    if (overlapping.length > 0) {
      // 중복 이벤트 처리 로직 (예: 콜백 함수 호출)
      return { overlapping, eventData };
    }

    const updatedEvents = isEvent(eventData)
      ? events.map(event => event.id === eventData.id ? eventData : event)
      : [...events, { ...eventData, id: generateUniqueId() } as Event];

    setEvents(updatedEvents);
    setEditingEvent(null);
    
    onSave?.(eventData);
    return { success: true, eventData };
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    onDelete?.(id);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const cancelEditing = () => {
    setEditingEvent(null);
  };

  return {
    events,
    editingEvent,
    saveEvent,
    deleteEvent,
    editEvent,
    cancelEditing
  };
};
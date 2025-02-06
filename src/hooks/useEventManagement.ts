import { useState } from 'react';
import { Event } from '../types';

interface UseEventManagementProps {
  onEdit?: (event: Event) => void;
  onReset?: () => void;
}

export const useEventManagement = ({ onEdit, onReset }: UseEventManagementProps) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const editEvent = (event: Event) => {
    console.log('useEventManagement: editEvent called', event);
    onEdit?.(event);
    setEditingEvent(event);
  };

  const cancelEditing = () => {
    console.log('useEventManagement: cancelEditing called');
    onReset?.();
    setEditingEvent(null);
  };

  return {
    editingEvent,
    editEvent,
    cancelEditing,
    setEditingEvent,
  };
};

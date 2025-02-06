import { useState } from "react";
import { Event } from "../types";

interface UseEventManagementProps {
  onEdit?: (event: Event) => void;
}

export const useEventManagement = ({
  onEdit
}: UseEventManagementProps) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);


  const editEvent = (event: Event) => {
    setEditingEvent(event);
    onEdit?.(event);
  };

  const cancelEditing = () => {
    setEditingEvent(null);
  };

  return {
    editingEvent,
    editEvent,
    cancelEditing,
    setEditingEvent
  };
};
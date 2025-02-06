import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useEventFormActions = (
  events: Event[], 
  saveEvent: (eventData: Event | EventForm) => Promise<void>,
  onOverlap?: (overlapping: Event[], eventData: Event | EventForm) => void
) => {
  const handleSaveEvent = async (eventData: Event | EventForm) => {
    const overlappingEvents = findOverlappingEvents(eventData, events);
    
    if (overlappingEvents.length > 0 && onOverlap) {
      onOverlap(overlappingEvents, eventData);
    } else {
      await saveEvent(eventData);
    }
  };

  return {
    handleSaveEvent
  };
};
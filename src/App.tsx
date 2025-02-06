import { Box, Flex, } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { EventForm } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { EventDialog } from './components/EventDialog.tsx';
import { NotificationList } from './components/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';

function App() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [eventToSave, setEventToSave] = useState<Event | EventFormType | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const formHook = useEventForm(editingEvent);
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const handleOverlap = (overlapping: Event[], eventData: Event | EventFormType) => {
    setOverlappingEvents(overlapping);
    setEventToSave(eventData);
    setIsOverlapDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    setIsOverlapDialogOpen(false);
    if (eventToSave) {
      await saveEvent(eventToSave);
      setEventToSave(null);
    }
  };

  const handleEventEdit = (event: Event) => {
    setEditingEvent(event);
    formHook.editEvent(event);
  };

  const handleEventDelete = (id: string) => {
    deleteEvent(id);
  };

  const handleRemoveNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm
          events={events}
          onOverlap={handleOverlap}
          saveEvent={saveEvent}
          formHook={formHook}
        />
        
        <CalendarView 
          view={view}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onViewChange={setView}
          onNavigate={navigate}
        />

        <EventList 
          events={filteredEvents} 
          notifiedEvents={notifiedEvents} 
          onEdit={handleEventEdit} 
          onDelete={handleEventDelete} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </Flex>

      <EventDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
      />

      <NotificationList 
        notifications={notifications} 
        onRemove={handleRemoveNotification}
      />
    </Box>
  );
}

export default App;
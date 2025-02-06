import { Box, Flex, } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { EventForm } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { EventDialog } from './components/EventDialog.tsx';
import { NotificationList } from './components/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useEventManagement } from './hooks/useEventManagement.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';

function App() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [eventToSave, setEventToSave] = useState<Event | EventFormType | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { editingEvent, editEvent, setEditingEvent } = useEventManagement({});
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
    editEvent(event);
  };

  const handleEventDelete = (id: string) => {
    deleteEvent(id);
  };

  const handleRemoveNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  // const renderWeekView = () => {
  //   const weekDates = getWeekDates(currentDate);
  //   return (
  //     <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
  //       <Heading size="md">{formatWeek(currentDate)}</Heading>
  //       <Table variant="simple" w="full">
  //         <Thead>
  //           <Tr>
  //             {weekDays.map((day) => (
  //               <Th key={day} width="14.28%">
  //                 {day}
  //               </Th>
  //             ))}
  //           </Tr>
  //         </Thead>
  //         <Tbody>
  //           <Tr>
  //             {weekDates.map((date) => (
  //               <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
  //                 <Text fontWeight="bold">{date.getDate()}</Text>
  //                 {filteredEvents
  //                   .filter((event) => new Date(event.date).toDateString() === date.toDateString())
  //                   .map((event) => {
  //                     const isNotified = notifiedEvents.includes(event.id);
  //                     return (
  //                       <Box
  //                         key={event.id}
  //                         p={1}
  //                         my={1}
  //                         bg={isNotified ? 'red.100' : 'gray.100'}
  //                         borderRadius="md"
  //                         fontWeight={isNotified ? 'bold' : 'normal'}
  //                         color={isNotified ? 'red.500' : 'inherit'}
  //                       >
  //                         <HStack spacing={1}>
  //                           {isNotified && <BellIcon />}
  //                           <Text fontSize="sm" noOfLines={1}>
  //                             {event.title}
  //                           </Text>
  //                         </HStack>
  //                       </Box>
  //                     );
  //                   })}
  //               </Td>
  //             ))}
  //           </Tr>
  //         </Tbody>
  //       </Table>
  //     </VStack>
  //   );
  // };

  // const renderMonthView = () => {
  //   const weeks = getWeeksAtMonth(currentDate);

  //   return (
  //     <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
  //       <Heading size="md">{formatMonth(currentDate)}</Heading>
  //       <Table variant="simple" w="full">
  //         <Thead>
  //           <Tr>
  //             {weekDays.map((day) => (
  //               <Th key={day} width="14.28%">
  //                 {day}
  //               </Th>
  //             ))}
  //           </Tr>
  //         </Thead>
  //         <Tbody>
  //           {weeks.map((week, weekIndex) => (
  //             <Tr key={weekIndex}>
  //               {week.map((day, dayIndex) => {
  //                 const dateString = day ? formatDate(currentDate, day) : '';
  //                 const holiday = holidays[dateString];

  //                 return (
  //                   <Td
  //                     key={dayIndex}
  //                     height="100px"
  //                     verticalAlign="top"
  //                     width="14.28%"
  //                     position="relative"
  //                   >
  //                     {day && (
  //                       <>
  //                         <Text fontWeight="bold">{day}</Text>
  //                         {holiday && (
  //                           <Text color="red.500" fontSize="sm">
  //                             {holiday}
  //                           </Text>
  //                         )}
  //                         {getEventsForDay(filteredEvents, day).map((event) => {
  //                           const isNotified = notifiedEvents.includes(event.id);
  //                           return (
  //                             <Box
  //                               key={event.id}
  //                               p={1}
  //                               my={1}
  //                               bg={isNotified ? 'red.100' : 'gray.100'}
  //                               borderRadius="md"
  //                               fontWeight={isNotified ? 'bold' : 'normal'}
  //                               color={isNotified ? 'red.500' : 'inherit'}
  //                             >
  //                               <HStack spacing={1}>
  //                                 {isNotified && <BellIcon />}
  //                                 <Text fontSize="sm" noOfLines={1}>
  //                                   {event.title}
  //                                 </Text>
  //                               </HStack>
  //                             </Box>
  //                           );
  //                         })}
  //                       </>
  //                     )}
  //                   </Td>
  //                 );
  //               })}
  //             </Tr>
  //           ))}
  //         </Tbody>
  //       </Table>
  //     </VStack>
  //   );
  // };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm
          events={events}
          onOverlap={handleOverlap}
          saveEvent={saveEvent}
          initialEvent={editingEvent}
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

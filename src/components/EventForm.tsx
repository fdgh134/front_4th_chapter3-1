import React from "react";
import { 
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { useEventForm } from "../hooks/useEventForm";
import { getTimeErrorMessage } from "../utils/timeValidation";
import { findOverlappingEvents } from "../utils/eventOverlap";
import { Event, EventForm as EventFormType, RepeatType } from "../types";
import { notificationOptions, categories } from "../constants/options";

interface EventFormProps {
  events: Event[];
  onOverlap: (overlappingEvents: Event[], eventData: Event | EventFormType) => void;
  saveEvent: (eventData: Event | EventFormType) => Promise<void>;
  initialEvent?: Event | null;
  formHook: ReturnType<typeof useEventForm>;
}

export const EventForm: React.FC<EventFormProps> = ({
  events, 
  onOverlap, 
  saveEvent, 
  formHook
}) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    resetForm,
    setTitle,
    setDate,
    handleStartTimeChange,
    handleEndTimeChange,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
  } = formHook;

  // const [localEditingEvent, setLocalEditingEvent] = useState<Event | null>(null);

  const toast = useToast();

  // useEffect(() => {
  //   if (initialEvent && initialEvent !== localEditingEvent) {
  //     setLocalEditingEvent(initialEvent);
      
  //     // 기존 데이터로 초기화되는 것을 방지하기 위해 약간의 지연 추가
  //     const timeoutId = setTimeout(() => {
  //       setTitle(initialEvent.title);
  //       setDate(initialEvent.date);
  //       setStartTime(initialEvent.startTime);
  //       setEndTime(initialEvent.endTime);
  //       setDescription(initialEvent.description || '');
  //       setLocation(initialEvent.location || '');
  //       setCategory(initialEvent.category);
  //       setIsRepeating(initialEvent.repeat.type !== 'none');
  //       setRepeatType(initialEvent.repeat.type || 'none');
  //       setRepeatInterval(initialEvent.repeat.interval || 1);
  //       setRepeatEndDate(initialEvent.repeat.endDate || '');
  //       setNotificationTime(initialEvent.notificationTime || 10);
  //     }, 100);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [initialEvent]);

  const addOrUpdateEvent = async () => {
    const missingFields = [];
    if (!title) missingFields.push('제목');
    if (!date) missingFields.push('날짜');
    if (!startTime) missingFields.push('시작 시간');
    if (!endTime) missingFields.push('종료 시간');

    if (missingFields.length > 0) {
      toast({
        title: `다음 정보를 입력해주세요: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventFormType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      onOverlap(overlapping, eventData);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
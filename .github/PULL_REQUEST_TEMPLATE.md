# Medium

## 7주차 과제 체크포인트

### 기본과제

#### Medium

- [x] 총 11개의 파일, 115개의 단위 테스트를 무사히 작성하고 통과시킨다.

#### 질문

> Q. medium.useEventOperations.spec.tsx > 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?

    Chakra UI의 useToast를 모킹(mocking)하는 코드
    Vitest의 mock 함수 생성. 이 함수는 호출 여부, 호출 횟수, 호출 시 전달된 인자 등을 추적할 수 있음

> Q. medium.integration.spec.tsx > 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?

    1. Chakra UI의 Context 제공 - Chakra의 스타일링과 테마 기능을 사용할 수 있다

    2. 테스트 환경에서도 Chakra UI 기능 활성화 - Chakra UI의 useToast() 같은 훅이나 테마 설정이 정상적으로 동작하도록 하기 위함 

    3. 전역 스타일 및 테마 적용 - 테스트 환경에서도 실제 앱과 동일한 스타일링과 동작을 유지할 수 있다

> Q. handlersUtils > 아래 여러가지 use 함수는 어떤 역할을 할까요? 어떻게 사용될 수 있을까요?

    MSW를 사용해 API 요청을 가로채고 특정한 동작을 모킹하는 핸들러를 설정하고 있다.
    use 함수들의 역할 - 각 setupMockHandler~~ 함수는 특정한 api요청을 처리하는 핸들러이다.
    이 함수들은 테스트 코드에서 api 응답을 조작하거나 특정 시나리오를 재현하는데 사용.

    setupMockHandlerCreation - 이벤트 생성
    setupMockHandlerUpdating - 이벤트 수정
    setupMockHandlerDeletion - 이벤트 삭제

    server.use(...)를 통해 특정 API 동작을 모킹하여, 테스트 환경에서 API 응답을 조작할 수 있다.

> Q. setupTests.ts > 왜 이 시간을 설정해주는 걸까요?

    테스트 실행 시점마다 시스템 시간이 다르면 결과가 변할 가능성이 있기 때문에?

### 심화 과제

- [x] App 컴포넌트 적절한 단위의 컴포넌트, 훅, 유틸 함수로 분리했는가?
- [ ] 해당 모듈들에 대한 적절한 테스트를 2개 이상 작성했는가?

## 과제 셀프회고

medium.integration.spec.tsx 작업중에 테스트 코드 작성 -> 통과 확인 -> 컴포넌트 분리 -> 테스트 실패
현상이 있어 무엇이 문제인가 코드를 다시 뜯어보았습니다.
컴포넌트 분리 과정에서 앱에 특정 기능이 작동하지 않는걸 확인했고, 그로인해 테스트가 실패가 남을 확인했습니다.
앱 기능을 수정하고 테스트 코드를 조금 손보니 이전과 같이 전부 통과되었습니다.
작성했던 useEventManagement 훅은 useEventOperations 훅과 기능적으로 충돌이 있는지 에러가 계속 나와 폐기시켰습니다..

### 기술적 성장



### 코드 품질



### 학습 효과 분석



### 과제 피드백



## 리뷰 받고 싶은 내용



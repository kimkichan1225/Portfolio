# 3D 인터랙티브 포트폴리오

React와 Three.js를 활용한 듀얼 모드 인터랙티브 포트폴리오입니다. 전통적인 웹 포트폴리오와 3D 게임 환경을 자유롭게 전환하며 경험할 수 있습니다.

## 🌟 주요 기능

### 듀얼 모드 시스템
- **웹 모드**: 스크롤 기반 포트폴리오 웹사이트
  - 프로젝트 갤러리 및 상세 정보 모달
  - 부드러운 스크롤 애니메이션
  - 다크/라이트 테마 토글
  - 이메일 복사 기능
  - 떠다니는 파티클 배경 효과

- **게임 모드**: 3D 인터랙티브 환경
  - 4개의 탐험 가능한 레벨
  - 애니메이션 캐릭터 조작
  - 문을 통한 레벨 전환
  - 인터랙티브 오브젝트 상호작용
  - 실시간 물리 엔진 (Rapier)

### 게임 모드 - 4개의 레벨

#### 레벨 1 - 시작 공간
- 자연 풍경이 있는 시작 환경
- Level 2, Level 3로 이동하는 포털 문
- 그라디언트 바닥 셰이더

#### 레벨 2 - 프로젝트 갤러리
- 3개의 프로젝트 캐비닛 (Asura, 편의점 솔루션, Void)
- E키로 각 캐비닛 상호작용 시 프로젝트 상세 정보 표시
- Level 1로 돌아가는 문

#### 레벨 3 - 기술 스택 사무실
- 4개의 기술 스택 테이블 (Frontend, Backend, Game Dev, Tools)
- 테이블 근처 접근 시 자동으로 기술 스택 표시
- Level 1과 Level 4로 이동하는 문

#### 레벨 4 - 개인 작업실
- 어두운 공간 환경
- CabinetTelevision: 연락처 정보 표시
- Wall: 프로필 정보 표시
- DeskCorner: 포트폴리오 링크 표시
- Level 3로 돌아가는 문

### 게임 기능
- **애니메이션 캐릭터**: Idle, Walk, Run 애니메이션
- **물리 기반 이동**: Rapier 물리 엔진으로 현실적인 움직임
- **스마트 카메라**: 캐릭터를 부드럽게 추적하는 고정 오프셋 카메라
- **사운드 시스템**: 발소리 및 문 열림 소리
- **커스텀 셰이더**: GLSL 기반 그라디언트 바닥 재질
- **상호작용 시스템**: 거리 기반 오브젝트 감지 및 E키 상호작용

## 🎮 조작법

### 키보드
- **WASD**: 캐릭터 이동
- **Shift**: 달리기
- **E**: 문/오브젝트와 상호작용
- **C**: 캐릭터 위치 로그 (디버그)

### 마우스
- 게임 모드에서 화면 상단에 마우스를 올리면 네비게이션 바 표시

## 🛠️ 기술 스택

### Frontend
- **React 19**: 최신 React로 구축된 UI
- **Three.js**: 3D 그래픽 렌더링
- **React Three Fiber**: React용 Three.js 렌더러
- **@react-three/drei**: Three.js 유틸리티
- **@react-three/rapier**: 물리 엔진
- **JavaScript/JSX**: 메인 프로그래밍 언어

### 개발 도구
- **Create React App**: 빌드 도구
- **Netlify**: 배포 플랫폼

### 3D Assets
- **Ultimate Animated Character Pack**: 캐릭터 모델 (Suit.glb)
- **커스텀 레벨 맵**: Level1Map.glb, Level2Map.glb, Level3Map.glb, Level4Map.glb
- **사운드**: 발소리 (Step2.wav), 문 열림 소리 (opendoor.mp3)

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/kimkichan1225/Portfolio.git
cd portfolio-game
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
```
브라우저에서 `http://localhost:3000` 자동 실행

## 🚀 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```
`build/` 폴더에 최적화된 프로덕션 빌드 생성

### Netlify 배포
```bash
netlify deploy --prod
```

## 📁 프로젝트 구조

```
portfolio-game/
├── public/
│   ├── resources/
│   │   ├── GameView/
│   │   │   └── Suit.glb                    # 캐릭터 모델
│   │   ├── Sounds/
│   │   │   ├── Step.wav
│   │   │   ├── Step1.wav
│   │   │   ├── Step2.wav
│   │   │   └── Step3.wav
│   │   ├── Ultimate Animated Character Pack/
│   │   ├── Level1Map.glb                    # 레벨 1 맵
│   │   ├── Level1Map-v2.glb
│   │   ├── Level1Map-v3.glb
│   │   ├── Level1Map-snow.glb
│   │   ├── Level2Map.glb                    # 레벨 2 맵
│   │   ├── Level2Map-v2.glb
│   │   ├── Level3Map.glb                    # 레벨 3 맵
│   │   ├── Level3Map-v2.glb
│   │   ├── Level4Map.glb                    # 레벨 4 맵
│   │   └── Level4Map-v2.glb
│   ├── sounds/
│   │   └── opendoor.mp3
│   ├── FirstProject.png
│   ├── SecondProject.png
│   ├── ThirdProject.png
│   ├── Kimkichan.png
│   └── *.pdf                                # 프로젝트 보고서
├── src/
│   ├── App.js                               # 메인 애플리케이션
│   ├── App.css                              # 메인 스타일
│   ├── useKeyboardControls.js               # 키보드 입력 훅
│   ├── TypingAnimation.js                   # 타이핑 효과 컴포넌트
│   ├── useScrollAnimation.js                # 스크롤 애니메이션 훅
│   ├── ProjectModal.js                      # 프로젝트 모달
│   ├── ProjectModal.css                     # 모달 스타일
│   ├── TutorialPopup.css                    # 튜토리얼 팝업 스타일
│   ├── PortalVortex.js                      # 포털 효과 (미사용)
│   ├── SquareForestTile.js                  # 타일 컴포넌트 (미사용)
│   ├── index.js                             # React 진입점
│   └── index.css                            # 전역 스타일
├── package.json
└── README.md
```

## 🎨 주요 컴포넌트

### App.js 핵심 구조

#### 모드 관리
- `isWebMode` 상태로 웹/게임 모드 전환
- `NavigationBar`: 모드 전환 버튼 및 다크 모드 토글

#### 게임 상태 관리
- 상태 머신 패턴 사용
- `playing_level1`, `playing_level2`, `playing_level3`, `playing_level4`
- `returning_to_level1`, `returning_to_level1_from_level3`, `returning_to_level3_from_level4`

#### 레벨 전환 시스템
- `setGameStateWithFade()`: 페이드 효과와 함께 레벨 전환
- 레벨별 `spawnPosition` 설정
- Physics 컴포넌트 key 기반 재생성으로 Rapier 월드 리셋

#### 캐릭터 시스템 (`Model` 컴포넌트)
- GLTF 캐릭터 모델 로드 및 애니메이션 (Idle, Walk, Run)
- Rapier RigidBody 기반 물리 이동
- 거리 기반 오브젝트 상호작용 감지
- 발소리 자동 재생 시스템

#### 카메라 시스템 (`CameraController` 컴포넌트)
- 고정 오프셋 카메라: `(-0.00, 28.35, 19.76)`
- 부드러운 lerp 기반 추적
- 레벨 전환 시 카메라 리셋

### 커스텀 훅

**useKeyboardControls**
- WASD, Shift, E, C 키 입력 감지
- 키 상태를 boolean 값으로 반환

**useScrollAnimation**
- IntersectionObserver 기반 스크롤 애니메이션
- 요소가 화면에 나타날 때 애니메이션 트리거

### 커스텀 셰이더

**GradientFloorMaterial**
- GLSL 기반 그라디언트 바닥 셰이더
- Three.js 그림자 매핑 지원
- 화면 좌표 기반 대각선 그라디언트

## 🔧 주요 상수

### 캐릭터 이동
- 걷기 속도: 8
- 달리기 속도: 18
- 발소리 간격: 걷기 0.6초, 달리기 0.45초

### 상호작용
- 상호작용 거리: 7 유닛
- 쿨다운: 500ms

### 카메라
- 오프셋: `(-0.00, 28.35, 19.76)`
- Lerp 속도: 2.0 (일반), 12.0 (타겟 추적)

## 📊 프로젝트 데이터

웹 모드에 표시되는 3개의 프로젝트:
1. **Asura** - Node.js + Socket.IO 멀티플레이어 액션 게임
2. **편의점 종합 솔루션** - React 19 + Supabase 통합 관리 플랫폼
3. **Void** - Unity 6 2D 액션 RPG

각 프로젝트는 다음 정보 포함:
- 제목, 설명, 기술 스택
- 프로젝트 개요, 성과, 도전 과제
- GitHub, 데모, 보고서 링크

## 🎯 개발 가이드

### 새 프로젝트 추가 (웹 모드)
1. `projectsData` 배열에 프로젝트 객체 추가 (src/App.js:14)
2. 프로젝트 이미지/비디오를 `public/` 폴더에 추가
3. 필요시 GitHub/Demo URL 및 PDF 보고서 추가

### 새 레벨 추가
1. 새 게임 상태 추가 (예: `playing_level5`)
2. 레벨 컴포넌트 생성 (GLB 파일 로드 및 렌더링)
3. `Model` 컴포넌트에 문 상호작용 로직 추가
4. `setGameStateWithFade`에 스폰 위치 추가
5. `App.js`의 Canvas 내부에 레벨 조건부 렌더링 추가

### 새 인터랙티브 오브젝트 추가
1. 오브젝트 위치 상태 추가 (예: `newObjectPosition`)
2. `Model` 컴포넌트의 `useFrame`에 거리 감지 로직 추가
3. UI 인디케이터 컴포넌트 추가
4. E키 상호작용 시 동작 정의

## 🌐 배포 설정

### Netlify 설정
프로젝트는 Netlify 배포에 최적화되어 있습니다:
- SPA 리다이렉션 지원
- React Router 호환
- 자동 빌드 및 배포

## 📝 라이선스

이 프로젝트는 개인 포트폴리오용입니다.

## 👤 개발자

**김기찬**
- Email: kimkichan1225@gmail.com
- Phone: +82 10-4225-5388
- GitHub: [github.com/kimkichan1225](https://github.com/kimkichan1225)
- Instagram: [@kim_kichan](https://www.instagram.com/kim_kichan/)

## 🙏 감사의 글

- **Ultimate Animated Character Pack**: 캐릭터 3D 모델
- **Three.js & React Three Fiber**: 3D 그래픽 라이브러리
- **Rapier**: 물리 엔진
- **사운드 에셋**: 발소리 및 효과음

---

**💡 Tip**: 상단 우측의 🎮 버튼을 클릭하여 게임 모드로 전환하고 3D 환경을 직접 탐험해보세요!

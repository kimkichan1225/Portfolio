import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, shaderMaterial, useFBX, Text } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import './App.css';
import { useKeyboardControls } from './useKeyboardControls';
import { PortalVortex, PortalVortexLevel3 } from './PortalVortex';
import { TypingAnimation } from './TypingAnimation';
import { useScrollAnimation } from './useScrollAnimation';
import { ProjectModal } from './ProjectModal';

// 프로젝트 데이터
const projectsData = [
  {
    id: 1,
    title: 'KDT 멀티 격투 게임',
    description: 'Node.js와 Socket.IO를 활용한 실시간 웹 기반 멀티플레이어 액션 게임',
    image: '/FirstProject.png',
    video: '/FirstProjectGamePlay.mp4',
    tech: ['Node.js', 'Express', 'Socket.IO', 'JavaScript', 'HTML5'],
    overview: [
      'Node.js + Express + Socket.IO 기반 실시간 멀티플레이어 3D 전투 게임',
      'Three.js를 활용한 3인칭 시점 3D 렌더링 및 캐릭터 애니메이션',
      '룸 기반 매칭 시스템 (최대 8인, 공개/비공개 방 설정)',
      '20종 이상의 다양한 무기 (근접/원거리, 4단계 등급 시스템)',
      'AI 봇 시스템 (Easy/Normal/Hard 난이도, 상태 기반 전투 AI)',
      '복잡한 전투 메커니즘 (넉백, 기절, 출혈, 방어구 파괴)',
      '2개의 맵과 캐릭터 선택 시스템 (GLTF 기반 애니메이션)',
      'AABB 충돌 감지 및 실시간 타격 판정'
    ],
    achievements: [
      '멀티플레이어 동시 접속 및 안정적인 게임 세션 관리',
      '서버 권한 기반 HP/킬/데스 검증으로 치팅 방지',
      '100ms 틱 레이트 봇 AI 시스템 구현 (상태 머신 패턴)',
      '10개 무기 자동 리스폰 시스템으로 맵 내 아이템 밀도 유지',
      'lastHitBy 추적 시스템으로 정확한 킬 어트리뷰션',
      '슬라이딩 충돌 처리 및 오브젝트 상호작용',
      '맵 경계 시스템 (맵 이탈 시 지속 데미지)',
      '캐릭터 프리뷰 시스템 (Three.js 기반 실시간 3D 미리보기)'
    ],
    challenges: [
      {
        title: '실시간 멀티플레이어 동기화',
        description: 'Socket.IO 이벤트 구조 설계로 위치/회전/애니메이션을 실시간 브로드캐스트. 서버를 HP/데미지에 대한 단일 진실 공급원으로 설정하여 클라이언트 간 불일치 방지. gameUpdate 이벤트로 플레이어 상태를 지속적으로 동기화하면서 네트워크 오버헤드 최소화.'
      },
      {
        title: '복잡한 봇 AI 행동 구현',
        description: '5가지 상태(idle/seeking_weapon/chasing/fleeing/attacking)를 가진 상태 머신 설계. 전략적 타겟팅 시스템으로 낮은 HP 적 우선순위 지정(2배 가중치). 그룹 전투 인식으로 3명 이상 적 근처에서 자동 후퇴. 무기별 애니메이션 매칭 및 난이도별 정확도 조정(60%~95%). 충돌 회피 알고리즘으로 봇이 장애물 피해 이동.'
      },
      {
        title: '무기 시스템 및 밸런싱',
        description: 'weapon_data.json에 20개 이상의 무기 정의 (데미지, 공격속도, 사거리, 특수효과). 서버/클라이언트 간 무기 데이터 동기화 및 UUID 기반 추적. 무기 픽업 시 즉시 새 무기 스폰으로 맵에 항상 10개 무기 유지. 근접/원거리 타격 판정 차별화 (즉시 판정 vs 발사체 물리). 4단계 등급 시스템으로 희귀도 및 능력치 차별화.'
      },
      {
        title: '충돌 감지 및 물리 시스템',
        description: 'AABB(Axis-Aligned Bounding Box) 기반 충돌 감지 구현. 플레이어별 고정 크기 바운딩 박스(1.3×3.2×1.3). X/Z축 개별 테스트로 벽 슬라이딩 이동 지원. 최대 0.5 유닛 단차 오르기 가능. 맵별 장애물 정의(MAP1_OBSTACLES, MAP2_OBSTACLES)로 봇 경로 탐색. 레이캐스팅 기반 리스폰 위치 계산으로 오브젝트 내부 스폰 방지.'
      },
      {
        title: '킬 어트리뷰션 및 중복 방지',
        description: 'lastHitBy 추적 시스템으로 여러 플레이어가 공격해도 마지막 타격자에게 킬 부여. killProcessed 플래그로 중복 킬 카운트 방지. 서버 권한 스코어보드 업데이트로 조작 불가. 봇/플레이어 사망 처리 분리 (봇은 서버 주도 3초 리스폰, 플레이어는 클라이언트 오버레이 + 이벤트).'
      }
    ],
    github: 'https://github.com/kimkichan1225/KDTWebGame',
    demo: 'https://kdtwebgame.onrender.com/',
    reports: [
      {
        title: '계획 보고서',
        file: '/FirstProjectPlanReport.pdf'
      },
      {
        title: '완료 보고서',
        file: '/FirstProjectFinishReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/FirstProjectPowerPoint.pdf'
      }
    ]
  },
  {
    id: 2,
    title: '편의점 종합 솔루션',
    description: 'React 19 + TypeScript로 구축한 실시간 편의점 통합 관리 플랫폼 (98% 완성)',
    image: '/SecondProject.png',
    video: '/SecondProjectPlay.mov',
    tech: ['React 19', 'TypeScript', 'Vite 6', 'Supabase', 'PostgreSQL', 'TailwindCSS', 'Zustand', 'TanStack Query'],
    overview: [
      'React 19 + TypeScript + Vite 6 기반 모던 프론트엔드 아키텍처',
      'Supabase (PostgreSQL 15) + Row Level Security (RLS) 보안 시스템',
      '3개 역할 시스템 (고객/점주/본사) 완전 분리 구조',
      '17개 테이블 + 13개 Database Functions + 15개 Triggers',
      '토스페이먼츠 결제 연동 (카드, 간편결제, 계좌이체)',
      'GPS 기반 지점 검색 (PostGIS + Google Maps API)',
      'WebSocket 실시간 알림 시스템 (주문, 재고, 매출)',
      '완전한 주문 워크플로우 (장바구니 → 결제 → 추적 → 완료)',
      '자동화된 재고 관리 (주문 시 자동 차감, 부족 알림)',
      '통합 매출 분석 (일/주/월 차트, 상품별/지점별 통계)'
    ],
    achievements: [
      '17개 테이블 완전한 ERD 설계 및 정규화',
      'Row Level Security로 테이블 수준 권한 제어',
      'PaymentKey 기반 3단계 중복 결제 방지 시스템',
      '자동화된 비즈니스 로직 (13개 함수 + 15개 트리거)',
      '실시간 WebSocket 구독으로 즉시 UI 업데이트',
      'TypeScript Strict Mode 전체 적용 (타입 안전성)',
      'Zustand + TanStack Query 최적화된 상태 관리',
      '완전한 반응형 디자인 (모바일/태블릿/데스크톱)',
      '5분 원클릭 데이터베이스 초기화 스크립트',
      'SPA 라우팅 최적화 (Render 배포 지원)'
    ],
    challenges: [
      {
        title: '복잡한 다중 역할 시스템 설계',
        description: '고객/점주/본사 3개 역할의 완전히 다른 UI/UX와 권한 체계를 단일 애플리케이션에 구현. Supabase RLS 정책으로 각 역할별로 접근 가능한 데이터를 테이블 레벨에서 제어. profiles 테이블의 role 컬럼과 auth.uid()를 조합하여 동적 권한 검증. React Router의 Protected Routes와 역할 기반 리다이렉트 로직으로 잘못된 접근 차단.'
      },
      {
        title: '중복 결제 방지 및 트랜잭션 처리',
        description: '토스페이먼츠 결제 승인 후 네트워크 오류나 새로고침으로 인한 중복 주문 생성 문제 해결. 3단계 방어: (1) 클라이언트 sessionStorage로 결제 중 상태 추적, (2) PaymentKey unique constraint로 DB 레벨 중복 방지, (3) 주문 생성 전 PaymentKey 존재 여부 체크. PostgreSQL 트랜잭션과 Supabase 함수를 활용한 원자성 보장.'
      },
      {
        title: '실시간 재고 동기화 및 자동화',
        description: '주문 완료 시 store_products 테이블의 재고를 자동으로 차감하고, 재고 부족 시 점주에게 즉시 알림. inventory_transactions 테이블로 모든 재고 변동 이력 추적. PostgreSQL Trigger를 활용하여 order_items 삽입 시 자동으로 재고 차감 및 트랜잭션 기록. Supabase Realtime으로 재고 변경 사항을 실시간 구독하여 UI 즉시 업데이트.'
      },
      {
        title: '복잡한 공급망 관리 워크플로우',
        description: '지점 → 본사 재고 요청 → 승인 → 배송 → 입고의 전체 프로세스 구현. supply_requests, supply_request_items, shipments 3개 테이블 연계. 본사 승인 시 자동으로 shipment 생성 및 배송 상태 추적. 배송 완료 시 지점 재고 자동 증가 및 inventory_transactions 기록. 상태 변경마다 관련 당사자에게 실시간 알림 발송.'
      },
      {
        title: 'TypeScript 타입 안전성 및 DX 최적화',
        description: 'Supabase의 자동 생성 타입과 커스텀 타입을 조합하여 완전한 타입 추론 환경 구축. Database.ts에서 모든 테이블/뷰/함수 타입 정의 자동 생성. Zustand 스토어와 TanStack Query에 제네릭 타입 적용으로 IDE 자동완성 지원. TypeScript Strict Mode로 null/undefined 안전성 보장. Vite의 Hot Module Replacement로 즉시 변경사항 반영.'
      }
    ],
    github: 'https://github.com/kimkichan1225/WebConvi',
    demo: 'https://webconvi.netlify.app/',
    reports: [
      {
        title: '계획 보고서',
        file: '/SecondProjectPlanReport.pdf'
      },
      {
        title: '완료 보고서',
        file: '/SecondProjectFinishReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/SecondProjectPowerPoint.pdf'
      }
    ]
  },
  {
    id: 3,
    title: '2D Unity Action RPG',
    description: 'Unity 6로 제작한 2D 액션 RPG 게임 (졸업 프로젝트)',
    image: '/ThirdProject.png',
    video: null,
    tech: ['Unity 6', 'C#', 'Windows'],
    overview: [
      'Unity 6 (6000.0.41f1) 엔진 기반 2D 액션 RPG 게임',
      '3종 무기 시스템 (검, 창, 메이스) - 각 무기별 고유 능력치 및 전투 스타일',
      '하이브리드 전투 시스템 (일반 몬스터: 실시간 액션, 보스: 턴제 카드 배틀)',
      '다단계 스테이지 구조 (튜토리얼 → 숲 맵 → 성 → 최종 보스)',
      '전략적 주사위 메커니즘 (보스전 턴제 카드 배틀에서 주사위로 승부)',
      '완전한 RPG 시스템 (레벨업, 스탯 성장, 인벤토리, 상점)',
      '세이브/로드 시스템 (3개 슬롯 지원, JSON 기반 저장)',
      '미니게임 통합 (대장간 강화, 라이프맵 스토리)'
    ],
    achievements: [
      '직관적인 조작감 구현 (WASD 이동, 대시, 점프, 벽 슬라이딩)',
      '무기별 차별화된 전투 경험 (검: 밸런스형, 창: 사거리, 메이스: 고화력)',
      '보스전 턴제 시스템으로 전략적 깊이 추가 (카드 선택 + 주사위 운)',
      '체계적인 스테이지 진행 구조 (난이도 곡선 설계)',
      '몰입형 UI/UX (체력바, 스탬프 카드, 보스 HP, 턴 타이머)',
      '안정적인 세이브/로드 시스템 (슬롯별 독립 저장)',
      '다양한 적 AI 패턴 구현 (일반 몬스터 + 턴제 보스 전투)',
      '상점/인벤토리/강화 시스템으로 플레이어 성장 경험 제공'
    ],
    challenges: [
      {
        title: '하이브리드 전투 시스템 설계',
        description: '실시간 액션 전투와 턴제 카드 배틀을 하나의 게임에 통합. 일반 몬스터는 실시간 히트박스 판정 및 넉백 시스템으로 빠른 전투감 제공. 보스전은 턴제 카드 선택 + 주사위 메커니즘으로 전환하여 전략적 깊이 추가. 전투 모드 전환 시 UI, 카메라, 입력 시스템을 완전히 교체하여 자연스러운 게임플레이 유지.'
      },
      {
        title: '무기별 밸런싱 및 차별화',
        description: '3종 무기(검/창/메이스)의 공격력, 공격속도, 사거리, 넉백 효과를 세밀하게 조정. 검: 밸런스형(중간 데미지, 빠른 속도), 창: 사거리형(낮은 데미지, 긴 리치), 메이스: 파워형(높은 데미지, 느린 속도, 강한 넉백). 각 무기의 애니메이션, 히트박스, 콤보 시스템을 개별 설계하여 플레이 스타일 차별화. 보스전에서는 무기별로 카드 능력치 보정 적용.'
      },
      {
        title: '턴제 보스 전투 및 주사위 시스템',
        description: '보스전 진입 시 실시간 액션에서 턴제 카드 배틀로 완전 전환. 플레이어와 보스가 번갈아 카드를 선택하고 주사위를 굴려 데미지 결정. 주사위 결과에 따라 카드 효과 증폭 또는 감소 (크리티컬/일반/미스). 턴 타이머, 카드 선택 UI, 주사위 애니메이션, 데미지 계산 로직 구현. 보스 HP가 0이 되면 스테이지 클리어 및 보상 지급.'
      },
      {
        title: '복잡한 스테이지 진행 및 상태 관리',
        description: '튜토리얼 → 숲 맵 → 성 → 최종 보스로 이어지는 다단계 구조 설계. 각 스테이지별 적 배치, 난이도 조정, 보상 설정. 스테이지 간 이동 시 플레이어 상태(HP, 레벨, 인벤토리) 유지. 대장간(무기 강화), 상점(아이템 구매), 라이프맵(스토리 진행) 등 서브 시스템 통합. SceneManager를 활용한 씬 전환 및 데이터 전달.'
      },
      {
        title: '세이브/로드 시스템 및 데이터 직렬화',
        description: 'JSON 기반 세이브 시스템으로 플레이어 데이터(레벨, 스탯, 인벤토리, 스테이지 진행도, 무기 강화 정보) 저장. 3개 세이브 슬롯 지원으로 여러 플레이스루 관리 가능. Application.persistentDataPath에 슬롯별 JSON 파일 저장. 로드 시 저장된 데이터 역직렬화하여 게임 상태 복원. 세이브 파일 무결성 검증 및 버전 관리로 데이터 손실 방지.'
      }
    ],
    github: 'https://github.com/kimkichan1225/2DUnityGame',
    demo: 'https://github.com/kimkichan1225/2DUnityGame/releases/download/v1.0.0/Builds.zip',
    reports: [
      {
        title: '프로젝트 보고서',
        file: '/ThirdProjectReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/ThirdProjectPowerPoint.pdf'
      }
    ]
  }
];

// 웹 모드 콘텐츠 컴포넌트
function WebModeContent({ onToggleMode, isDarkMode }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [homeRef, homeVisible] = useScrollAnimation();
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [projectsRef, projectsVisible] = useScrollAnimation();
  const [contactRef, contactVisible] = useScrollAnimation();

  return (
    <>
      <div className="web-mode-content">
        <section id="home" className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Floating Particles */}
          <div className="floating-particles">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 7}s`,
                }}
              />
            ))}
          </div>

          <div ref={homeRef} className={`fade-in ${homeVisible ? 'visible' : ''}`} style={{ textAlign: 'center', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              <span className="highlight">
                <TypingAnimation
                  text="안녕하세요! 김기찬입니다."
                  speed={150}
                />
              </span>
            </h2>
            <div style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6' }}>
              <p><strong>Full-stack & Game Developer</strong></p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
                실시간 웹 애플리케이션부터 3D 인터랙티브 경험까지,<br />
                다양한 기술 스택으로 창의적인 아이디어를<br />
                실제 동작하는 서비스로 구현하는 개발자입니다.
              </p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: '#5B7FFF', fontWeight: '500' }}>
                매일 1%씩 성장하며, 경험을 통해 더 나은 답을 찾아갑니다.
              </p>

              <div style={{
                marginTop: '3rem',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(91, 127, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  🎮 인터랙티브 포트폴리오
                </h3>
                <p style={{ lineHeight: '1.8', color: '#555' }}>
                  이 포트폴리오는 <strong>웹 모드</strong>와 <strong>게임 모드</strong> 두 가지로 구성되어 있습니다.<br />
                  <span style={{ color: '#667eea', fontWeight: '500' }}>웹 모드</span>에서는 프로젝트와 정보를 편리하게 탐색하고,<br />
                  <span style={{ color: '#667eea', fontWeight: '500' }}>게임 모드</span>에서는 3D 환경에서 직접 캐릭터를 조작하며 인터랙티브하게 경험할 수 있습니다.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                  💡 상단 우측의 <strong>🎮 버튼</strong>을 클릭하여 게임 모드로 전환해보세요!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div ref={aboutRef} className={`fade-in ${aboutVisible ? 'visible' : ''}`} style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '4rem', marginLeft: '4rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="profile-image-container" style={{ border: 'none', boxShadow: 'none', borderRadius: '10px', flexShrink: 0 }}>
                  <img src="/Kimkichan.png" alt="김기찬" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: 'none' }} />
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>📅 2001.12.25</p>
              </div>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'left' }}>안녕하세요, 김기찬입니다!</h3>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>"어떻게 하면 더 재미있는 경험을 만들 수 있을까?"</strong>라는 질문에서 시작해, <strong>웹과 게임 개발의 경계를 넘나드는</strong> 프로젝트들을 만들어왔습니다.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>Socket.IO</strong>로 구현한 <strong>멀티플레이어 액션 게임</strong>에서는 수십 명이 동시에 플레이하며 실시간으로 상호작용하는 시스템을, <strong style={{ color: '#5B7FFF' }}>React 19</strong>과 <strong style={{ color: '#5B7FFF' }}>Supabase</strong>를 활용한 편의점 솔루션에서는 실무에 바로 적용 가능한 <strong>통합 관리 시스템</strong>을 구축했습니다. <strong style={{ color: '#5B7FFF' }}>Unity</strong>로 제작한 <strong>2D RPG</strong>에서는 턴제 전투와 주사위 메커니즘이라는 독특한 조합을 시도했죠.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  지금 보고 계신 이 포트폴리오 역시 단순한 소개 페이지가 아닌, <strong style={{ color: '#5B7FFF' }}>Three.js</strong> 기반의 <strong>3D 게임 세계를 직접 탐험할 수 있는 인터랙티브 경험</strong>입니다. <strong style={{ color: '#5B7FFF' }}>TypeScript</strong>, <strong style={{ color: '#5B7FFF' }}>React Three Fiber</strong>, <strong style={{ color: '#5B7FFF' }}>커스텀 GLSL 셰이더</strong>까지 활용해 웹에서도 몰입감 있는 3D 환경을 구현했습니다.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>AI 개발 도구</strong>를 단순히 '사용'하는 것을 넘어, 이를 통해 <strong>개발 워크플로우 자체를 재설계</strong>하고 있습니다. 빠른 프로토타이핑과 반복적인 개선 사이클로 <strong>아이디어를 현실로 만드는 속도</strong>를 높이고, 더 많은 시간을 <strong>창의적인 문제 해결</strong>에 투자합니다.
                </p>
              </div>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>핵심 역량</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>게임 개발</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Unity 2D/3D 게임 개발 및 Three.js를 활용한 웹 기반 3D 인터랙티브 경험 구현
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>풀스택 개발</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  React, TypeScript, Node.js 등을 활용한 현대적인 웹 애플리케이션 풀스택 개발
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>실시간 시스템</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Socket.IO 기반 실시간 멀티플레이어 시스템 및 실시간 데이터 동기화 구현
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>AI 도구 활용</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Claude Code, Cursor 등 AI 코딩 도구를 활용한 효율적인 개발 워크플로우 구축
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div ref={projectsRef} className={`fade-in ${projectsVisible ? 'visible' : ''}`} style={{ width: '100%', maxWidth: '1200px' }}>
            <h2>Projects</h2>
            <div className="projects-grid">
              {projectsData.map((project, index) => (
                <div
                  key={project.id}
                  className={`project-card scale-in ${projectsVisible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedProject(project)}
                >
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="project-card-image"
                    />
                  )}
                  {!project.image && (
                    <div className="project-card-image"></div>
                  )}
                  <div className="project-card-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    {project.tech && (
                      <div className="project-card-tech">
                        {project.tech.map((tech, idx) => (
                          <span key={idx} className="project-tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.github || project.demo) && (
                      <div className="project-card-links">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-card-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            GitHub
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-card-link demo"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div ref={contactRef} className={`contact-info slide-in-left ${contactVisible ? 'visible' : ''}`}>
            <h2>Contact</h2>
            <p>📧 E-mail: <a href="mailto:kimkichan1225@gmail.com" style={{ color: '#667eea', textDecoration: 'none' }}>kimkichan1225@gmail.com</a></p>
            <p>📱 Phone: +82 10-4225-5388</p>
            <p>💻 GitHub: <a href="https://github.com/kimkichan1225" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>github.com/kimkichan1225</a></p>
            <p>📷 Instagram: <a href="https://www.instagram.com/kim_kichan/#" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>@kim_kichan</a></p>
            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Let's work together!</p>
            </div>
          </div>
        </section>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

// 네비게이션 바 컴포넌트
function NavigationBar({ isWebMode, onToggleMode, isDarkMode, onToggleDarkMode }) {
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    if (!isWebMode) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isWebMode]);

  const shouldShow = isWebMode || mouseY < 80;

  return (
    <nav
      className={`navigation-bar ${shouldShow ? 'visible' : 'hidden'}`}
    >
      <div className="nav-content">
        <div className="nav-left">
          <h1 className="nav-logo">3D Portfolio</h1>
        </div>
        <div className="nav-center">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#projects" className="nav-link">Projects</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-right">
          <button
            className="dark-mode-toggle"
            onClick={onToggleDarkMode}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="toggle-icon">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
          </button>
          <button
            className={`mode-toggle ${isWebMode ? 'web' : 'game'}`}
            onClick={onToggleMode}
            title={isWebMode ? '게임 모드로 전환' : '웹 모드로 전환'}
          >
            <span className="toggle-icon">
              {isWebMode ? '🎮' : '🌐'}
            </span>
            <span className="toggle-text">
              {isWebMode ? 'Game' : 'Web'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// 커스텀 팝업 함수
function showCustomPopup(message) {
  // 기존 팝업이 있다면 제거
  const existingPopup = document.getElementById('custom-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // 팝업 컨테이너 생성
  const popup = document.createElement('div');
  popup.id = 'custom-popup';
  popup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    font-family: 'Arial', sans-serif;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    z-index: 10000;
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    animation: popupSlideIn 0.3s ease-out;
    min-width: 300px;
  `;

  // 애니메이션 CSS 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popupSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    @keyframes popupSlideOut {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
    }
  `;
  document.head.appendChild(style);

  popup.textContent = message;
  document.body.appendChild(popup);

  // 2초 후 자동으로 사라지게 하기
  setTimeout(() => {
    popup.style.animation = 'popupSlideOut 0.3s ease-in';
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 300);
  }, 2000);
}

// 그라데이션 바닥을 위한 셰이더 머티리얼 (그림자 지원)
const GradientFloorMaterial = shaderMaterial(
  // Uniforms
  {
    uColorStart: new THREE.Color('#90EE90'), // 연두색 시작
    uColorEnd: new THREE.Color('#E0FFE0'),   // 훨씬 더 밝은 연두색 끝
  },
  // Vertex Shader
  `
  #include <common>
  #include <shadowmap_pars_vertex>
  
  varying vec4 vScreenPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    
    // 스크린 좌표를 varying으로 전달
    vScreenPosition = gl_Position;
    
    #include <shadowmap_vertex>
  }
  `,
  // Fragment Shader
  `
  #include <common>
  #include <packing>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>
  
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;
  varying vec4 vScreenPosition;
  varying vec3 vWorldPosition;

  void main() {
    // 스크린 좌표를 0-1 범위로 정규화
    vec2 screenUV = (vScreenPosition.xy / vScreenPosition.w) * 0.5 + 0.5;
    
    // 화면 기준 오른쪽 아래로 갈수록 밝아지는 그라데이션
    float gradient = (screenUV.x + (1.0 - screenUV.y)) * 0.5;
    vec3 baseColor = mix(uColorStart, uColorEnd, gradient);
    
    // 그림자 계산
    float shadow = getShadow(directionalShadowMap[0], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[0]);
    
    // 그림자를 기본 색상에 적용
    vec3 finalColor = baseColor * (0.3 + 0.7 * shadow);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ GradientFloorMaterial });

// 하늘을 위한 컴포넌트
function Sky() {
  return (
    <mesh>
      <sphereGeometry args={[400, 32, 32]} />
      <meshBasicMaterial color="#87CEFA" side={THREE.BackSide} />
    </mesh>
  );
}

function CameraLogger() {
  const { log } = useKeyboardControls();
  const { camera } = useThree();
  const logRef = useRef(false);

  useEffect(() => {
    // Log only when 'c' is pressed (rising edge)
    if (log && !logRef.current) {
      const pos = camera.position.toArray().map(p => p.toFixed(2));
      const rot = camera.rotation.toArray().slice(0, 3).map(r => r.toFixed(2)); // Fixed: slice to get only numbers
      console.log(`Camera Position: [${pos.join(', ')}]`);
      console.log(`Camera Rotation: [${rot.join(', ')}]`);
    }
    logRef.current = log;
  }, [log, camera]);

  return null;
}



const portalPosition = new THREE.Vector3(-20, 7.5, -20);
const portalRadius = 2;
const portalLevel3Position = new THREE.Vector3(20, 7.5, -20);
const portalLevel3Radius = 2;
const portalLevel2ToLevel1Position = new THREE.Vector3(0, 7.5, 23.5);
const portalLevel2ToLevel1Radius = 2;
const portalLevel3ToLevel1Position = new THREE.Vector3(0, 7.5, 23.5);
const portalLevel3ToLevel1Radius = 2;
const level2PortalFrontPosition = new THREE.Vector3(-20, 0, -15); // Level2 포탈 앞 위치
const level3PortalFrontPosition = new THREE.Vector3(20, 0, -15); // Level3 포탈 앞 위치

function CameraController({ gameState, characterRef }) {
  const { camera } = useThree();
  const cameraOffset = new THREE.Vector3(-0.00, 28.35, 19.76); // 고정된 카메라 오프셋
  
  // 이전 카메라 상태를 추적하기 위한 useRef
  const prevCameraState = useRef({
    isInCar: false,
    targetType: 'character'
  });

  useFrame((state, delta) => {
    if (!characterRef.current || !characterRef.current.position) return;

    if (gameState === 'entering_portal' || gameState === 'entering_portal_level3') {
      const characterPosition = characterRef.current.position;
      const targetPosition = characterPosition.clone().add(new THREE.Vector3(0, 3, 5));
      camera.position.lerp(targetPosition, delta * 2.0);
      camera.lookAt(characterPosition);
      return;
    }

    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3') {
      let targetPosition;
      let currentTargetType = 'character';
      
      // 자동차에 탑승한 상태인지 확인하고 타겟 위치 결정
      if (characterRef.current?.isInCar && 
          characterRef.current?.safeCarRef?.current) {
        // 자동차에 탑승한 경우: 캐릭터 위치 사용 (자동차와 동기화됨)
        targetPosition = characterRef.current.position;
        currentTargetType = 'car';
        
        // 자동차 상태 확인 완료
      } else {
        // 일반 상태: 캐릭터 위치 사용
        targetPosition = characterRef.current.position;
        currentTargetType = 'character';
      }
      
      // 상태 변화 추적
      if (prevCameraState.current.targetType !== currentTargetType) {
        prevCameraState.current.targetType = currentTargetType;
      }
      
      // 타겟 위치에 고정된 오프셋을 더해서 카메라 위치 계산
      const targetCameraPosition = targetPosition.clone().add(cameraOffset);
      
      // 자동차 위치 변화 감지 로그 제거
      
      // 부드러운 카메라 이동 (X, Z만 따라가고 Y는 고정)
      camera.position.lerp(targetCameraPosition, delta * 5.0);
      
      // 타겟을 바라보도록 설정
      camera.lookAt(targetPosition);
    }
  });

  return null;
}

function Model({ characterRef, gameState, setGameState }) {
  const { scene, animations } = useGLTF('/resources/Ultimate Animated Character Pack - Nov 2019/glTF/Worker_Male.gltf');
  const { actions } = useAnimations(animations, characterRef);
  
  const { forward, backward, left, right, shift, e } = useKeyboardControls();
  const [currentAnimation, setCurrentAnimation] = useState('none');
  const [isInCar, setIsInCar] = useState(false);
  const [carRef, setCarRef] = useState(null);
  const [carOriginalPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [carOriginalRotation] = useState(new THREE.Euler(0, Math.PI / 2, 0));
  const [isTransitioning, setIsTransitioning] = useState(false); // 상태 전환 중 플래그
  const [frontWheelAngle, setFrontWheelAngle] = useState(0); // 앞바퀴 조향 각도
  const [currentSpeed, setCurrentSpeed] = useState(0); // 현재 속도
  const [targetSpeed, setTargetSpeed] = useState(0); // 목표 속도
  
  // 발걸음 소리를 위한 오디오 시스템
  const stepAudioRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const stepIntervalRef = useRef(0.5); // 발걸음 간격 (초)
  
  // 자동차 소리를 위한 오디오 시스템
  const carOpenAudioRef = useRef(null);
  const carCloseAudioRef = useRef(null);
  

  
  // 안전한 참조를 위한 useRef
  const safeCharacterRef = useRef();
  const safeCarRef = useRef();
  
  // 발걸음 소리 로드 및 재생 함수
  useEffect(() => {
    // 발걸음 소리 로드 (여러 경로 시도, .wav 파일 우선)
    const audioPaths = [
      '/resources/Sounds/Step2.wav',
      '/resources/Sounds/step2.wav',
      '/Sounds/Step2.wav',
      '/resources/Sounds/Step2.mp3',
      '/resources/Sounds/step2.mp3',
      '/Sounds/Step2.mp3'
    ];
    
    // 첫 번째 경로로 시도
    stepAudioRef.current = new Audio(audioPaths[0]);
    stepAudioRef.current.volume = 1.0; // 볼륨을 최대로 설정
    stepAudioRef.current.preload = 'auto';
    
    // 오디오 로드 확인
    stepAudioRef.current.addEventListener('canplaythrough', () => {
      // 발걸음 소리 로드 완료
    });
    
    stepAudioRef.current.addEventListener('error', (e) => {
      // 다른 경로 시도
      for (let i = 1; i < audioPaths.length; i++) {
        const newAudio = new Audio(audioPaths[i]);
        newAudio.volume = 1.0;
        newAudio.preload = 'auto';
        
        newAudio.addEventListener('canplaythrough', () => {
          stepAudioRef.current = newAudio;
        });
        
        newAudio.addEventListener('error', () => {
          // 발걸음 소리 로드 실패
        });
      }
    });
  }, []);

  // 자동차 소리 로드 및 재생 함수
  useEffect(() => {
    // 자동차 문 열기 소리 로드
    carOpenAudioRef.current = new Audio('/sounds/opencar.mp3');
    carOpenAudioRef.current.volume = 0.8;
    carOpenAudioRef.current.preload = 'auto';
    
    // 자동차 문 닫기 소리 로드
    carCloseAudioRef.current = new Audio('/sounds/closecar.mp3');
    carCloseAudioRef.current.volume = 0.8;
    carCloseAudioRef.current.preload = 'auto';
    
    // 오디오 로드 확인
    carOpenAudioRef.current.addEventListener('canplaythrough', () => {
      // 자동차 문 열기 소리 로드 완료
    });
    
    carCloseAudioRef.current.addEventListener('canplaythrough', () => {
      // 자동차 문 닫기 소리 로드 완료
    });
    
    carOpenAudioRef.current.addEventListener('error', (e) => {
      console.log('자동차 문 열기 소리 로드 실패:', e);
    });
    
    carCloseAudioRef.current.addEventListener('error', (e) => {
      console.log('자동차 문 닫기 소리 로드 실패:', e);
    });
  }, []);
  
  // 발걸음 소리 재생 함수
  const playStepSound = () => {
    if (stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0; // 처음부터 재생
      stepAudioRef.current.play().catch(e => {
        // 발걸음 소리 재생 실패
      });
    }
  };

  // 자동차 소리 재생 함수들
  const playCarOpenSound = () => {
    if (carOpenAudioRef.current) {
      carOpenAudioRef.current.currentTime = 0; // 처음부터 재생
      carOpenAudioRef.current.play().catch(e => {
        console.log('자동차 문 열기 소리 재생 실패:', e);
      });
    }
  };

  const playCarCloseSound = () => {
    if (carCloseAudioRef.current) {
      carCloseAudioRef.current.currentTime = 0; // 처음부터 재생
      carCloseAudioRef.current.play().catch(e => {
        console.log('자동차 문 닫기 소리 재생 실패:', e);
      });
    }
  };


  
  // CameraController에서 접근할 수 있도록 characterRef에 저장
  useEffect(() => {
    if (characterRef.current && safeCarRef.current) {
      characterRef.current.safeCarRef = safeCarRef;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCarRef.current]);

  useEffect(() => {
    if (gameState === 'playing_level2') {
      characterRef.current.position.set(0, 0, 10);
      characterRef.current.scale.set(2, 2, 2);
    }
    
    if (gameState === 'playing_level3') {
      characterRef.current.position.set(0, 0, 15);
      characterRef.current.scale.set(2, 2, 2);
    }


    
    // Enable shadows on all meshes in the character model
    if (characterRef.current) {
      characterRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Model 컴포넌트의 handleSetCarRef 함수를 characterRef에 설정
      characterRef.current.modelHandleSetCarRef = handleSetCarRef;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    let animToPlay = 'Idle';
    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3') {
      if (!isInCar && (forward || backward || left || right)) {
        animToPlay = shift ? 'Run' : 'Walk';
      }
    } 

    if (currentAnimation !== animToPlay) {
      const oldAction = actions[currentAnimation];
      const newAction = actions[animToPlay];
      
      if (oldAction) oldAction.fadeOut(0.5);
      if (newAction) newAction.reset().fadeIn(0.5).play();

      setCurrentAnimation(animToPlay);
      
      // 걷기/뛰기 애니메이션 시작 시 발걸음 소리 시작
      if (animToPlay === 'Walk' || animToPlay === 'Run') {
        lastStepTimeRef.current = Date.now();
        stepIntervalRef.current = animToPlay === 'Run' ? 0.45 : 0.6; // 더 빠른 발걸음 간격
      }
    }
  }, [forward, backward, left, right, shift, actions, currentAnimation, gameState, isInCar]);

  // E키 상태 추적을 위한 useRef
  const lastEKeyState = useRef(false);
  
  // 자동차 탑승/하차 처리 (useFrame에서 처리)
  const handleCarInteraction = () => {
    // E키가 눌렸을 때만 처리 (상태 변화 감지)
    if (e && !lastEKeyState.current) {
      if (gameState === 'playing_level2' && (characterRef.current?.carRef || safeCarRef.current)) {
        if (!isInCar && !isTransitioning) {
          // 자동차 탑승
          enterCar();
        } else if (isInCar && !isTransitioning) {
          // 자동차 하차
          exitCar();
        }
      }
    }
    
    // E키 상태 업데이트
    lastEKeyState.current = e;
  };

  // carRef 설정 함수
  const handleSetCarRef = (ref) => {
    if (ref && characterRef.current) {
      // 안전한 참조에 저장 (ref는 이미 자동차 모델 자체)
      safeCharacterRef.current = characterRef.current;
      safeCarRef.current = ref;
      
      // characterRef.current에도 저장
      characterRef.current.carRef = ref;
      
      // 상태도 업데이트
      setCarRef(ref);
      
            // 자동차의 월드 위치 계산
      if (ref.position) {
        const worldPosition = new THREE.Vector3();
        ref.getWorldPosition(worldPosition);
        ref.worldPosition = worldPosition;
      }
    }
  };

  const enterCar = () => {
    if (!safeCarRef.current || isInCar || isTransitioning) {
      return;
    }
    
    // 자동차 문 열기 소리 재생
    playCarOpenSound();
    
    // 상태 전환 중 플래그 설정
    setIsTransitioning(true);
    
    // 즉시 탑승 상태 설정
    setIsInCar(true);
    
    // 안전한 참조에 상태 저장
    if (safeCharacterRef.current) {
      safeCharacterRef.current.isInCar = true;
      safeCharacterRef.current.carRef = safeCarRef.current;
      
      // characterRef.current에도 상태 저장
      if (characterRef.current) {
        characterRef.current.isInCar = true;
        characterRef.current.carRef = safeCarRef.current;
      }
    }
    
    // 캐릭터를 자동차 중앙으로 이동
    if (safeCharacterRef.current && safeCarRef.current) {
      const carPosition = safeCarRef.current.position.clone();
      safeCharacterRef.current.position.copy(carPosition);
      
      // 캐릭터 방향을 자동차가 바라보는 방향으로 변경
      safeCharacterRef.current.rotation.y = safeCarRef.current.rotation.y;
      
      // 캐릭터를 자동차 중앙으로 이동 완료
    }
    
    // 상태 전환 완료
    setIsTransitioning(false);
  };

  const exitCar = () => {
    if (!safeCarRef.current || !isInCar || isTransitioning) {
      return;
    }
    
    // 자동차 문 닫기 소리 재생
    playCarCloseSound();
    
    // 상태 전환 중 플래그 설정
    setIsTransitioning(true);
    
    // 즉시 하차 상태 설정
    setIsInCar(false);
    
    // 안전한 참조에 상태 저장
    if (safeCharacterRef.current) {
      safeCharacterRef.current.isInCar = false;
      safeCharacterRef.current.carRef = null;
      
      // characterRef.current에도 상태 제거
      if (characterRef.current) {
        characterRef.current.isInCar = false;
        characterRef.current.carRef = null;
      }
    }
    
    // 자동차를 원래 위치로 복원
    if (safeCarRef.current) {
      safeCarRef.current.position.copy(carOriginalPosition);
      safeCarRef.current.rotation.copy(carOriginalRotation);
    }
    
    // 캐릭터를 자동차 바깥으로 이동
    if (safeCharacterRef.current && safeCarRef.current) {
      const exitPosition = safeCarRef.current.position.clone().add(
        new THREE.Vector3(3, 0, 0).applyEuler(safeCarRef.current.rotation)
      );
      safeCharacterRef.current.position.copy(exitPosition);
    }
    
    // 상태 전환 완료
    setIsTransitioning(false);
    setCurrentSpeed(0); // 속도 초기화
    setTargetSpeed(0); // 목표 속도 초기화
  };

  useFrame((state, delta) => {
    // 자동차 상호작용 처리
    handleCarInteraction();
    
    // characterRef.current 손실 시 safeCharacterRef.current 사용
    const currentCharacter = characterRef.current || safeCharacterRef.current;
    if (!currentCharacter) return;

    if (gameState === 'entering_portal') {
      const portalCenter = portalPosition.clone();
      currentCharacter.position.lerp(portalCenter, delta * 2.0);
      currentCharacter.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), delta * 2);

      if (currentCharacter.scale.x < 0.05) { 
        if (gameState !== 'switched') {
          setGameState('playing_level2');
        }
      }
      return;
    }
    
    if (gameState === 'entering_portal_level3') {
      const portalCenter = portalLevel3Position.clone();
      currentCharacter.position.lerp(portalCenter, delta * 2.0);
      currentCharacter.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), delta * 2);

      if (currentCharacter.scale.x < 0.05) { 
        if (gameState !== 'switched_level3') {
          setGameState('playing_level3');
        }
      }
      return;
    }

    if (gameState === 'entering_portal_back_to_level1') {
      // Level1로 바로 이동하고 Level2 포탈 앞에 위치
      currentCharacter.position.copy(level2PortalFrontPosition);
      currentCharacter.scale.set(2, 2, 2);
      setGameState('playing_level1');
      return;
    }

    if (gameState === 'entering_portal_level3_to_level1') {
      // Level1로 바로 이동하고 Level3 포탈 앞에 위치
      currentCharacter.position.copy(level3PortalFrontPosition);
      currentCharacter.scale.set(2, 2, 2);
      setGameState('playing_level1');
      return;
    }
    
    const isPlaying = gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3';
    if (!isPlaying) return;

    const speed = shift ? 0.3 : 0.1;
    const direction = new THREE.Vector3();
    
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      const targetAngle = Math.atan2(direction.x, direction.z);
      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
      currentCharacter.quaternion.slerp(targetQuaternion, 0.25);
      currentCharacter.position.add(direction.multiplyScalar(speed));
      
      // 발걸음 소리 재생
      if (!isInCar && (currentAnimation === 'Walk' || currentAnimation === 'Run')) {
        const currentTime = Date.now();
        if (currentTime - lastStepTimeRef.current > stepIntervalRef.current * 1000) {
          playStepSound();
          lastStepTimeRef.current = currentTime;
        }
      }
    }

    if (gameState === 'playing_level1') {
      const characterPos = currentCharacter.position.clone();
      
      // Check Level2 portal
      const portalPos = portalPosition.clone();
      characterPos.y = 0;
      portalPos.y = 0;
      const distanceToPortal = characterPos.distanceTo(portalPos);
      if (distanceToPortal < portalRadius) {
        setGameState('entering_portal');
        return;
      }
      
      // Check Level3 portal
      const portalLevel3Pos = portalLevel3Position.clone();
      const characterPosLevel3 = currentCharacter.position.clone();
      characterPosLevel3.y = 0;
      portalLevel3Pos.y = 0;
      const distanceToPortalLevel3 = characterPosLevel3.distanceTo(portalLevel3Pos);
      if (distanceToPortalLevel3 < portalLevel3Radius) {
        setGameState('entering_portal_level3');
      }
    }

    if (gameState === 'playing_level2') {
      if (isInCar && safeCarRef.current) {
        // 자동차 이동 로직 (후륜구동 + 전륜조향 + 가속도 시스템)
        if (safeCarRef.current) {
          const car = safeCarRef.current;
          const maxSpeed = shift ? 1.2 : 0.8; // 최대 속도
          
          // 목표 속도 설정
          let newTargetSpeed = 0;
          if (forward) newTargetSpeed = maxSpeed;
          else if (backward) newTargetSpeed = -maxSpeed;
          
          setTargetSpeed(newTargetSpeed);
          
          // 가속도 적용 (부드러운 가속/감속)
          const acceleration = 0.015; // 가속도 (조금 느리게)
          const deceleration = 0.015; // 감속도 (더 빠르게)
          
          if (Math.abs(newTargetSpeed - currentSpeed) > 0.01) {
            if (newTargetSpeed > currentSpeed) {
              // 가속
              setCurrentSpeed(prev => Math.min(prev + acceleration, newTargetSpeed));
            } else if (newTargetSpeed < currentSpeed) {
              // 감속
              setCurrentSpeed(prev => Math.max(prev - deceleration, newTargetSpeed));
            }
          }
          
          // 현재 속도로 이동 계산
          const speed = currentSpeed;
          
          // 앞바퀴 조향 (A/D키) - 독립적으로 처리 (더 빠르게)
          if (left) {
            setFrontWheelAngle(prev => Math.max(prev - 0.02, -0.2)); // 좌회전 (최대 -0.2, 더 빠르게)
          } else if (right) {
            setFrontWheelAngle(prev => Math.min(prev + 0.02, 0.2)); // 우회전 (최대 0.2, 더 빠르게)
          } else {
            // 중앙으로 복귀 (매우 부드럽게)
            setFrontWheelAngle(prev => {
              if (Math.abs(prev) < 0.01) return 0;
              return prev > 0 ? prev - 0.005 : prev + 0.005;
            });
          }
          
          // 전진/후진 (후륜구동) - 앞바퀴 조향에 따라 회전
          if (Math.abs(speed) > 0.01) { // 속도가 있을 때만 이동
            const moveSpeed = speed; // speed는 이미 방향이 포함됨 (양수: 전진, 음수: 후진)
            
            // 앞바퀴 조향이 있을 때만 회전
            if (Math.abs(frontWheelAngle) > 0.01) {
              // 조향 각도에 따른 회전 (매우 부드럽게)
              const turnSpeed = -frontWheelAngle * moveSpeed * 0.2; // 회전 속도 원래대로
              car.rotation.y += turnSpeed; // 회전 방향 수정
            }
            
            // 차량 이동 (회전된 방향으로)
            car.position.add(car.getWorldDirection(new THREE.Vector3()).multiplyScalar(moveSpeed));
            
            // 바퀴 회전
            if (car.wheels) {
              const wheelSpeed = Math.abs(moveSpeed) * 30;
              
              // 앞바퀴: 조향이 없을 때만 회전 + 조향이 있을 때는 조향만
              if (car.frontWheels) {
                car.frontWheels.forEach(wheel => {
                  // 원래 위치로 복원 (z축 고정)
                  wheel.position.z = wheel.originalPosition.z;
                  
                  // 조향이 거의 없을 때만 회전 처리 (계속 굴러가도록)
                  if (Math.abs(frontWheelAngle) < 0.01 && Math.abs(moveSpeed) > 0.01) {
                    wheel.rotation.x -= wheelSpeed; // 누적 회전 (계속 굴러감)
                  } else {
                    wheel.rotation.x = wheel.originalRotation.x; // 조향이 있으면 원래 위치로
                  }
                  
                  // 조향 처리 (항상 적용)
                  wheel.rotation.y = wheel.originalRotation.y - frontWheelAngle; // y축 조향 (방향 수정)
                });
              }
              
              // 뒷바퀴: 회전만
              if (car.rearWheels) {
                car.rearWheels.forEach(wheel => {
                  wheel.rotation.x -= wheelSpeed;
                });
              }
            }
          } else {
            // 정지 시 앞바퀴만 조향 (z축 고정, y축 조향, 회전 없음)
            if (car.frontWheels) {
              car.frontWheels.forEach(wheel => {
                // 원래 위치로 복원 (z축 고정)
                wheel.position.z = wheel.originalPosition.z;
                
                // 회전은 하지 않고 조향만 처리
                wheel.rotation.x = wheel.originalRotation.x; // 회전하지 않음
                wheel.rotation.y = wheel.originalRotation.y - frontWheelAngle; // y축 조향만
              });
            }
          }
          
          // 자동차에 탑승한 상태에서는 항상 캐릭터를 자동차와 동기화
          if (safeCharacterRef.current && isInCar) {
            safeCharacterRef.current.position.copy(car.position);
            safeCharacterRef.current.rotation.y = car.rotation.y;
          }
          
          // CameraController에서 접근할 수 있도록 속도 정보 저장
          if (safeCharacterRef.current) {
            safeCharacterRef.current.currentSpeed = currentSpeed;
            safeCharacterRef.current.isMoving = Math.abs(currentSpeed) > 0.01;
          }
          

        }
      } else if (safeCharacterRef.current) {
        // 일반 캐릭터 이동
        const characterPos = safeCharacterRef.current.position.clone();
        
        // Check Level2 to Level1 portal
        const portalLevel2ToLevel1Pos = portalLevel2ToLevel1Position.clone();
        characterPos.y = 0;
        portalLevel2ToLevel1Pos.y = 0;
        const distanceToPortalLevel2ToLevel1 = characterPos.distanceTo(portalLevel2ToLevel1Pos);
        if (distanceToPortalLevel2ToLevel1 < portalLevel2ToLevel1Radius) {
          setGameState('entering_portal_back_to_level1');
        }
      }
    }

    // Level3에서 Level1로 가는 포탈 체크
    if (gameState === 'playing_level3' && currentCharacter) {
      const characterPos = currentCharacter.position.clone();
      const portalLevel3ToLevel1Pos = portalLevel3ToLevel1Position.clone();
      characterPos.y = 0;
      portalLevel3ToLevel1Pos.y = 0;
      const distanceToPortalLevel3ToLevel1 = characterPos.distanceTo(portalLevel3ToLevel1Pos);
      
      if (distanceToPortalLevel3ToLevel1 < portalLevel3ToLevel1Radius) {
        setGameState('entering_portal_level3_to_level1');
      }
    }


  });

  return (
    <>
    <primitive 
      ref={characterRef} 
      object={scene} 
      scale={2} 
      castShadow 
      receiveShadow 
        visible={!isInCar} // 자동차 탑승 시 투명하게
      />
    </>
  );
}

useGLTF.preload('/resources/Ultimate Animated Character Pack - Nov 2019/glTF/Casual_Male.gltf');

function SpeechBubble({ position, text, ...props }) {
  const meshRef = useRef();
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(false);

  // 텍스트 로딩을 위한 딜레이 - 프리로드된 텍스트가 있으므로 더 빠르게
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={meshRef} position={position} {...props}>
      {/* 말풍선 테두리 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4.2, 1.7]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      {/* 말풍선 배경 */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 1.5]} />
        <meshBasicMaterial color="white" transparent opacity={0.95} />
      </mesh>
      {/* 텍스트 - 짧은 딜레이 후 표시 */}
      {isVisible && (
        <Suspense fallback={null}>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.4}
            color="black"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
            textAlign="center"
          >
            {text}
          </Text>
        </Suspense>
      )}
    </group>
  );
}

function NPCCharacter({ position, playerRef, ...props }) {
  const npcRef = useRef();
  const { scene, animations } = useGLTF('/resources/Ultimate Animated Character Pack - Nov 2019/glTF/Casual_Male.gltf');
  const { actions } = useAnimations(animations, npcRef);

  const [isPlayerNear, setIsPlayerNear] = useState(false);
  // const { camera } = useThree(); // 미사용
  const initialRotationY = useRef(0); // 초기 Y 회전각 저장

  // NPC 모델을 복사해서 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  // 현재 애니메이션 상태 추적
  const [currentAnim, setCurrentAnim] = useState(null);

  // 통합된 useFrame - 위치, 애니메이션, 거리 체크
  useFrame(() => {
    if (!npcRef.current) return;

    // 1. NPC 위치 강제 설정
    const currentPos = npcRef.current.position;
    const targetPos = new THREE.Vector3(...position);
    
    if (currentPos.distanceTo(targetPos) > 0.1) {
      npcRef.current.position.copy(targetPos);
    }

    // 1.1. 초기 회전각 설정 및 저장 (첫 번째 프레임에서만)
    if (initialRotationY.current === 0) {
      const initialAngle = Math.PI / 4; // 45도 (π/4 라디안)
      npcRef.current.rotation.y = initialAngle;
      initialRotationY.current = initialAngle;
    }

    // 1.5. NPC 회전 로직
    if (playerRef.current) {
      const currentAngle = npcRef.current.rotation.y;
      let targetAngle;

      if (isPlayerNear) {
        // 플레이어가 가까이 있을 때: 플레이어를 바라봄
        const npcPos = npcRef.current.position;
        const playerPos = playerRef.current.position;
        
        // Y축만 회전하도록 설정 (좌우 회전만)
        const direction = new THREE.Vector3();
        direction.subVectors(playerPos, npcPos);
        direction.y = 0; // Y축 성분 제거 (위아래 회전 방지)
        direction.normalize();
        
        targetAngle = Math.atan2(direction.x, direction.z);
      } else {
        // 플레이어가 멀리 있을 때: 원래 각도로 돌아감
        targetAngle = initialRotationY.current;
      }
      
      // 각도 차이 계산 (최단 경로로 회전)
      let angleDiff = targetAngle - currentAngle;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // 부드러운 회전 (lerp)
      npcRef.current.rotation.y += angleDiff * 0.1;
    }

    // 2. 플레이어와의 거리 체크
    if (playerRef.current) {
      const npcPos = npcRef.current.position;
      const playerPos = playerRef.current.position;
      const distance = npcPos.distanceTo(playerPos);
      
      const nearDistance = 8;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
    }

    // 3. 애니메이션 관리
    if (actions && Object.keys(actions).length > 0) {
      const targetAnim = isPlayerNear ? 'Victory' : 'Idle';
      
      if (currentAnim !== targetAnim && actions[targetAnim]) {
        // 이전 애니메이션 정지
        if (currentAnim && actions[currentAnim]) {
          actions[currentAnim].stop();
        }
        
        // 새 애니메이션 시작
        actions[targetAnim].reset().setLoop(THREE.LoopRepeat).play();
        setCurrentAnim(targetAnim);
      }
    }
  });

  return (
    <>
      <primitive 
        ref={npcRef} 
        object={scene} 
        scale={2} 
        castShadow 
        receiveShadow 
        {...props}
      />
      {/* 말풍선 */}
      {isPlayerNear && (
        <SpeechBubble position={[position[0], position[1] + 8.5, position[2]]} text="첫번쨰 프로젝트에 오신걸 환영합니다! 🎉" />
      )}
    </>
  );
}

function PortalBase(props) {
  const { scene } = useGLTF('/portalbase.glb');
  
  // 포털베이스 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/portalbase.glb');

function PathStone(props) {
  const { scene } = useGLTF('/resources/Nature-Kit/Models/GLTF-format/path_stone.glb');
  
  // 패스스톤의 모든 메시에 그림자 속성 추가
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return <primitive object={scene} {...props} />;
}

useGLTF.preload('/resources/Nature-Kit/Models/GLTF-format/path_stone.glb');

function SmallStoneFlatA(props) {
  const { scene } = useGLTF('/resources/Nature-Kit/Models/GLTF-format/stone_smallFlatA.glb');
  
  // 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/resources/Nature-Kit/Models/GLTF-format/stone_smallFlatA.glb');

function PalmTree(props) {
  const fbx = useFBX('/resources/Ultimate Nature Pack - Jun 2019/FBX/PalmTree_4.fbx');
  
  // 팜트리 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedTree = useMemo(() => {
    const cloned = fbx.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [fbx]);
  
  return <primitive object={clonedTree} {...props} />;
}

// FBX 파일은 preload 방식이 다름
// useFBX.preload('/resources/Ultimate Nature Pack - Jun 2019/FBX/PalmTree_1.fbx');

// RaceFuture 컴포넌트 추가
function RaceFuture({ onCarRef, characterRef, ...props }) {
  const { scene } = useGLTF('/resources/kenney_car-kit/Models/GLB-format/race-future.glb');
  const carRef = useRef();
  
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // 바퀴 참조 저장 (앞바퀴와 뒷바퀴 구분)
    cloned.wheels = [];
    cloned.frontWheels = [];
    cloned.rearWheels = [];
    
    cloned.traverse((child) => {
      if (child.name && child.name.includes('wheel')) {
        cloned.wheels.push(child);
        
        // 앞바퀴와 뒷바퀴 구분
        if (child.name.includes('front')) {
          cloned.frontWheels.push(child);
          // 앞바퀴의 원래 위치와 회전 저장 (z축 고정용)
          child.originalPosition = child.position.clone();
          child.originalRotation = child.rotation.clone();
        } else if (child.name.includes('back') || child.name.includes('rear')) {
          cloned.rearWheels.push(child);
        }
      }
    });
    
    // 자동차의 초기 위치 설정
    cloned.position.set(props.position[0], props.position[1], props.position[2]);
    cloned.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2]);
    
    // 바퀴 분류 및 위치 설정 완료

    return cloned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, props.position, props.rotation]);

  useEffect(() => {
    if (onCarRef && carRef.current && !window.raceFutureInitialized) {
      window.raceFutureInitialized = true; // 전역 플래그로 중복 실행 방지
      console.log('RaceFuture 초기화 시작');
      
      // 즉시 호출하되, characterRef 설정이 완료된 후에만
      const checkAndCall = () => {
        if (characterRef?.current?.handleSetCarRef) {
          onCarRef(clonedScene);
        } else {
          setTimeout(checkAndCall, 50);
        }
      };
      checkAndCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // Model 컴포넌트에 carRef 설정 함수 추가
  useEffect(() => {
    if (characterRef?.current && !window.handleSetCarRefSet) {
      window.handleSetCarRefSet = true; // 중복 설정 방지
      
      // Model 컴포넌트의 handleSetCarRef 함수를 직접 호출할 수 있도록 설정
      characterRef.current.handleSetCarRef = (ref) => {
        if (ref) {
          // 바퀴 참조를 ref에 추가
          ref.wheels = clonedScene.wheels;
          ref.frontWheels = clonedScene.frontWheels;
          ref.rearWheels = clonedScene.rearWheels;
          
          // Model 컴포넌트의 handleSetCarRef 함수 직접 호출
          if (characterRef.current.modelHandleSetCarRef) {
            characterRef.current.modelHandleSetCarRef(ref);
          }
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene.frontWheels, clonedScene.rearWheels]);

  // 실시간으로 월드 위치 업데이트
  useFrame(() => {
    if (carRef.current) {
      // 월드 위치 계산 및 저장
      const worldPosition = new THREE.Vector3();
      carRef.current.getWorldPosition(worldPosition);
      carRef.current.worldPosition = worldPosition;
    }
  });

  return <primitive ref={carRef} object={clonedScene} {...props} />;
}
useGLTF.preload('/resources/kenney_car-kit/Models/GLB-format/race-future.glb');

// 둥근 모서리를 가진 정육면체 컴포넌트
function RoundedCube({ position, scale, ...props }) {
  const geometry = useMemo(() => {
    // RoundedBoxGeometry를 사용하여 둥근 모서리 정육면체 생성
    return new THREE.BoxGeometry(1, 1, 1, 2, 2, 2, 0.1); // 마지막 매개변수가 둥근 정도
  }, []);

  return (
    <mesh geometry={geometry} position={position} scale={scale} {...props}>
      <meshStandardMaterial 
        color="white" 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// GitHub Cat 컴포넌트 추가
function GitHubCat(props) {
  const { scene } = useGLTF('/githubcat.glb');
  
  // GitHub Cat 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 동상처럼 어두운 회색 재질 적용
        child.material = new THREE.MeshStandardMaterial({
          color: '#404040', // 더 어두운 회색
          roughness: 0.8,
          metalness: 0.2
        });
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// Mailbox 컴포넌트 추가
function Mailbox(props) {
  const { scene } = useGLTF('/mailbox.glb');
  
  // Mailbox 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 동상처럼 어두운 회색 재질 적용
        child.material = new THREE.MeshStandardMaterial({
          color: '#404040', // 더 어두운 회색
          roughness: 0.8,
          metalness: 0.2
        });
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// GitHub Cat과 RoundedCube를 묶는 그룹 컴포넌트
function GitHubCatGroup({ position = [0, 0, 0], characterRef, level = 1, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - level에 따라 다른 링크 사용
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // level에 따라 다른 GitHub URL을 새 탭에서 열기
      const githubUrl = level === 3 
        ? 'https://github.com/kimkichan-1/kdt-game'  // level3: KDT-Game 프로젝트
        : 'https://github.com/kimkichan-1';          // level1: 프로필 페이지
      window.open(githubUrl, '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal, level]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (GitHub Cat의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
             {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
       {showPortal && (
         <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
           {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
           <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
             <planeGeometry args={[1, 1]} />
             <vortexMaterial 
               ref={portalMaterialRef}
               transparent={true}
               opacity={portalScale} // 거리에 따라 투명도도 변화
               uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
               uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
             />
           </mesh>
         </group>
       )}
      
      {/* 정육면체 앞면에 "Github" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Github
      </Text>
      
      {/* GitHub Cat 모델 */}
      <GitHubCat 
        position={[0, 6.2, 0]} 
        scale={[2.3, 2.3, 2.3]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Instagram Logo 컴포넌트 추가
function InstagramLogo(props) {
  const { scene } = useGLTF('/instagramlogo.glb');
  
  // Instagram Logo 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 원래 색상 유지 (재질 변경하지 않음)
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// Mailbox와 RoundedCube를 묶는 그룹 컴포넌트
function MailboxGroup({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - 이메일 주소 복사
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // 이메일 주소를 클립보드에 복사
      navigator.clipboard.writeText('vxbc52@gmail.com').then(() => {
        // 복사 완료 팝업 표시
        showCustomPopup('vxbc52@gmail.com이 복사되었습니다.');
      }).catch(() => {
        // 클립보드 복사 실패 시 대체 방법
        const textArea = document.createElement('textarea');
        textArea.value = 'vxbc52@gmail.com';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCustomPopup('vxbc52@gmail.com이 복사되었습니다.');
      });
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (Mailbox의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
              uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
            />
          </mesh>
        </group>
      )}
      
      {/* 정육면체 앞면에 "Mail" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Mail
      </Text>
      
      {/* Mailbox 모델 */}
      <Mailbox 
        position={[0, 6, 0]} 
        scale={[2.3, 2.3, 2.3]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// 공사장 바리게이트 펜스 컴포넌트
function ConstructionBarrier({ position = [0, 0, 0], ...props }) {
  return (
    <group position={position} scale={1.6} {...props}>
      {/* 바리게이트 지지대들 */}
      {[-6, -3, 0, 3, 6].map((x, index) => (
        <mesh key={`support-${index}`} position={[x, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 3]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      ))}
      
      {/* 상단 가로 막대 */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 중간 가로 막대 */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 하단 가로 막대 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 경고 텍스트 "개발 중" */}
      <Text
        position={[0, 2.7, 0.15]}
        fontSize={0.6}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        개발 중
      </Text>
      
      {/* 경고 텍스트 "UNDER CONSTRUCTION" */}
      <Text
        position={[0, 2.4, 0.15]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        UNDER CONSTRUCTION
      </Text>
      
      {/* 경고 텍스트 "KEEP OUT" */}
      <Text
        position={[0, 2.1, 0.15]}
        fontSize={0.3}
        color="red"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        KEEP OUT
      </Text>
      
      {/* 경고 아이콘들 (느낌표) */}
      {[-4.5, -1.5, 1.5, 4.5].map((x, index) => (
        <Text
          key={`warning-${index}`}
          position={[x, 2.7, 0.15]}
          fontSize={0.45}
          color="red"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          fontWeight="bold"
        >
          !
        </Text>
      ))}
    </group>
  );
}

// Game Start 버튼 컴포넌트
function GameStartButton({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - 게임 사이트로 이동
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // 게임 사이트를 새 탭에서 열기
      window.open('https://kdtwebgame.onrender.com/', '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (버튼 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 게임 시작 버튼 사각형 */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.8]} />
        <meshStandardMaterial 
          color="#4CAF50" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* 버튼 앞면에 "Game Start" 텍스트 */}
      <Text
        position={[0, 1.5, 0.41]} // 버튼 앞면에 위치
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Game Start
      </Text>
      
      {/* 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[5, 5.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[8.2 * portalScale, 8.2 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#4CAF50')}  // 초록색
              uColorEnd={new THREE.Color('#81C784')}    // 밝은 초록색
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Instagram Logo와 RoundedCube를 묶는 그룹 컴포넌트
function InstagramGroup({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - Instagram URL 열기
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // Instagram URL을 새 탭에서 열기
      window.open('https://www.instagram.com/kim_kichan/#', '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (Instagram Logo의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
              uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
            />
          </mesh>
        </group>
      )}
      
      {/* 정육면체 앞면에 "SNS" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        SNS
      </Text>
      
      {/* Instagram Logo 모델 */}
      <InstagramLogo 
        position={[0, 6.2, 0]} 
        scale={[6, 6, 6]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Toolbox 컴포넌트 추가
function Toolbox(props) {
  const { scene } = useGLTF('/toolbox.glb');
  
  // Toolbox 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 원래 재질 유지 (색상 변경하지 않음)
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/githubcat.glb');
useGLTF.preload('/mailbox.glb');
useGLTF.preload('/instagramlogo.glb');
useGLTF.preload('/toolbox.glb');

function Level1({ characterRef }) {
  // 돌들의 위치와 속성을 배열로 정의
  const stones = [
    { position: [-17, 0.1, -7], scale: 8, rotation: [0, 0, 0] },
    { position: [-22, 0.3, -2], scale: 8, rotation: [0, 0.5, 0] },
    { position: [-16, 0.25, 2], scale: 8, rotation: [0, -0.3, 0] },
    { position: [-22, 0.2, 6], scale: 8, rotation: [0, 0.2, 0] },
    { position: [-16, 0.2, 10], scale: 8, rotation: [0, -0.2, 0] },
    { position: [-22, 0.15, 14], scale: 8, rotation: [0, 0.1, 0] },

    { position: [23, 0.1, -7], scale: 8, rotation: [0, 0, 0] },
    { position: [18, 0.1, -2], scale: 8, rotation: [0, 0.5, 0] },
    { position: [24, 0.15, 2], scale: 8, rotation: [0, -0.3, 0] },
    { position: [18, 0.1, 6], scale: 8, rotation: [0, 0.2, 0] },
    { position: [24, 0.1, 10], scale: 8, rotation: [0, -0.2, 0] },
    { position: [18, 0.1, 14], scale: 8, rotation: [0, 0.1, 0] },
  ];

  // 팜트리들의 위치와 속성을 배열로 정의
  const palmTrees = [
    { position: [-30, 0, -10], scale: 0.05, rotation: [0, 0, 0] },
    { position: [30, 0, -10], scale: 0.05, rotation: [0, 0, 0] },
  ];

  // 그라데이션 텍스처 생성
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // 대각선 그라데이션 생성 (왼쪽 위에서 오른쪽 아래로)
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#50AA50'); // 훨씬 더 어두운 연두색 시작
    gradient.addColorStop(1, '#E0FFE0'); // 밝은 연두색 끝
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    return texture;
  }, []);

  return (
    <>
      <Sky />
      <PortalBase position={portalPosition} scale={20} castShadow receiveShadow />
      <PortalVortex position={[-19.7, 8, -22]} scale={[7, 9.8, 1]} castShadow receiveShadow />
      
      {/* Level3 Portal */}
      <PortalBase position={portalLevel3Position} scale={20} castShadow receiveShadow />
      <PortalVortexLevel3 position={[20.3, 8, -22]} scale={[7, 9.8, 1]} castShadow receiveShadow />
      
      {/* Path stones leading to the portal */}
      <PathStone position={[-22, 0.2, -13]} scale={7} rotation={[0, -0.2, 0]} castShadow receiveShadow />
      
      {/* Small stones scattered around the level */}
      {stones.map((stone, index) => (
        <SmallStoneFlatA 
          key={index} 
          position={stone.position} 
          scale={stone.scale} 
          rotation={stone.rotation}
          castShadow
          receiveShadow
        />
      ))}

      {/* Palm trees scattered around the level */}
      {palmTrees.map((tree, index) => (
        <PalmTree 
          key={index} 
          position={tree.position} 
          scale={tree.scale} 
          rotation={tree.rotation}
          castShadow
          receiveShadow
        />
      ))}

      {/* NPC Character */}
      <NPCCharacter position={[-27, 0, -8]} playerRef={characterRef} />
      
      {/* GitHub Cat 그룹 (둥근 정육면체 + GitHub Cat) */}
      <GitHubCatGroup 
        position={[-6, 0.2, 20]}
        characterRef={characterRef}
        castShadow
        receiveShadow
      />
      
      {/* Mailbox 그룹 (둥근 정육면체 + Mailbox) */}
      <MailboxGroup 
        position={[0, 0.2, 20]}
        characterRef={characterRef}
        castShadow
        receiveShadow
      />
      
      {/* Instagram 그룹 (둥근 정육면체 + Instagram Logo) */}
      <InstagramGroup 
        position={[6, 0.2, 20]}
        characterRef={characterRef}
        castShadow
        receiveShadow
      />
      
      {/* 도구상자 추가 */}
      <Toolbox 
        position={[-12, 1.2, 25]} 
        scale={[1.5, 1.5, 1.5]} 
        rotation={[0, Math.PI / 4, 0]}
        castShadow
        receiveShadow
      />
      
      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        첫번쨰 프로젝트에 오신걸 환영합니다! 🎉
      </Text>
      
      {/* Floor with gradient green color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial map={gradientTexture} />
      </mesh>
    </>
  );
}

function Level2({ onCarRef, characterRef }) {
  // level2map.png 텍스처 로드
  const level2Texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/resources/level2map.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, []);

  return (
    <>
      <Sky />
      
      {/* RaceFuture 자동차 추가 */}
      <RaceFuture 
        position={[0, 0, 0]} 
        scale={5} 
        rotation={[0, Math.PI / 2, 0]} 
        onCarRef={onCarRef}
        characterRef={characterRef}
        castShadow
        receiveShadow
      />
      
      {/* Level1으로 돌아가는 포탈 - 캐릭터 뒤쪽에 배치 */}
      <PortalBase position={[0, 7.5, 23.5]} scale={20} castShadow receiveShadow />
      <PortalVortex position={[0.3, 8, 22]} scale={[7, 9.8, 1]} castShadow receiveShadow />
      
      {/* Floor with level2map.png texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial map={level2Texture} />
      </mesh>
    </>
  );
}

function GameMap(props) {
  const { scene } = useGLTF('/GameMap.glb');
  
  // GameMap 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

function GameMap2(props) {
  const { scene } = useGLTF('/GameMap2.glb');
  
  // GameMap2 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/GameMap.glb');
useGLTF.preload('/GameMap2.glb');

function Level3({ characterRef }) {
  // Map1.png 텍스처 로드
  const map1Texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/Map1.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, []);

  return (
    <>
      <Sky />
      
      {/* GameMap.glb 모델 렌더링 - 크기와 각도 조절 가능 */}
      <GameMap 
        position={[60, 0, -50]} 
        scale={[1, 1, 1]}  // X, Y, Z 각각 크기 조절 가능
        rotation={[0, Math.PI / 2, 0]}  // Y축으로 45도 회전
        castShadow
        receiveShadow
      />
      
      {/* GameMap2.glb 모델 렌더링 - 크기와 각도 조절 가능 */}
      <GameMap2 
        position={[-60, -2.2, -50]} 
        scale={[0.8, 0.8, 0.8]}  // X, Y, Z 각각 크기 조절 가능
        rotation={[0, Math.PI / 2, 0]}  // 회전 없음
        castShadow
        receiveShadow
      />
      
      {/* Map1.png 텍스처를 GameMap 밑에 배치 */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[56, 0.01, -50]} receiveShadow>
        <planeGeometry args={[81, 81]} />
        <meshStandardMaterial map={map1Texture} />
      </mesh>
      
      {/* Level1의 GitHub Cat 그룹 복사 - Level3에 배치 */}
      <GitHubCatGroup 
        position={[15, 0.2, 0]}
        characterRef={characterRef}
        level={3}
        castShadow
        receiveShadow
      />
      
      {/* Game Start 버튼 - 게임 사이트로 이동 */}
      <GameStartButton 
        position={[25, 0.2, 0]}
        characterRef={characterRef}
        castShadow
        receiveShadow
      />
      
      {/* 공사장 바리게이트 펜스 - 개발 중 표시 */}
      <ConstructionBarrier 
        position={[-35, 0, -10]}
        castShadow
        receiveShadow
      />
      
      {/* Level1로 가는 포탈 - Level3 포탈과 똑같은 색상과 모양 */}
      <PortalBase position={portalLevel3ToLevel1Position} scale={20} castShadow receiveShadow />
      <PortalVortexLevel3 position={[0.3, 8, 22]} scale={[7, 9.8, 1]} castShadow receiveShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>
    </>
  );
}

function App() {
  const [gameState, setGameState] = useState('playing_level1'); // playing_level1, entering_portal, playing_level2
  const characterRef = useRef();
  const [isWebMode, setIsWebMode] = useState(true); // 웹/게임 모드 상태 - 웹 모드로 시작
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 상태

  const toggleMode = () => {
    setIsWebMode(!isWebMode);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 다크 모드 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavigationBar isWebMode={isWebMode} onToggleMode={toggleMode} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {isWebMode ? (
        // 웹 모드: 포트폴리오 웹사이트
        <WebModeContent onToggleMode={toggleMode} isDarkMode={isDarkMode} />
      ) : (
        // 게임 모드: 3D 게임
        <Canvas 
          camera={{ position: [-0.00, 28.35, 19.76], rotation: [-0.96, -0.00, -0.00] }}
          shadows
        >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={6} 
          castShadow
          shadow-mapSize-width={8192}
          shadow-mapSize-height={8192}
          shadow-camera-far={1000}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
          shadow-radius={4}
        />
        {/* Sun visual */}
        <mesh position={[50, 50, 25]}>
          <sphereGeometry args={[3, 16, 16]} />
          <meshBasicMaterial color="#FDB813" />
        </mesh>

        <Suspense fallback={null}>
          <Model characterRef={characterRef} gameState={gameState} setGameState={setGameState} />
          <CameraController gameState={gameState} characterRef={characterRef} />
          <CameraLogger />
          {gameState === 'playing_level2' ? <Level2 onCarRef={(ref) => {
            if (characterRef.current?.handleSetCarRef) {
              characterRef.current.handleSetCarRef(ref);
            }
          }} characterRef={characterRef} /> : 
           gameState === 'playing_level3' ? <Level3 characterRef={characterRef} /> : <Level1 characterRef={characterRef} />}
        </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;
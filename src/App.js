import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, shaderMaterial, useFBX, Text } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import './App.css';
import './TutorialPopup.css';
import { useKeyboardControls } from './useKeyboardControls';
import { TypingAnimation } from './TypingAnimation';
import { useScrollAnimation } from './useScrollAnimation';
import { ProjectModal } from './ProjectModal';
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier';

// 프로젝트 데이터
const projectsData = [
  {
    id: 1,
    title: 'Asura(웹 멀티 격투 게임)',
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
    title: 'Void(2D Unity Action RPG)',
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

  // 이메일 복사 함수
  const handleCopyEmail = async (e) => {
    e.preventDefault();
    const email = 'kimkichan1225@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showCustomPopup('이메일이 복사되었습니다! 📋');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

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
          <div ref={contactRef} className="contact-skills-container">
            <h2 className="contact-skills-title">Contact & Skills</h2>

            <div className="contact-skills-grid">
              <div className="contact-box">
                <h3>연락처</h3>

                <div className="skill-category">
                  <h4>Email</h4>
                  <div className="skill-tags">
                    <span onClick={handleCopyEmail} className="skill-tag contact-link" style={{ cursor: 'pointer' }}>kimkichan1225@gmail.com</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Phone</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">+82 10-4225-5388</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>GitHub</h4>
                  <div className="skill-tags">
                    <a href="https://github.com/kimkichan1225" target="_blank" rel="noopener noreferrer" className="skill-tag contact-link">github.com/kimkichan1225</a>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Instagram</h4>
                  <div className="skill-tags">
                    <a href="https://www.instagram.com/kim_kichan/#" target="_blank" rel="noopener noreferrer" className="skill-tag contact-link">@kim_kichan</a>
                  </div>
                </div>
              </div>

              <div className="skills-box">
                <h3>기술 스택</h3>

                <div className="skill-category">
                  <h4>Frontend</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">React 19</span>
                    <span className="skill-tag">TypeScript</span>
                    <span className="skill-tag">JavaScript</span>
                    <span className="skill-tag">Three.js</span>
                    <span className="skill-tag">HTML5</span>
                    <span className="skill-tag">CSS3</span>
                    <span className="skill-tag">TailwindCSS</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Backend</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Node.js</span>
                    <span className="skill-tag">Express</span>
                    <span className="skill-tag">Socket.IO</span>
                    <span className="skill-tag">Supabase</span>
                    <span className="skill-tag">PostgreSQL</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Game Development</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Unity 6</span>
                    <span className="skill-tag">C#</span>
                    <span className="skill-tag">React Three Fiber</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Tools</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Git</span>
                    <span className="skill-tag">GitHub</span>
                    <span className="skill-tag">Vite</span>
                    <span className="skill-tag">Netlify</span>
                    <span className="skill-tag">Render</span>
                  </div>
                </div>
              </div>
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
          <a href="#contact" className="nav-link">Contact & Skills</a>
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
function Sky({ isDarkMode }) {
  return (
    <mesh>
      <sphereGeometry args={[400, 32, 32]} />
      <meshBasicMaterial color={isDarkMode ? "#0B1026" : "#87CEFA"} side={THREE.BackSide} />
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



function CameraController({ gameState, characterRef }) {
  const { camera } = useThree();
  const cameraOffset = new THREE.Vector3(-0.00, 28.35, 19.76); // 고정된 카메라 오프셋
  const targetPositionRef = useRef(new THREE.Vector3());
  const prevGameStateRef = useRef(gameState);

  // 레벨 전환 시 카메라 즉시 리셋
  useEffect(() => {
    if (prevGameStateRef.current !== gameState && characterRef.current) {
      // 캐릭터 위치가 업데이트된 후 카메라 리셋
      requestAnimationFrame(() => {
        if (!characterRef.current) return;

        const worldPosition = new THREE.Vector3();
        characterRef.current.getWorldPosition(worldPosition);

        // 타겟 위치 즉시 설정
        targetPositionRef.current.copy(worldPosition);

        // 카메라 위치 즉시 설정
        const targetCameraPosition = worldPosition.clone().add(cameraOffset);
        camera.position.copy(targetCameraPosition);
        camera.lookAt(worldPosition);
      });

      prevGameStateRef.current = gameState;
    }
  }, [gameState, characterRef, camera, cameraOffset]);

  useFrame((state, delta) => {
    if (!characterRef.current) return;

    // 월드 position 가져오기
    const worldPosition = new THREE.Vector3();
    characterRef.current.getWorldPosition(worldPosition);

    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3' || gameState === 'playing_level4' || gameState === 'returning_to_level1' || gameState === 'returning_to_level1_from_level3' || gameState === 'returning_to_level3_from_level4') {
      // 타겟 위치를 부드럽게 보간 (떨림 방지)
      targetPositionRef.current.lerp(worldPosition, delta * 12.0);

      // 타겟 위치에 고정된 오프셋을 더해서 카메라 위치 계산
      const targetCameraPosition = targetPositionRef.current.clone().add(cameraOffset);

      // 부드러운 카메라 이동 (속도 감소)
      camera.position.lerp(targetCameraPosition, delta * 2.0);

      // 타겟을 바라보도록 설정
      camera.lookAt(targetPositionRef.current);
    }
  });

  return null;
}

function Model({ characterRef, gameState, setGameState, setGameStateWithFade, doorPosition, setIsNearDoor, door2Position, setIsNearDoor2, door3Position, setIsNearDoor3, doorPositionLevel2, setIsNearDoorLevel2, doorPositionLevel3, setIsNearDoorLevel3, doorPositionLevel4, setIsNearDoorLevel4, cabinetTVPosition, setIsNearCabinetTV, setShowContactInfo, wallPosition, setIsNearWall, setShowProfile, asuraCabinetPosition, setIsNearAsuraCabinet, setShowFirstProject, conviCabinetPosition, setIsNearConviCabinet, setShowSecondProject, voidCabinetPosition, setIsNearVoidCabinet, setShowThirdProject, spawnPosition }) {
  const { scene, animations } = useGLTF('/resources/GameView/Suit.glb');
  const { actions } = useAnimations(animations, characterRef);

  const { forward, backward, left, right, shift, e, log } = useKeyboardControls();
  const [currentAnimation, setCurrentAnimation] = useState('none');

  // 발걸음 소리를 위한 오디오 시스템
  const stepAudioRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const stepIntervalRef = useRef(0.5); // 발걸음 간격 (초)

  // 문 열림 소리를 위한 오디오 시스템
  const doorAudioRef = useRef(null);
  const doorInteractionDistance = 8; // 문과 상호작용 가능한 거리
  const lastDoorInteractionTimeRef = useRef(0); // E키 쿨다운 (5초)
  const doorCooldownDuration = 500; // 5초 쿨다운 (밀리초)

  // 안전한 참조를 위한 useRef
  const rigidBodyRef = useRef(); // Rapier RigidBody 참조
  const currentRotationRef = useRef(new THREE.Quaternion()); // 현재 회전 저장 (모델용)
  const modelGroupRef = useRef(); // 캐릭터 모델 그룹 참조

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

  // 문 열림 소리 로드
  useEffect(() => {
    const doorAudioPath = '/sounds/opendoor.mp3';
    doorAudioRef.current = new Audio(doorAudioPath);
    doorAudioRef.current.volume = 0.8;
    doorAudioRef.current.preload = 'auto';
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

  // 문 열림 소리 재생 함수
  const playDoorSound = () => {
    if (doorAudioRef.current) {
      doorAudioRef.current.currentTime = 0;
      doorAudioRef.current.play().catch(e => {
        console.error('문 열림 소리 재생 실패:', e);
      });
    }
  };

  useEffect(() => {
    // Enable shadows on all meshes in the character model
    if (characterRef.current) {
      characterRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    // characterRef를 modelGroupRef로 설정 (카메라가 추적할 수 있도록)
    if (modelGroupRef.current) {
      characterRef.current = modelGroupRef.current;
    }
  }, []);

  useEffect(() => {
    let animToPlay = 'Idle';
    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3' || gameState === 'playing_level4' || gameState === 'returning_to_level1' || gameState === 'returning_to_level1_from_level3' || gameState === 'returning_to_level3_from_level4') {
      if (forward || backward || left || right) {
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
  }, [forward, backward, left, right, shift, actions, currentAnimation, gameState]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !modelGroupRef.current) return;

    if (gameState !== 'playing_level1' && gameState !== 'playing_level2' && gameState !== 'playing_level3' && gameState !== 'playing_level4') return;

    const speed = shift ? 18 : 8; // 물리 기반 속도 (걷기: 8, 뛰기: 18)
    const direction = new THREE.Vector3();

    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();

      // 회전 처리 - 부드럽게 회전 (모델만)
      const targetAngle = Math.atan2(direction.x, direction.z);
      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);

      // 현재 회전에서 목표 회전으로 부드럽게 보간 (slerp)
      currentRotationRef.current.slerp(targetQuaternion, 0.25);

      // 물리 기반 이동 (setLinvel 사용)
      // Y축 속도만 먼저 추출 (참조를 즉시 해제하기 위해)
      const currentY = rigidBodyRef.current.linvel().y;
      rigidBodyRef.current.setLinvel({
        x: direction.x * speed,
        y: currentY, // Y축은 중력 유지
        z: direction.z * speed
      });

      // 발걸음 소리 재생
      if (currentAnimation === 'Walk' || currentAnimation === 'Run') {
        const currentTime = Date.now();
        if (currentTime - lastStepTimeRef.current > stepIntervalRef.current * 1000) {
          playStepSound();
          lastStepTimeRef.current = currentTime;
        }
      }
    } else {
      // 정지 시 속도 0
      // Y축 속도만 먼저 추출 (참조를 즉시 해제하기 위해)
      const currentY = rigidBodyRef.current.linvel().y;
      rigidBodyRef.current.setLinvel({ x: 0, y: currentY, z: 0 });
    }

    // RigidBody의 위치를 모델에 동기화
    const rbPosition = rigidBodyRef.current.translation();
    const posX = rbPosition.x; // 값을 즉시 복사하여 Rust 참조 해제
    const posY = rbPosition.y;
    const posZ = rbPosition.z;
    modelGroupRef.current.position.set(posX, posY, posZ);

    // 모델의 회전은 입력에 의한 회전만 적용
    modelGroupRef.current.quaternion.copy(currentRotationRef.current);

    const currentTime = Date.now();
    const onCooldown = (currentTime - lastDoorInteractionTimeRef.current) < doorCooldownDuration;

    // door001 상호작용 감지 (Level1에서만)
    if (gameState === 'playing_level1' && doorPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPosition);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor(false);
        } else {
          setIsNearDoor(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level2');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor(false);
      }
    } else {
      setIsNearDoor(false);
    }

    // door 상호작용 감지 (Level1에서만 - Level3로 가는 문)
    if (gameState === 'playing_level1' && door2Position) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(door2Position);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor2(false);
        } else {
          setIsNearDoor2(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level3');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor2(false);
      }
    } else {
      setIsNearDoor2(false);
    }

    // door001 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && doorPositionLevel2) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel2);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel2(false);
        } else {
          setIsNearDoorLevel2(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level1');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel2(false);
      }
    } else {
      setIsNearDoorLevel2(false);
    }

    // door 상호작용 감지 (Level3에서만 - Level1로 돌아가는 문)
    if (gameState === 'playing_level3' && doorPositionLevel3) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel3);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel3(false);
        } else {
          setIsNearDoorLevel3(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level1_from_level3');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel3(false);
      }
    } else {
      setIsNearDoorLevel3(false);
    }

    // door002 상호작용 감지 (Level3에서만 - Level4로 가는 문)
    if (gameState === 'playing_level3' && door3Position) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(door3Position);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor3(false);
        } else {
          setIsNearDoor3(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level4');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor3(false);
      }
    } else {
      setIsNearDoor3(false);
    }

    // door002 상호작용 감지 (Level4에서만 - Level3로 돌아가는 문)
    if (gameState === 'playing_level4' && doorPositionLevel4) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel4);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel4(false);
        } else {
          setIsNearDoorLevel4(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level3_from_level4');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel4(false);
      }
    } else {
      setIsNearDoorLevel4(false);
    }

    // cabinetTelevision 상호작용 감지 (Level4에서만)
    if (gameState === 'playing_level4' && cabinetTVPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(cabinetTVPosition);

      if (distance < doorInteractionDistance) {
        setIsNearCabinetTV(true);
        if (e && !onCooldown) {
          setShowContactInfo(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearCabinetTV(false);
      }
    } else {
      setIsNearCabinetTV(false);
    }

    // wall 상호작용 감지 (Level4에서만)
    if (gameState === 'playing_level4' && wallPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(wallPosition);

      if (distance < doorInteractionDistance) {
        setIsNearWall(true);
        if (e && !onCooldown) {
          setShowProfile(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearWall(false);
      }
    } else {
      setIsNearWall(false);
    }

    // AsuraCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && asuraCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(asuraCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearAsuraCabinet(true);
        if (e && !onCooldown) {
          setShowFirstProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearAsuraCabinet(false);
      }
    } else {
      setIsNearAsuraCabinet(false);
    }

    // ConviCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && conviCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(conviCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearConviCabinet(true);
        if (e && !onCooldown) {
          setShowSecondProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearConviCabinet(false);
      }
    } else {
      setIsNearConviCabinet(false);
    }

    // VoidCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && voidCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(voidCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearVoidCabinet(true);
        if (e && !onCooldown) {
          setShowThirdProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearVoidCabinet(false);
      }
    } else {
      setIsNearVoidCabinet(false);
    }

    // C키로 캐릭터 위치 로그 (디버그)
    if (log) {
      const debugPosition = rigidBodyRef.current.translation();
      const debugX = debugPosition.x;
      const debugY = debugPosition.y;
      const debugZ = debugPosition.z;
      console.log('=== 캐릭터 위치 ===');
      console.log(`Position: x=${debugX.toFixed(2)}, y=${debugY.toFixed(2)}, z=${debugZ.toFixed(2)}`);
      console.log(`GameState: ${gameState}`);
      console.log('Level1 doorPosition:', doorPosition);
      console.log('Level2 doorPosition:', doorPositionLevel2);
    }
  });

  return (
    <>
      {/* 물리 충돌용 RigidBody (보이지 않음) */}
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        colliders={false}
        mass={1}
        linearDamping={2.0} // 증가: 더 빠르게 감속 (떨림 방지)
        angularDamping={1.0} // 회전 감쇠 추가
        enabledRotations={[false, false, false]} // 물리적 회전 완전 잠금
        position={spawnPosition} // 동적 스폰 위치
        lockRotations={true} // 회전 완전 잠금
        canSleep={false} // 절대 sleep 상태로 전환되지 않음 (플레이어 캐릭터용)
      >
        <CapsuleCollider args={[2, 1.3]} position={[0, 3.2, 0]} />
      </RigidBody>

      {/* 캐릭터 모델 (RigidBody와 분리) */}
      <group ref={modelGroupRef}>
        <primitive
          ref={characterRef}
          object={scene}
          scale={2}
          castShadow
          receiveShadow
        />
      </group>
    </>
  );
}

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

function Level1Map({ onDoorPositionFound, onDoor2PositionFound, onStreetlightPositionsFound, onRedlightPositionsFound, onGreenlightPositionsFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level1Map-v3.glb');

  // Level1Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    const streetlightPositions = [];
    const redlightPositions = [];
    const greenlightPositions = [];

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door001 오브젝트 찾기 (Level2로 가는 문)
      if (child.name === 'door001') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // door 오브젝트 찾기 (Level3로 가는 문)
      if (child.name === 'door') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoor2PositionFound) {
          onDoor2PositionFound(worldPos);
        }
      }
      // Streetlight 오브젝트들 찾기
      if (child.name && child.name.startsWith('Streetlight')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        streetlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Redlight 오브젝트들 찾기 (Redlight004~009만)
      if (child.name && (
        child.name === 'Redlight004' ||
        child.name === 'Redlight005' ||
        child.name === 'Redlight006' ||
        child.name === 'Redlight007' ||
        child.name === 'Redlight008' ||
        child.name === 'Redlight009'
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        redlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Greenlight 오브젝트들 찾기 (Greenlight004~009만)
      if (child.name && (
        child.name === 'Greenlight004' ||
        child.name === 'Greenlight005' ||
        child.name === 'Greenlight006' ||
        child.name === 'Greenlight007' ||
        child.name === 'Greenlight008' ||
        child.name === 'Greenlight009'
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        greenlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
    });

    // 가로등 위치들 전달
    if (onStreetlightPositionsFound && streetlightPositions.length > 0) {
      onStreetlightPositionsFound(streetlightPositions);
    }
    // 빨간 불빛 위치들 전달
    if (onRedlightPositionsFound && redlightPositions.length > 0) {
      onRedlightPositionsFound(redlightPositions);
    }
    // 초록 불빛 위치들 전달
    if (onGreenlightPositionsFound && greenlightPositions.length > 0) {
      onGreenlightPositionsFound(greenlightPositions);
    }

    return cloned;
  }, [scene, onDoorPositionFound, onDoor2PositionFound, onStreetlightPositionsFound, onRedlightPositionsFound, onGreenlightPositionsFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Suit.glb');
useGLTF.preload('/resources/GameView/Level1Map-v3.glb');

function Level2Map({ onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level2Map-v2.glb');

  // Level2Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door001 오브젝트 찾기
      if (child.name === 'door001') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // AsuraCabinet 오브젝트 찾기
      if (child.name === 'AsuraCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onAsuraCabinetPositionFound) {
          onAsuraCabinetPositionFound(worldPos);
        }
      }
      // ConviCabinet 오브젝트 찾기
      if (child.name === 'ConviCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onConviCabinetPositionFound) {
          onConviCabinetPositionFound(worldPos);
        }
      }
      // VoidCabinet 오브젝트 찾기
      if (child.name === 'VoidCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onVoidCabinetPositionFound) {
          onVoidCabinetPositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level2Map-v2.glb');

function Level3Map({ onDoorPositionFound, onDoor2PositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level3Map.glb');

  // Level3Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door 오브젝트 찾기 (Level1로 돌아가는 문)
      if (child.name === 'door') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // door002 오브젝트 찾기 (Level4로 가는 문)
      if (child.name === 'door002') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoor2PositionFound) {
          onDoor2PositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onDoor2PositionFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level3Map.glb');

function Level4Map({ onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level4Map.glb');

  // Level4Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door002 오브젝트 찾기 (Level3로 돌아가는 문)
      if (child.name === 'door002') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // cabinetTelevision 오브젝트 찾기
      if (child.name === 'cabinetTelevision') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onCabinetTVPositionFound) {
          onCabinetTVPositionFound(worldPos);
        }
      }
      // wall 오브젝트 찾기
      if (child.name === 'wall') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onWallPositionFound) {
          onWallPositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound]);

  // Cleanup 함수 추가
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 리소스 정리
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [clonedScene]);

  return (
    <RigidBody type="fixed" colliders="trimesh" key="level4-map-rigidbody">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level4Map.glb');

function Level1({ characterRef, onDoorPositionFound, onDoor2PositionFound, isDarkMode }) {
  const [streetlightPositions, setStreetlightPositions] = useState([]);
  const [redlightPositions, setRedlightPositions] = useState([]);
  const [greenlightPositions, setGreenlightPositions] = useState([]);

  return (
    <>
      <Sky isDarkMode={isDarkMode} />

      {/* Level1 Map - 크리스마스 마을 */}
      <Level1Map
        onDoorPositionFound={onDoorPositionFound}
        onDoor2PositionFound={onDoor2PositionFound}
        onStreetlightPositionsFound={setStreetlightPositions}
        onRedlightPositionsFound={setRedlightPositions}
        onGreenlightPositionsFound={setGreenlightPositions}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* 가로등 불빛 - 다크 모드에서만 활성화 */}
      {isDarkMode && streetlightPositions.map((light, index) => (
        <group key={`streetlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 중심부 포인트 라이트 - 매우 강한 강도로 모델을 뚫고 나오도록 */}
          <pointLight
            color="#FFD700"
            intensity={100}
            distance={30}
            decay={1}
            castShadow={false}
          />
          {/* 위쪽 포인트 라이트 - 가로등 위에서도 빛이 나오도록 */}
          <pointLight
            position={[0, 0, 0]}
            color="#FFE4B5"
            intensity={200}
            distance={35}
            decay={1.2}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </group>
      ))}

      {/* 빨간 불빛 장식 */}
      {redlightPositions.map((light, index) => (
        <group key={`redlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 빨간 포인트 라이트 */}
          <pointLight
            color="#FF0000"
            intensity={100}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#FF6666" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 초록 불빛 장식 */}
      {greenlightPositions.map((light, index) => (
        <group key={`greenlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 초록 포인트 라이트 */}
          <pointLight
            color="#00FF00"
            intensity={80}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#00FF00" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#66FF66" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        첫번쨰 프로젝트에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level2({ characterRef, onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound }) {
  const { scene } = useThree();

  // Level2 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level2를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level2 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
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

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level2 Map */}
      <Level2Map
        onDoorPositionFound={onDoorPositionFound}
        onAsuraCabinetPositionFound={onAsuraCabinetPositionFound}
        onConviCabinetPositionFound={onConviCabinetPositionFound}
        onVoidCabinetPositionFound={onVoidCabinetPositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
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
        Level 2에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level3({ characterRef, onDoorPositionFound, onDoor2PositionFound }) {
  const { scene } = useThree();

  // Level3 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level3를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level3 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
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

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level3 Map */}
      <Level3Map
        onDoorPositionFound={onDoorPositionFound}
        onDoor2PositionFound={onDoor2PositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
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
        Level 3에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level4({ characterRef, onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound }) {
  const { scene } = useThree();

  // Level4 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level4를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level4 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
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

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level4 Map */}
      <Level4Map
        onDoorPositionFound={onDoorPositionFound}
        onCabinetTVPositionFound={onCabinetTVPositionFound}
        onWallPositionFound={onWallPositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
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
        Level 4에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

// 튜토리얼 팝업 컴포넌트
function TutorialPopup({ onClose, onDoNotShowAgain }) {
  const [currentPage, setCurrentPage] = useState(0); // 0: 조작법, 1: 미니맵

  const nextPage = () => {
    if (currentPage < 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-popup">
        <h2>🎮 포트폴리오 마을에 오신 것을 환영합니다!</h2>

        {/* 페이지 인디케이터 */}
        <div className="tutorial-page-indicator">
          <span className={currentPage === 0 ? 'active' : ''}>●</span>
          <span className={currentPage === 1 ? 'active' : ''}>●</span>
        </div>

        {/* 좌우 화살표 */}
        <button
          className={`tutorial-arrow tutorial-arrow-left ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          ←
        </button>
        <button
          className={`tutorial-arrow tutorial-arrow-right ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={nextPage}
          disabled={currentPage === 1}
        >
          →
        </button>

        {/* 페이지 1: 조작법 */}
        {currentPage === 0 && (
          <div className="tutorial-content tutorial-page">
            <h3>조작법:</h3>
            <ul>
              <li><strong>WASD</strong>: 이동</li>
              <li><strong>Shift</strong>: 달리기</li>
              <li><strong>E</strong>: 상호작용</li>
            </ul>

            <p className="tutorial-description">
              마을을 돌아다니며 프로젝트를 탐험해보세요!
            </p>
          </div>
        )}

        {/* 페이지 2: 미니맵 */}
        {currentPage === 1 && (
          <div className="tutorial-content tutorial-page">
            <h3>마을 지도:</h3>
            <div className="tutorial-minimap">
              <img
                src="/resources/GameView/Level1Map-v2.png"
                alt="Level 1 Map"
                className="minimap-image"
              />
            </div>
            <p className="tutorial-description">
              지도를 참고하여 마을을 탐험해보세요!
            </p>
          </div>
        )}

        {/* 버튼은 2페이지(미니맵)에서만 표시 */}
        {currentPage === 1 && (
          <div className="tutorial-buttons">
            <button className="tutorial-btn tutorial-btn-primary" onClick={onClose}>
              시작하기
            </button>
            <button className="tutorial-btn tutorial-btn-secondary" onClick={onDoNotShowAgain}>
              다시 보지 않기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState('playing_level1'); // 게임 상태
  const characterRef = useRef();
  const [isWebMode, setIsWebMode] = useState(true); // 웹/게임 모드 상태 - 웹 모드로 시작
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 상태
  const [showTutorial, setShowTutorial] = useState(false); // 튜토리얼 팝업 상태
  const [doorPosition, setDoorPosition] = useState(null); // Level1 door001 위치 (Level2로 가는 문)
  const [door2Position, setDoor2Position] = useState(null); // Level1 door 위치 (Level3로 가는 문)
  const [door3Position, setDoor3Position] = useState(null); // Level3 door002 위치 (Level4로 가는 문)
  const [doorPositionLevel2, setDoorPositionLevel2] = useState(null); // Level2 door001 위치
  const [doorPositionLevel3, setDoorPositionLevel3] = useState(null); // Level3 door 위치
  const [doorPositionLevel4, setDoorPositionLevel4] = useState(null); // Level4 door002 위치
  const [isNearDoor, setIsNearDoor] = useState(false); // Level1 door001 근처에 있는지 여부
  const [isNearDoor2, setIsNearDoor2] = useState(false); // Level1 door 근처에 있는지 여부
  const [isNearDoor3, setIsNearDoor3] = useState(false); // Level3 door002 근처에 있는지 여부
  const [isNearDoorLevel2, setIsNearDoorLevel2] = useState(false); // Level2 문 근처에 있는지 여부
  const [isNearDoorLevel3, setIsNearDoorLevel3] = useState(false); // Level3 문 근처에 있는지 여부
  const [isNearDoorLevel4, setIsNearDoorLevel4] = useState(false); // Level4 문 근처에 있는지 여부
  const [cabinetTVPosition, setCabinetTVPosition] = useState(null); // Level4 cabinetTelevision 위치
  const [isNearCabinetTV, setIsNearCabinetTV] = useState(false); // cabinetTelevision 근처에 있는지 여부
  const [showContactInfo, setShowContactInfo] = useState(false); // 연락처 정보 모달 표시 여부
  const [wallPosition, setWallPosition] = useState(null); // Level4 wall 위치
  const [isNearWall, setIsNearWall] = useState(false); // wall 근처에 있는지 여부
  const [showProfile, setShowProfile] = useState(false); // 프로필 모달 표시 여부
  const [asuraCabinetPosition, setAsuraCabinetPosition] = useState(null); // Level2 AsuraCabinet 위치
  const [isNearAsuraCabinet, setIsNearAsuraCabinet] = useState(false); // AsuraCabinet 근처에 있는지 여부
  const [showFirstProject, setShowFirstProject] = useState(false); // 첫 번째 프로젝트 모달 표시 여부
  const [conviCabinetPosition, setConviCabinetPosition] = useState(null); // Level2 ConviCabinet 위치
  const [isNearConviCabinet, setIsNearConviCabinet] = useState(false); // ConviCabinet 근처에 있는지 여부
  const [showSecondProject, setShowSecondProject] = useState(false); // 두 번째 프로젝트 모달 표시 여부
  const [voidCabinetPosition, setVoidCabinetPosition] = useState(null); // Level2 VoidCabinet 위치
  const [isNearVoidCabinet, setIsNearVoidCabinet] = useState(false); // VoidCabinet 근처에 있는지 여부
  const [showThirdProject, setShowThirdProject] = useState(false); // 세 번째 프로젝트 모달 표시 여부
  const [isFading, setIsFading] = useState(false); // 페이드 전환 상태
  const [spawnPosition, setSpawnPosition] = useState([0, 2, 0]); // 캐릭터 스폰 위치

  // 페이드 효과와 함께 레벨 전환
  const setGameStateWithFade = (newState) => {
    setIsFading(true); // 페이드 아웃 시작

    // 페이드 아웃 후 레벨 전환 및 스폰 위치 설정
    setTimeout(() => {
      // 레벨 복귀 시 스폰 위치 설정 및 목적지 상태로 즉시 전환
      if (newState === 'returning_to_level1') {
        setSpawnPosition([9.96, 0.29, -61.47]); // Level2에서 Level1로
        setGameState('playing_level1');
      } else if (newState === 'returning_to_level1_from_level3') {
        setSpawnPosition([-41.16, 0.29, -26.00]); // Level3에서 Level1로
        setGameState('playing_level1');
      } else if (newState === 'returning_to_level3_from_level4') {
        setSpawnPosition([-40.53, 0.32, -16.26]); // Level4에서 Level3로
        setGameState('playing_level3');
      } else if (newState === 'playing_level2') {
        setSpawnPosition([0, 2, 0]); // Level2 초기 스폰
        setGameState('playing_level2');
      } else if (newState === 'playing_level3') {
        setSpawnPosition([0, 2, 0]); // Level3 초기 스폰
        setGameState('playing_level3');
      } else if (newState === 'playing_level4') {
        setSpawnPosition([0, 2, 0]); // Level4 초기 스폰
        setGameState('playing_level4');
      } else if (newState === 'playing_level1') {
        setSpawnPosition([0, 2, 0]); // Level1 초기 스폰
        setGameState('playing_level1');
      }
    }, 400); // 0.4초 페이드 아웃

    // 전체 애니메이션 완료 후 오버레이 제거
    setTimeout(() => {
      setIsFading(false);
    }, 1800); // 1.8초 애니메이션 완료 후
  };

  const toggleMode = () => {
    const newMode = !isWebMode;
    setIsWebMode(newMode);

    // 웹 모드에서 게임 모드로 전환 시 튜토리얼 팝업 확인
    if (!newMode) { // 게임 모드로 전환
      const doNotShow = localStorage.getItem('hideGameTutorial');
      if (!doNotShow) {
        setShowTutorial(true);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  const handleDoNotShowAgain = () => {
    localStorage.setItem('hideGameTutorial', 'true');
    setShowTutorial(false);
  };

  // 다크 모드 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Physics key - spawnPosition이 변경되면 Physics를 재생성
  const getPhysicsKey = () => {
    // spawnPosition을 문자열로 변환하여 key로 사용
    return `${gameState}-${spawnPosition.join(',')}`;
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavigationBar isWebMode={isWebMode} onToggleMode={toggleMode} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* 튜토리얼 팝업 */}
      {showTutorial && !isWebMode && (
        <TutorialPopup
          onClose={handleCloseTutorial}
          onDoNotShowAgain={handleDoNotShowAgain}
        />
      )}

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

        {/* Level1 전용 태양/달 */}
        {gameState === 'playing_level1' && (
          <>
            <directionalLight
              position={[50, 50, 25]}
              intensity={isDarkMode ? 2 : 6}
              color={isDarkMode ? "#C0D0F0" : "#FFFFFF"}
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
            {/* 태양/달 시각화 */}
            <mesh position={[50, 50, 25]}>
              <sphereGeometry args={[3, 16, 16]} />
              <meshBasicMaterial color={isDarkMode ? "#E8EAF6" : "#FDB813"} />
            </mesh>
            {/* 다크 모드에서 주변 조명 추가 (달빛 분위기) */}
            {isDarkMode && (
              <ambientLight intensity={0.3} color="#4A5A8A" />
            )}
          </>
        )}

        <Suspense fallback={null}>
          <Physics key={getPhysicsKey()} gravity={[0, -40, 0]}>
            <Model characterRef={characterRef} gameState={gameState} setGameState={setGameState} setGameStateWithFade={setGameStateWithFade} doorPosition={doorPosition} setIsNearDoor={setIsNearDoor} door2Position={door2Position} setIsNearDoor2={setIsNearDoor2} door3Position={door3Position} setIsNearDoor3={setIsNearDoor3} doorPositionLevel2={doorPositionLevel2} setIsNearDoorLevel2={setIsNearDoorLevel2} doorPositionLevel3={doorPositionLevel3} setIsNearDoorLevel3={setIsNearDoorLevel3} doorPositionLevel4={doorPositionLevel4} setIsNearDoorLevel4={setIsNearDoorLevel4} cabinetTVPosition={cabinetTVPosition} setIsNearCabinetTV={setIsNearCabinetTV} setShowContactInfo={setShowContactInfo} wallPosition={wallPosition} setIsNearWall={setIsNearWall} setShowProfile={setShowProfile} asuraCabinetPosition={asuraCabinetPosition} setIsNearAsuraCabinet={setIsNearAsuraCabinet} setShowFirstProject={setShowFirstProject} conviCabinetPosition={conviCabinetPosition} setIsNearConviCabinet={setIsNearConviCabinet} setShowSecondProject={setShowSecondProject} voidCabinetPosition={voidCabinetPosition} setIsNearVoidCabinet={setIsNearVoidCabinet} setShowThirdProject={setShowThirdProject} spawnPosition={spawnPosition} />
            <CameraController gameState={gameState} characterRef={characterRef} />
            <CameraLogger />
            {gameState === 'playing_level1' && (
              <Level1 key="level1" characterRef={characterRef} onDoorPositionFound={setDoorPosition} onDoor2PositionFound={setDoor2Position} isDarkMode={isDarkMode} />
            )}
            {gameState === 'playing_level2' && (
              <Level2 key="level2" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel2} onAsuraCabinetPositionFound={setAsuraCabinetPosition} onConviCabinetPositionFound={setConviCabinetPosition} onVoidCabinetPositionFound={setVoidCabinetPosition} />
            )}
            {gameState === 'playing_level3' && (
              <Level3 key="level3" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel3} onDoor2PositionFound={setDoor3Position} />
            )}
            {gameState === 'playing_level4' && (
              <Level4 key="level4" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel4} onCabinetTVPositionFound={setCabinetTVPosition} onWallPositionFound={setWallPosition} />
            )}
          </Physics>
        </Suspense>
        </Canvas>
      )}

      {/* 문 상호작용 UI - Level1 door001 (Level2로) */}
      {!isWebMode && isNearDoor && gameState === 'playing_level1' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 프로젝트 갤러리로 입장
        </div>
      )}

      {/* 문 상호작용 UI - Level1 door (Level3로) */}
      {!isWebMode && isNearDoor2 && gameState === 'playing_level1' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 기술 스택 사무실로 입장
        </div>
      )}

      {/* 문 상호작용 UI - Level2 */}
      {!isWebMode && isNearDoorLevel2 && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 마을로 돌아가기
        </div>
      )}

      {/* 문 상호작용 UI - Level3 door (Level1로) */}
      {!isWebMode && isNearDoorLevel3 && gameState === 'playing_level3' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 마을로 돌아가기
        </div>
      )}

      {/* 문 상호작용 UI - Level3 door002 (Level4로) */}
      {!isWebMode && isNearDoor3 && gameState === 'playing_level3' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 개인 작업실로 이동
        </div>
      )}

      {/* 문 상호작용 UI - Level4 */}
      {!isWebMode && isNearDoorLevel4 && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 사무실로 돌아가기
        </div>
      )}

      {/* cabinetTelevision 상호작용 UI - Level4 */}
      {!isWebMode && isNearCabinetTV && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          📺 E키를 눌러 연락처 보기
        </div>
      )}

      {/* wall 상호작용 UI - Level4 */}
      {!isWebMode && isNearWall && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          🖼️ E키를 눌러 프로필 보기
        </div>
      )}

      {/* AsuraCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearAsuraCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🎮 E키를 눌러 Asura 프로젝트 보기
        </div>
      )}

      {/* ConviCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearConviCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🏪 E키를 눌러 Convi 프로젝트 보기
        </div>
      )}

      {/* VoidCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearVoidCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🎯 E키를 눌러 Void 프로젝트 보기
        </div>
      )}

      {/* 페이드 전환 오버레이 */}
      {isFading && (
        <div className="fade-overlay" />
      )}

      {/* 연락처 정보 모달 */}
      {showContactInfo && (
        <div className="contact-info-modal-overlay" onClick={() => setShowContactInfo(false)}>
          <div className="contact-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="contact-info-close" onClick={() => setShowContactInfo(false)}>
              ✕
            </button>
            <h2>연락처 정보</h2>
            <div className="contact-info-content">
              <div className="contact-info-item">
                <span className="contact-info-icon">📧</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">kimkichan1225@gmail.com</div>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">📱</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Phone</div>
                  <div className="contact-info-value">+82 10-4225-5388</div>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">💻</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">GitHub</div>
                  <a href="https://github.com/kimkichan1225" target="_blank" rel="noopener noreferrer" className="contact-info-value contact-info-link">
                    github.com/kimkichan1225
                  </a>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">📷</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Instagram</div>
                  <a href="https://www.instagram.com/kim_kichan/#" target="_blank" rel="noopener noreferrer" className="contact-info-value contact-info-link">
                    @kim_kichan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 모달 */}
      {showProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setShowProfile(false)}>
              ✕
            </button>
            <h2>About Me</h2>
            <div className="profile-modal-content">
              <div className="profile-image-section">
                <img src="/Kimkichan.png" alt="김기찬" className="profile-modal-image" />
                <p className="profile-birthday">📅 2001.12.25</p>
              </div>
              <div className="profile-text-section">
                <h3>안녕하세요, 김기찬입니다!</h3>
                <p>
                  <strong className="highlight">"어떻게 하면 더 재미있는 경험을 만들 수 있을까?"</strong>라는 질문에서 시작해, <strong>웹과 게임 개발의 경계를 넘나드는</strong> 프로젝트들을 만들어왔습니다.
                </p>
                <p>
                  <strong className="highlight">Socket.IO</strong>로 구현한 <strong>멀티플레이어 액션 게임</strong>에서는 수십 명이 동시에 플레이하며 실시간으로 상호작용하는 시스템을, <strong className="highlight">React 19</strong>과 <strong className="highlight">Supabase</strong>를 활용한 편의점 솔루션에서는 실무에 바로 적용 가능한 <strong>통합 관리 시스템</strong>을 구축했습니다. <strong className="highlight">Unity</strong>로 제작한 <strong>2D RPG</strong>에서는 턴제 전투와 주사위 메커니즘이라는 독특한 조합을 시도했죠.
                </p>
                <p>
                  지금 보고 계신 이 포트폴리오 역시 단순한 소개 페이지가 아닌, <strong className="highlight">Three.js</strong> 기반의 <strong>3D 게임 세계를 직접 탐험할 수 있는 인터랙티브 경험</strong>입니다. <strong className="highlight">TypeScript</strong>, <strong className="highlight">React Three Fiber</strong>, <strong className="highlight">커스텀 GLSL 셰이더</strong>까지 활용해 웹에서도 몰입감 있는 3D 환경을 구현했습니다.
                </p>
                <p>
                  <strong className="highlight">AI 개발 도구</strong>를 단순히 '사용'하는 것을 넘어, 이를 통해 <strong>개발 워크플로우 자체를 재설계</strong>하고 있습니다. 빠른 프로토타이핑과 반복적인 개선 사이클로 <strong>아이디어를 현실로 만드는 속도</strong>를 높이고, 더 많은 시간을 <strong>창의적인 문제 해결</strong>에 투자합니다.
                </p>
              </div>
            </div>
            <div className="profile-skills-grid">
              <div className="profile-skill-card">
                <div className="profile-skill-icon">🎮</div>
                <h4>게임 개발</h4>
                <p>Unity 2D/3D 게임 개발 및 Three.js를 활용한 웹 기반 3D 인터랙티브 경험 구현</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">💻</div>
                <h4>풀스택 개발</h4>
                <p>React, TypeScript, Node.js 등을 활용한 현대적인 웹 애플리케이션 풀스택 개발</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">👥</div>
                <h4>실시간 시스템</h4>
                <p>Socket.IO 기반 실시간 멀티플레이어 시스템 및 실시간 데이터 동기화 구현</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">🤖</div>
                <h4>AI 도구 활용</h4>
                <p>Claude Code, Cursor 등 AI 코딩 도구를 활용한 효율적인 개발 워크플로우 구축</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 첫 번째 프로젝트 모달 */}
      {showFirstProject && (
        <ProjectModal
          project={projectsData[0]}
          onClose={() => setShowFirstProject(false)}
        />
      )}

      {/* 두 번째 프로젝트 모달 */}
      {showSecondProject && (
        <ProjectModal
          project={projectsData[1]}
          onClose={() => setShowSecondProject(false)}
        />
      )}

      {/* 세 번째 프로젝트 모달 */}
      {showThirdProject && (
        <ProjectModal
          project={projectsData[2]}
          onClose={() => setShowThirdProject(false)}
        />
      )}
    </div>
  );
}

export default App;
import { Button, PROJECT } from '@/shared';
import { AnimatedContainer } from '@/shared/ui';
import { Footer } from '@/widgets';
import Link from 'next/link';

const FEATURES = [
  {
    title: '나의 운동 루틴 커스텀',
    description: ['자주 하는 루틴을 한 번에 불러오고', ' 세트만 채우면 끝.'],
    iconUrl: '/icons/calendar.white.svg',
  },
  {
    title: '월간 리포트',
    description: ['루틴 분포,완료율, 연속 기록 자동 계산'],
    iconUrl: '/icons/goal.white.svg',
  },
  {
    title: '목표 달성 추적',
    description: ['주간 목표를 한눈에 확인'],
    iconUrl: '/icons/graph.white.svg',
  },
  {
    title: '챌린지',
    description: ['다른 사용자와 함께하며 동기부여'],
    iconUrl: '/icons/flame.white.svg',
  },
];
export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="px-6 py-15 bg-primary text-white flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold md:text-5xl flex items-center gap-3">
          <img src="/icons/bolt.white.svg" alt="logo-icon" className="h-10 w-10" />
          {PROJECT.NAME}
        </h1>
        <p>운동 기록 · 루틴 관리 · 월간 리포트 · 챌린지</p>
        <Link href="/auth">
          <Button label="운동 기록하기" className="w-fit" variant="secondary" />
        </Link>
      </section>

      <section id="features" className="px-6 py-10 md:py-16 flex flex-col items-center gap-10">
        <div className="flex flex-col gap-3 items-center">
          <h2 className="text-2xl md:text-3xl font-bold">주요 기능</h2>
          <p className="text-text-secondary">운동 기록 | 리포트 | 챌린지</p>
        </div>
        <div className="w-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <AnimatedContainer
              key={feature.title}
              className="rounded-2xl border-2 bg-white p-6 shadow-lg transition hover:scale-105 border-border flex flex-col items-center"
            >
              <div className="mb-4 flex h-15 w-15 items-center justify-center rounded-lg bg-primary">
                <img src={feature.iconUrl} alt={feature.title} className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              {feature.description.map((line) => (
                <p key={line} className="mt-1 text-sm text-text-secondary">
                  {line}
                </p>
              ))}
            </AnimatedContainer>
          ))}
        </div>
      </section>

      {/* <section className="px-6 py-10 md:py-16 bg-gray900 text-primary">
        <AnimatedContainer className="flex gap-4 md:gap-10 lg:gap-30 flex-col md:flex-row md:justify-center">
          <div className="flex flex-col justify-center items-center lg:gap-5">
            <h3 className="text-4xl font-bold">10K+</h3>
            <span className="text-white lg:text-xl">활성 사용자</span>
          </div>
          <div className="flex flex-col justify-center items-center lg:gap-5">
            <h3 className="text-4xl font-bold">10K+</h3>
            <span className="text-white lg:text-xl">완료된 루틴</span>
          </div>
          <div className="flex flex-col justify-center items-center lg:gap-5">
            <h3 className="text-4xl font-bold">95%</h3>
            <span className="text-white lg:text-xl">목표 달성률</span>
          </div>
        </AnimatedContainer>
      </section> */}
      <section className="px-6 py-10 md:py-16  flex flex-col items-center gap-10">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-bold">기록 도구가 아닌 성장의 도구</h2>
        </div>
        <AnimatedContainer className="flex gap-6 flex-col md:flex-row">
          <div className="rounded-2xl border-2 bg-white p-6 border-border">
            <h3 className="text-lg font-semibold">일반 기록 앱</h3>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary list-disc pl-4">
              <li>기록이 흩어져 있어 흐름을 보기 어렵습니다.</li>
              <li>루틴과 기록이 섞여 템플릿 관리가 복잡합니다.</li>
              <li>성과 요약이 부족해 동기부여가 떨어집니다.</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 bg-white p-6 border-primary">
            <h3 className="text-lg text-primary font-bold">{PROJECT.NAME}</h3>
            <ul className="mt-4 space-y-3 text-sm list-disc pl-4">
              <li>
                캘린더 형태로 전체 운동 기록을 한눈에 확인,
                <br /> 운동기록은 리포트로 자동 요약.
              </li>
              <li>나만의 루틴 템플릿을 만들어, 쉬운 운동 기록</li>
              <li>주간·월간 목표 달성률을 시각화</li>
              <li>다른 유저와의 챌린지로, 동기부여 상승</li>
            </ul>
          </div>
        </AnimatedContainer>
      </section>

      <Footer />
    </main>
  );
}

interface MyPageProfileProps {
  imageUrl: string;
  nickname: string;
  workoutDays?: number;
}
export default function MyPageProfile({ imageUrl, nickname, workoutDays }: MyPageProfileProps) {
  return (
    <section className="flex flex-col lg:flex-row items-center mt-10 mb-8 border-2 border-border rounded-lg py-6 gap-3">
      <img src={imageUrl || ''} className="w-20 h-20 rounded-full border-2 border-primary object-cover object-center" />
      <div className="flex flex-col items-center lg:items-start space-y-2">
        <span className="text-2xl font-bold">{nickname}</span>
        <span className="text-text-secondary">이번달 {workoutDays || 0}일째 운동 중🔥</span>
      </div>
    </section>
  );
}

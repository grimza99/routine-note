'use client';
import useAuthStore from '@/entities/auth/model/useAuthStore';
import { useRoutineList } from '@/entities/routine/model/routine.query';
import { useDeleteRoutineMutation } from '@/features/routine';
import { Button, RoutineCard, Spinner } from '@/shared';
import { useModal } from '@/shared/hooks';

export default function RoutineManagePage() {
  const { openModal } = useModal();
  const { nickname } = useAuthStore();

  const { data: routineListData } = useRoutineList();
  const { mutateAsync: deleteRoutine, isPending: isDeleting } = useDeleteRoutineMutation();

  return (
    <div className="flex flex-col gap-10 w-full">
      <Button label={'새 루틴 추가하기'} className="w-fit" onClick={() => openModal('createRoutine')} />
      <h3 className="text-2xl text-text-secondary">{nickname} 님의 루틴</h3>
      {!routineListData ? (
        <Spinner size={48} />
      ) : (
        <>
          {routineListData.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routineListData?.map((routine) => (
                <div className="relative max-w-100" key={routine.routineId}>
                  <RoutineCard routineName={routine.routineName} exercises={routine.exercises} />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      label="수정"
                      className="w-fit py-1"
                      onClick={() => {
                        openModal('editRoutine', { routineId: routine.routineId });
                      }}
                    />
                    <Button
                      label="삭제"
                      className="w-fit py-1"
                      onClick={() => {
                        openModal('deleteRoutine', {
                          isPending: isDeleting,
                          onConfirm: () => deleteRoutine(routine.routineId),
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section className="w-full border-border border-2 rounded-lg flex justify-center items-center min-h-30 text-text-secondary p-4 md:text-xl text-center">
              아직 루틴이 없어요! <br />
              나만의 운동 루틴을 추가 해보세요!
            </section>
          )}
        </>
      )}
    </div>
  );
}

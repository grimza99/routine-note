'use client';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

import { useAuthStore, useRoutineList } from '@/entities';
import { useDeleteRoutineMutation } from '@/features/routine';
import { useModal } from '@/shared/hooks';
import { Button, RoutineCard, Spinner } from '@/shared/ui';

export default function RoutineManagePage() {
  const { openModal } = useModal();
  const { nickname } = useAuthStore();

  const { data: routineListData } = useRoutineList();
  const { mutateAsync: deleteRoutine, isPending: isDeleting } = useDeleteRoutineMutation();

  return (
    <div className="flex flex-col gap-10 w-full">
      <h3 className="text-2xl font-bold italic text-center">{nickname} 님의 루틴</h3>
      <div>
        <Button label={'새 루틴 추가하기'} className="w-fit mb-5" onClick={() => openModal('createRoutine')} />
        {!routineListData ? (
          <Spinner size={48} />
        ) : (
          <section className="w-full border-border bg-white border-2 rounded-lg flex justify-center items-center min-h-30 p-5 ">
            {routineListData.length > 0 ? (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routineListData?.map((routine) => (
                  <div className="relative max-w-100" key={routine.routineId}>
                    <RoutineCard routineName={routine.routineName} exercises={routine.exercises} />
                    <div className="absolute top-3 right-4 flex gap-2">
                      <Button
                        label={<PencilIcon className="size-4 text-white" />}
                        className="w-fit p-2"
                        onClick={() => {
                          openModal('editRoutine', { routineId: routine.routineId });
                        }}
                      />
                      <Button
                        label={<TrashIcon className="size-4 text-white" />}
                        className="w-fit p-2"
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
              <p className="md:text-xl text-center text-text-secondary">
                아직 루틴이 없어요! <br />
                나만의 운동 루틴을 추가 해보세요!
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

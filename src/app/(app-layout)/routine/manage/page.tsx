'use client';
import { useRoutineList } from '@/entities/routine/model/routine.query';
import { CreateRoutineModal, EditRoutineModal } from '@/features/routine';
import { Button, Modal, RoutineCard, Spinner } from '@/shared';
import { useState } from 'react';

export default function RoutineManagePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string>('');
  const { data: routineListData } = useRoutineList();

  return (
    <div className="flex flex-col gap-10 w-full">
      <Button label={'새 루틴 추가하기'} className="w-fit" onClick={() => setIsModalOpen(true)} />

      <h3 className="text-2xl text-text-secondary">...님의 루틴</h3>
      {/* todo : 유저 이름 넣기 */}
      {!routineListData ? (
        <Spinner size={48} />
      ) : (
        <>
          {routineListData.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routineListData?.map((routine) => (
                <div className="relative" key={routine.routineId}>
                  <RoutineCard routineName={routine.routineName} exercises={routine.exercises} />
                  <Button
                    label="수정"
                    className="w-fit absolute top-4 right-4"
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setEditingRoutineId(routine.routineId);
                    }}
                  />
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
      <Modal
        modalId="routine-manage-modal"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <CreateRoutineModal />
      </Modal>
      <Modal
        modalId="routine-edit-modal"
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
      >
        {isEditModalOpen && editingRoutineId ? <EditRoutineModal routineId={editingRoutineId} /> : null}
      </Modal>
    </div>
  );
}

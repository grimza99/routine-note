'use client';
import useAuthStore from '@/entities/auth/model/useAuthStore';
import { useRoutineList } from '@/entities/routine/model/routine.query';
import { CreateRoutineModal, EditRoutineModal, useDeleteRoutineMutation } from '@/features/routine';
import { Button, CommonConfirmModal, Modal, RoutineCard, Spinner } from '@/shared';
import { useState } from 'react';

export default function RoutineManagePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingRoutineId, setEditingRoutineId] = useState<string>('');
  const [deletingRoutineId, setDeletingRoutineId] = useState<string>('');

  const { nickname } = useAuthStore();
  const { data: routineListData } = useRoutineList();

  const { mutateAsync: deleteRoutine, isPending: isDeleting } = useDeleteRoutineMutation();

  return (
    <div className="flex flex-col gap-10 w-full">
      <Button label={'새 루틴 추가하기'} className="w-fit" onClick={() => setIsModalOpen(true)} />
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
                        setIsEditModalOpen(true);
                        setEditingRoutineId(routine.routineId);
                      }}
                    />
                    <Button
                      label="삭제"
                      className="w-fit py-1"
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setDeletingRoutineId(routine.routineId);
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
      <Modal
        modalId="routine-manage-modal"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <CreateRoutineModal
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </Modal>
      <Modal
        modalId="routine-edit-modal"
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
      >
        {isEditModalOpen && editingRoutineId ? (
          <EditRoutineModal
            routineId={editingRoutineId}
            onClose={() => {
              setIsEditModalOpen(false);
            }}
          />
        ) : null}
      </Modal>
      <Modal
        modalId="routine-delete-confirm-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
      >
        {isDeleteModalOpen && deletingRoutineId && (
          <CommonConfirmModal
            title="정말 이 루틴을 삭제하시겠습니까?"
            message="삭제된 루틴은 복구할 수 없습니다."
            onClose={() => {
              setIsDeleteModalOpen(false);
            }}
            onConfirm={() => {
              deleteRoutine(deletingRoutineId);
            }}
            isPending={isDeleting}
          />
        )}
      </Modal>
    </div>
  );
}

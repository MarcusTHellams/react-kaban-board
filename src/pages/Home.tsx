import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';

import { TaskCard } from '@/components';
import { type Status, type Task, statuses } from '@/features/tasks';

const api = axios.create({
  baseURL: 'http://localhost:3000/tasks',
});

export const Home = () => {
  const [currentlyHoveringOver, setCurrentlyHoveringOver] =
    useState<Status | null>(null);

  const { data: tasks = [] } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    async queryFn() {
      return api.get('').then(({ data }) => data);
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<Task, Error, Task>({
    mutationKey: ['updateTask'],
    async mutationFn(task) {
      return api.put(`/${task.id}`, task).then(({ data }) => data);
    },
    async onSettled() {
      return await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData(['tasks']) as Task[];

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        if (old) {
          return old.map((task) => {
            if (task.id === updatedTask.id) {
              return updatedTask;
            }
            return task;
          });
        }
        return undefined;
      });

      return { previousTasks };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_, __, context) => {
      const _context = context as { previousTasks: Task[] };
      queryClient.setQueryData(['tasks'], _context.previousTasks);
    },
  });

  const columns = useMemo(() => {
    return statuses.map((status) => {
      const tasksInColumn = tasks.filter((task) => task.status === status);
      return {
        title: status,
        tasksInColumn,
      };
    });
  }, [tasks]);

  const updateTask = (task: Task) => {
    mutate(task);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    title: Status
  ) => {
    const id = event.dataTransfer?.getData('id');
    if (!id || !tasks) return;
    const task = tasks.filter((task) => task.id === id)[0];
    updateTask({ ...task, status: title });
    setCurrentlyHoveringOver(null);
  };

  const handleDragEnter = (status: Status) => {
    setCurrentlyHoveringOver(status);
  };

  return (
    <div className="flex divide-x">
      {columns.map((column) => (
        <div
          onDrop={(event) => handleDrop(event, column.title)}
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => handleDragEnter(column.title)}
          className="grow"
          key={column.title}
        >
          <div className="flex justify-between text-3xl capitalize font-bold text-gray-500 p-2">
            <h2>{column.title}</h2>
            <div>
              {column.tasksInColumn.reduce((total, task) => {
                return total + (task?.points || 0);
              }, 0)}
            </div>
          </div>
          <div
            className={`h-full ${
              currentlyHoveringOver === column.title && 'bg-gray-200'
            }`}
          >
            {column.tasksInColumn.map((task) => (
              <TaskCard key={task.id} {...{ updateTask, ...task }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

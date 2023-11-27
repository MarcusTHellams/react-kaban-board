import { ChevronDown, ChevronUp, Edit, Equal, Minus, Plus } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';

import { type Priority, type Task } from '@/features/tasks';

const prioritySettings: Record<Priority, ReactNode> = {
  high: <ChevronUp className="text-red-500" />,
  medium: <Equal className="text-yellow-500" />,
  low: <ChevronDown className="text-blue-500" />,
};

type TaskCardType = Task & {
  updateTask: (task: Task) => void;
};

export const TaskCard = ({ updateTask, ...task }: TaskCardType) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTaskTitle, setLocalTaskTitle] = useState(task.title);
  const input = useRef<HTMLInputElement>(null);

  const updatePoints = (direction: 'up' | 'down') => {
    const fib = [0, 1, 2, 3, 5, 8, 13];
    const index = fib.indexOf(task.points || 0);
    const nextIndex = direction === 'up' ? index + 1 : index - 1;
    const newPoints = fib[nextIndex];
    if (newPoints !== undefined) {
      updateTask({ ...task, points: newPoints });
    }
  };

  const updateTitle = () => {
    updateTask({ ...task, title: localTaskTitle });
    setIsEditing(false);
  };

  const enterEditMode = () => {
    setIsEditing(true);
    setTimeout(() => {
      input?.current?.focus();
    });
  };

  const dragStartHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('id', task.id);
  };

  const { id, points, priority } = task;

  return (
    <div
      draggable
      onDragStart={dragStartHandler}
      className="border rounded p-2 m-2 bg-gray-50"
    >
      <div className="text-base gap-2 py-2 font-base">
        <div className={`flex gap-2 items-center ${isEditing ? 'hidden' : ''}`}>
          <button onClick={enterEditMode}>
            <Edit className="text-blue-700" />
          </button>
          {localTaskTitle}
        </div>
        <input
          ref={input}
          onBlur={() => setIsEditing(false)}
          onChange={(event) => {
            setLocalTaskTitle(event.target.value);
          }}
          value={localTaskTitle}
          className={`w-full ${!isEditing ? 'hidden' : ''}`}
          onKeyDown={(event) => {
            if (['Enter', 'Escape'].includes(event.key)) {
              updateTitle();
            }
            return;
          }}
        />
      </div>
      <div className="flex justify-between gap-4 py-2 text-gray-500 text-sm items-center">
        <div className="flex gap-2 items-center">
          <div>{id}</div>
          <div className="capitalize">{priority}</div>
          {prioritySettings[priority]}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => updatePoints('down')}>
            <Minus size="18" />
          </button>
          {points || 0}
          <button onClick={() => updatePoints('up')}>
            <Plus size="18" />
          </button>
        </div>
      </div>
    </div>
  );
};

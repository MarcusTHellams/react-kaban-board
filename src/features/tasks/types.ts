export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  title: string;
  id: string;
  points?: number;
  status: 'todo' | 'in-progress' | 'done';
  priority: Priority;
};

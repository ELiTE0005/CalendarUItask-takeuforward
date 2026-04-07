import { useState, useEffect } from "react";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  dueDate?: string; // "YYYY-MM-DD"
}

const STORAGE_KEY = "wall-calendar-todos";

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, dueDate?: string) => {
    if (!text.trim()) return;
    setTodos((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: text.trim(),
        done: false,
        createdAt: Date.now(),
        dueDate: dueDate || undefined,
      },
    ]);
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const setDone = (id: string, done: boolean) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done } : t))
    );

  const updateDueDate = (id: string, dueDate?: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate: dueDate || undefined } : t))
    );

  return { todos, addTodo, toggleTodo, deleteTodo, setDone, updateDueDate };
}

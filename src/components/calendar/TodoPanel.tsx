import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { X, Plus, GripVertical, Check, Trash2, ClipboardList, Calendar } from "lucide-react";
import { format, parseISO, isToday, isBefore, startOfDay } from "date-fns";
import type { useTodos, Todo } from "@/hooks/useTodos";

interface TodoPanelProps {
  onClose: () => void;
  todoState: ReturnType<typeof useTodos>;
}

const todayStr = () => format(new Date(), "yyyy-MM-dd");

function formatDueLabel(dueDate: string): string {
  const today = todayStr();
  if (dueDate === today) return "Today";
  try {
    const d = parseISO(dueDate);
    return format(d, "MMM d");
  } catch {
    return dueDate;
  }
}

function getDueBadgeStyle(dueDate: string): string {
  const today = todayStr();
  if (dueDate < today)
    return "bg-red-500/10 text-red-500 border-red-200 dark:border-red-900";
  if (dueDate === today)
    return "bg-electric-blue/10 text-electric-blue border-electric-blue/20";
  return "bg-muted text-muted-foreground border-border";
}

export function TodoPanel({ onClose, todoState }: TodoPanelProps) {
  const { todos, addTodo, toggleTodo, deleteTodo, setDone, updateDueDate } = todoState;
  const [inputValue, setInputValue] = useState("");
  const [inputDate, setInputDate] = useState(todayStr());
  const [dragOverZone, setDragOverZone] = useState<"todo" | "done" | null>(null);
  const draggedId = useRef<string | null>(null);

  const pendingTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);

  const handleAdd = () => {
    addTodo(inputValue, inputDate || undefined);
    setInputValue("");
    setInputDate(todayStr());
  };

  const handleDragStart = (id: string) => { draggedId.current = id; };
  
  const handleDragEnd = (id: string, info: PanInfo) => { 
    draggedId.current = null; 
    setDragOverZone(null);

    // Identify which zone the user dropped the card on
    const elem = document.elementFromPoint(info.point.x, info.point.y);
    const dropZone = elem?.closest('[data-zone]')?.getAttribute('data-zone');

    if (dropZone === "todo") {
      setDone(id, false);
    } else if (dropZone === "done") {
      setDone(id, true);
    }
  };

  const handleDropOnZone = (done: boolean) => {
    if (draggedId.current) setDone(draggedId.current, done);
    setDragOverZone(null);
  };

  // Portal mounting
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "88vh" }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-electric-blue/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-electric-blue" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">Tasks & Reminders</h2>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-electric-blue font-semibold">{pendingTodos.length}</span> pending
                {" · "}
                <span className="text-green-500 font-semibold">{doneTodos.length}</span> done
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add task bar */}
        <div className="px-6 py-3 border-b border-border bg-muted/20 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && handleAdd()}
              placeholder="What needs to be done?"
              className="flex-1 text-sm bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {/* Date row */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {inputDate && (
              <button
                onClick={() => setInputDate("")}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                Clear
              </button>
            )}
            <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
              Due date
            </span>
          </div>
        </div>

        {/* Two-column board */}
        <div className="grid grid-cols-2 divide-x divide-border flex-1 overflow-hidden">

          {/* TO DO */}
          <div
            data-zone="todo"
            className={`flex flex-col p-4 transition-colors duration-200 ${dragOverZone === "todo" ? "bg-electric-blue/5" : "bg-card"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverZone("todo"); }}
            onDragLeave={() => setDragOverZone(null)}
            onDrop={(e) => { e.preventDefault(); handleDropOnZone(false); }}
          >
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-electric-blue" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">To Do</span>
              {pendingTodos.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-electric-blue/10 text-electric-blue ml-auto">
                  {pendingTodos.length}
                </span>
              )}
            </div>

            <div className={`flex-1 overflow-y-auto space-y-2 rounded-xl transition-all duration-200 ${dragOverZone === "todo" ? "ring-2 ring-electric-blue/30 ring-inset p-2" : ""}`}>
              <AnimatePresence initial={false}>
                {pendingTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onDragStart={() => handleDragStart(todo.id)}
                    onDragEnd={(info) => handleDragEnd(todo.id, info)}
                    onDateChange={(d) => updateDueDate(todo.id, d)}
                    isDone={false}
                  />
                ))}
              </AnimatePresence>
              {pendingTodos.length === 0 && (
                <div className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed transition-colors ${dragOverZone === "todo" ? "border-electric-blue/50 text-electric-blue" : "border-border text-muted-foreground/30"}`}>
                  <p className="text-xs">No pending tasks</p>
                  <p className="text-[10px] mt-1 opacity-60">Drop here to restore</p>
                </div>
              )}
            </div>
          </div>

          {/* DONE */}
          <div
            data-zone="done"
            className={`flex flex-col p-4 transition-colors duration-200 ${dragOverZone === "done" ? "bg-green-500/5" : "bg-muted/25"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverZone("done"); }}
            onDragLeave={() => setDragOverZone(null)}
            onDrop={(e) => { e.preventDefault(); handleDropOnZone(true); }}
          >
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Done</span>
              {doneTodos.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 ml-auto">
                  {doneTodos.length}
                </span>
              )}
            </div>

            <div className={`flex-1 overflow-y-auto space-y-2 rounded-xl transition-all duration-200 ${dragOverZone === "done" ? "ring-2 ring-green-500/30 ring-inset p-2" : ""}`}>
              <AnimatePresence initial={false}>
                {doneTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onDragStart={() => handleDragStart(todo.id)}
                    onDragEnd={(info) => handleDragEnd(todo.id, info)}
                    onDateChange={(d) => updateDueDate(todo.id, d)}
                    isDone={true}
                  />
                ))}
              </AnimatePresence>
              {doneTodos.length === 0 && (
                <div className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed transition-colors ${dragOverZone === "done" ? "border-green-500/50 text-green-500" : "border-border text-muted-foreground/30"}`}>
                  <p className="text-xs">Nothing completed yet</p>
                  <p className="text-[10px] mt-1 opacity-60">Drag tasks here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Drag cards between columns · Click ✓ to toggle · Click date to edit
          </p>
          <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
            {format(new Date(), "EEE, MMM d")}
          </p>
        </div>
      </motion.div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

/* ── Individual todo card ── */
interface TodoCardProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: (info: PanInfo) => void;
  onDateChange: (date?: string) => void;
  isDone: boolean;
}

function TodoCard({ todo, onToggle, onDelete, onDragStart, onDragEnd, onDateChange, isDone }: TodoCardProps) {
  const [editingDate, setEditingDate] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      drag
      dragSnapToOrigin
      whileDrag={{ zIndex: 50, scale: 1.05, opacity: 0.9 }}
      onDragStart={onDragStart}
      onDragEnd={(e, info) => onDragEnd(info)}
      className={`group flex flex-col gap-1.5 p-3 rounded-xl border bg-card shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 select-none ${isDone ? "border-border/40 opacity-65" : "border-border hover:border-electric-blue/30"}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/20 group-hover:text-muted-foreground/50" />

        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isDone ? "bg-green-500 border-green-500" : "border-muted-foreground/30 hover:border-electric-blue"}`}
        >
          {isDone && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
        </button>

        <span className={`flex-1 text-sm leading-snug min-w-0 ${isDone ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
          {todo.text}
        </span>

        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Date row */}
      <div className="flex items-center gap-1.5 pl-8">
        {editingDate ? (
          <input
            type="date"
            defaultValue={todo.dueDate || format(new Date(), "yyyy-MM-dd")}
            autoFocus
            onBlur={(e) => { onDateChange(e.target.value || undefined); setEditingDate(false); }}
            onChange={(e) => onDateChange(e.target.value || undefined)}
            className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ) : todo.dueDate ? (
          <button
            onClick={(e) => { e.stopPropagation(); setEditingDate(true); }}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors ${getDueBadgeStyle(todo.dueDate)}`}
          >
            {formatDueLabel(todo.dueDate)}
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setEditingDate(true); }}
            className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            + set date
          </button>
        )}
      </div>
    </motion.div>
  );
}

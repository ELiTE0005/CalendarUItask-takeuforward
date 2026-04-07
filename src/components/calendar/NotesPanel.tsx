import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, Plus, Check, Trash2, CheckCircle2, Bell,
  AlertCircle, Clock, CalendarDays, Layers,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useTodos } from "@/hooks/useTodos";
import { TodoPanel } from "./TodoPanel";

const todayStr = () => format(new Date(), "yyyy-MM-dd");

function formatDueLabel(dueDate: string): string {
  const today = todayStr();
  if (dueDate === today) return "Today";
  try { return format(parseISO(dueDate), "MMM d"); } catch { return dueDate; }
}

export function NotesPanel() {
  const todoState = useTodos();
  const { todos, addTodo, toggleTodo, deleteTodo, updateDueDate } = todoState;

  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [quickInput, setQuickInput] = useState("");
  const [quickDate, setQuickDate] = useState(todayStr());
  const [showDone, setShowDone] = useState(false);
  const toastShown = useRef(false);

  const today = todayStr();
  const pendingTodos = todos.filter((t) => !t.done);
  const doneTodos   = todos.filter((t) => t.done);

  // Grouped pending
  const overdueItems  = pendingTodos.filter((t) => t.dueDate && t.dueDate < today).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const todayItems    = pendingTodos.filter((t) => t.dueDate === today);
  const upcomingItems = pendingTodos.filter((t) => t.dueDate && t.dueDate > today).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const nodateItems   = pendingTodos.filter((t) => !t.dueDate);

  // On mount: show toast for today/overdue tasks
  useEffect(() => {
    if (toastShown.current) return;
    toastShown.current = true;
    const td = todos.filter((t) => !t.done && t.dueDate === today);
    const ov = todos.filter((t) => !t.done && t.dueDate && t.dueDate < today);
    if (td.length > 0) {
      toast(`📋 ${td.length} task${td.length > 1 ? "s" : ""} due today`, {
        description: td.slice(0, 2).map((t) => `• ${t.text}`).join("\n"),
        duration: 5000,
      });
    }
    if (ov.length > 0) {
      toast.warning(`⚠️ ${ov.length} overdue task${ov.length > 1 ? "s" : ""}`, {
        description: ov.slice(0, 2).map((t) => `• ${t.text} (${formatDueLabel(t.dueDate!)})`).join("\n"),
        duration: 6000,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuickAdd = () => {
    if (!quickInput.trim()) return;
    addTodo(quickInput, quickDate || undefined);
    setQuickInput("");
    setQuickDate(todayStr());
  };

  return (
    <>
      <div className="bg-card flex flex-col h-full min-h-[300px] md:min-h-0 w-full">

        {/* ─── Header ─── */}
        <div className="px-5 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-electric-blue" />
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                Reminders
              </h3>
              {(overdueItems.length > 0 || todayItems.length > 0) && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-electric-blue text-white leading-none">
                  {overdueItems.length + todayItems.length}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsTodoOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-200
                border-electric-blue/30 text-electric-blue
                hover:bg-electric-blue hover:text-white hover:border-electric-blue hover:shadow-md active:scale-95"
              style={{ background: "hsl(var(--electric-blue) / 0.07)" }}
            >
              <BookOpen className="w-3 h-3" />
              Notes!
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/55 pl-5">
            {pendingTodos.length === 0
              ? "All caught up — nothing pending"
              : overdueItems.length > 0
              ? `${overdueItems.length} overdue · ${todayItems.length} today`
              : todayItems.length > 0
              ? `${todayItems.length} due today`
              : `${pendingTodos.length} task${pendingTodos.length > 1 ? "s" : ""} scheduled`}
          </p>
        </div>

        {/* ─── Main scrollable area ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">

          {/* Empty state */}
          {pendingTodos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-electric-blue/8 flex items-center justify-center mb-3 border border-electric-blue/15">
                <CheckCircle2 className="w-6 h-6 text-electric-blue/40" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground/50">All caught up!</p>
              <p className="text-[10px] text-muted-foreground/35 mt-1">Add a reminder below</p>
            </div>
          )}

          {/* — OVERDUE — */}
          {overdueItems.length > 0 && (
            <Section
              icon={<AlertCircle className="w-3 h-3 text-red-500" />}
              label="Overdue"
              count={overdueItems.length}
              labelClass="text-red-500"
              dotClass="bg-red-500"
            >
              {overdueItems.map((todo) => (
                <ReminderCard
                  key={todo.id}
                  text={todo.text}
                  dueDate={todo.dueDate}
                  dueStyle="text-red-500"
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onDateChange={(d) => updateDueDate(todo.id, d)}
                />
              ))}
            </Section>
          )}

          {/* — TODAY — */}
          {todayItems.length > 0 && (
            <Section
              icon={<Clock className="w-3 h-3 text-electric-blue" />}
              label="Today"
              count={todayItems.length}
              labelClass="text-electric-blue"
              dotClass="bg-electric-blue"
            >
              {todayItems.map((todo) => (
                <ReminderCard
                  key={todo.id}
                  text={todo.text}
                  dueDate={todo.dueDate}
                  dueStyle="text-electric-blue font-semibold"
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onDateChange={(d) => updateDueDate(todo.id, d)}
                />
              ))}
            </Section>
          )}

          {/* — UPCOMING — */}
          {upcomingItems.length > 0 && (
            <Section
              icon={<CalendarDays className="w-3 h-3 text-muted-foreground" />}
              label="Upcoming"
              count={upcomingItems.length}
              labelClass="text-muted-foreground"
              dotClass="bg-muted-foreground/50"
            >
              {upcomingItems.map((todo) => (
                <ReminderCard
                  key={todo.id}
                  text={todo.text}
                  dueDate={todo.dueDate}
                  dueStyle="text-muted-foreground"
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onDateChange={(d) => updateDueDate(todo.id, d)}
                />
              ))}
            </Section>
          )}

          {/* — SOMEDAY (no date) — */}
          {nodateItems.length > 0 && (
            <Section
              icon={<Layers className="w-3 h-3 text-muted-foreground/40" />}
              label="Someday"
              count={nodateItems.length}
              labelClass="text-muted-foreground/50"
              dotClass="bg-muted-foreground/25"
            >
              {nodateItems.map((todo) => (
                <ReminderCard
                  key={todo.id}
                  text={todo.text}
                  dueDate={undefined}
                  dueStyle="text-muted-foreground/40"
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onDateChange={(d) => updateDueDate(todo.id, d)}
                />
              ))}
            </Section>
          )}

          {/* — COMPLETED — */}
          {doneTodos.length > 0 && (
            <div>
              <button
                onClick={() => setShowDone((s) => !s)}
                className="flex items-center gap-2 w-full text-[10px] font-bold uppercase tracking-[0.18em]
                  text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors py-1 mb-1"
              >
                <CheckCircle2 className="w-3 h-3 text-green-500/50" />
                Completed ({doneTodos.length})
                <span className="ml-auto">{showDone ? "▴" : "▾"}</span>
              </button>

              <AnimatePresence>
                {showDone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    {doneTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/30 bg-muted/15 opacity-55"
                      >
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"
                        >
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                        </button>
                        <span className="flex-1 text-xs text-muted-foreground line-through leading-snug">
                          {todo.text}
                        </span>
                        {todo.dueDate && (
                          <span className="text-[10px] text-muted-foreground/40">
                            {formatDueLabel(todo.dueDate)}
                          </span>
                        )}
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:text-destructive text-muted-foreground/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ─── Quick add ─── */}
        <div className="px-4 pb-4 pt-3 border-t border-border/60 space-y-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
              placeholder="Add a reminder…"
              className="flex-1 text-xs bg-muted/40 border border-border rounded-xl px-3.5 py-2.5
                text-foreground placeholder:text-muted-foreground/40
                focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              onClick={handleQuickAdd}
              disabled={!quickInput.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-electric-blue text-white
                disabled:opacity-30 hover:bg-electric-blue/90 active:scale-95 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Date picker row */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="flex-1 text-[11px] bg-muted/40 border border-border rounded-lg px-3 py-1.5
                text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {quickDate && (
              <button
                onClick={() => setQuickDate("")}
                className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors whitespace-nowrap"
              >
                No date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full management modal — shares same state instance */}
      <AnimatePresence>
        {isTodoOpen && (
          <TodoPanel
            onClose={() => setIsTodoOpen(false)}
            todoState={todoState}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Section wrapper ── */
function Section({
  icon, label, count, labelClass, dotClass, children,
}: {
  icon: React.ReactNode; label: string; count: number;
  labelClass: string; dotClass: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>
          {label}
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground ml-1`}>
          {count}
        </span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

/* ── Reminder card (sidebar) ── */
function ReminderCard({
  text, dueDate, dueStyle, onToggle, onDelete, onDateChange,
}: {
  text: string; dueDate?: string; dueStyle: string;
  onToggle: () => void; onDelete: () => void; onDateChange: (d?: string) => void;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const today = todayStr();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="group flex flex-col gap-1 p-3 rounded-xl border
        bg-muted/30 hover:bg-muted/60
        border-border/50 hover:border-electric-blue/25
        shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/25
            hover:border-electric-blue hover:bg-electric-blue/10
            transition-all duration-200 flex items-center justify-center"
        />
        <span className="flex-1 text-sm text-foreground leading-snug">{text}</span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center
            rounded-lg hover:bg-destructive/10 hover:text-destructive
            text-muted-foreground/30 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Due date */}
      <div className="pl-7">
        {editingDate ? (
          <input
            type="date"
            defaultValue={dueDate || today}
            autoFocus
            onBlur={(e) => { onDateChange(e.target.value || undefined); setEditingDate(false); }}
            onChange={(e) => onDateChange(e.target.value || undefined)}
            className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : dueDate ? (
          <button
            onClick={() => setEditingDate(true)}
            className={`text-[10px] font-medium hover:underline transition-colors ${dueStyle}`}
          >
            {formatDueLabel(dueDate)}
          </button>
        ) : (
          <button
            onClick={() => setEditingDate(true)}
            className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            + set date
          </button>
        )}
      </div>
    </motion.div>
  );
}

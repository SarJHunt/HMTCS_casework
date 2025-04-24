"use client";
import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { format } from "date-fns-tz";
import { parseISO } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  due_date?: string;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "Open",
    dueDate: "",
  });
  const [editedTask, setEditedTask] = useState<{ id: number; status?: string; dueDate?: string } | null>(null);

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  const getTaskDate = (task: Task): string | undefined => {
    return task.dueDate || task.due_date;
  };

  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return "No due date";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd");
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        const normalized = data.map((task: Task) => ({
          ...task,
          dueDate: task.due_date || task.dueDate,
        }));
        setTasks(normalized);
      } catch {
        toast.error("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    if (newTask.title.length > 100) {
      toast.error("Title must be 100 characters or less.");
      return;
    }
    if (newTask.description.length > 500) {
      toast.error("Description must be 500 characters or less.");
      return;
    }
    if (!newTask.dueDate) {
      toast.error("Due date is required.");
      return;
    }
    if (new Date(newTask.dueDate) < new Date()) {
      toast.error("Due date must be in the future.");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, due_date: newTask.dueDate }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      const created = await response.json();
      setTasks((prev) => [...prev, { ...created, dueDate: created.due_date }]);
      setNewTask({ title: "", description: "", status: "Open", dueDate: "" });
      toast.success("Task created!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const updateTask = async (id: number) => {
    if (!editedTask) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editedTask, due_date: editedTask.dueDate }),
      });
      if (!response.ok) throw new Error("Update failed");
      const updated = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updated, dueDate: updated.due_date } : task))
      );
      setEditedTask(null);
      toast.success("Task updated!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted.");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const initializeEditTask = (task: Task) => {
    setEditedTask({
      id: task.id,
      status: task.status,
      dueDate: getTaskDate(task) || "",
    });
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h3 className="font-bold mb-2">Create a new task</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <select
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          className="border p-2 mr-2 rounded"
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button onClick={createTask} className="bg-green-500 text-white px-4 py-2 rounded">
          Add task
        </button>
      </div>

      {tasks.length > 0 && <h3 className="font-semibold mb-4">All tasks</h3>}
      {tasks.map((task) => (
        <div key={task.id} className="border p-4 mb-2 rounded">
          <h3 className="font-bold">{task.title}</h3>
          <p>Description: {task.description}</p>
          <p>Status: {task.status}</p>
          <p>Due date: {formatDateForDisplay(getTaskDate(task))}</p>
          <div className="mt-2 flex gap-2">
            <select
              value={editedTask?.id === task.id ? editedTask.status : task.status}
              onChange={(e) => {
                if (!editedTask || editedTask.id !== task.id) initializeEditTask(task);
                setEditedTask((prev) => ({ ...(prev || { id: task.id }), status: e.target.value }));
              }}
              className="border p-2 rounded"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="date"
              value={
                editedTask?.id === task.id
                  ? formatDateForInput(editedTask.dueDate)
                  : formatDateForInput(getTaskDate(task))
              }
              onChange={(e) => {
                if (!editedTask || editedTask.id !== task.id) initializeEditTask(task);
                setEditedTask((prev) => ({ ...(prev || { id: task.id }), dueDate: e.target.value }));
              }}
              className="border p-2 rounded"
            />
            <button onClick={() => updateTask(task.id)} className="bg-blue-500 text-white px-4 py-2 rounded">
              Update
            </button>
            <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-800">
              <Trash size={20} />
            </button>
          </div>
        </div>
      ))}
      {tasks.length === 0 && !loading && <p>No tasks available</p>}
    </div>
  );
};

export default TaskList;

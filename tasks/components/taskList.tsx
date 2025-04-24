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
  const [newTask, setNewTask] = useState<{ title: string; description: string; status: string; dueDate?: string }>({
    title: "",
    description: "",
    status: "Open",
    dueDate: "",
  });
  const [editedTask, setEditedTask] = useState<{ id: number; status?: string; dueDate?: string } | null>(null);

  // Helper function to format dates for HTML inputs (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Helper function to get date from task
  const getTaskDate = (task: Task): string | undefined => {
    return task.dueDate || task.due_date;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return "No due date";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "Invalid date";
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();

        const normalizedData = data.map((task: Task) => ({
          ...task,
          dueDate: task.due_date || task.dueDate,
        }));

        setTasks(normalizedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message || "Failed to load tasks.");
        } else {
          toast.error("Failed to load tasks.");
        }
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

    try {
      const apiTask = { ...newTask, due_date: newTask.dueDate };
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiTask),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const createdTask = await response.json();
      const normalizedTask = {
        ...createdTask,
        dueDate: createdTask.due_date || createdTask.dueDate,
      };

      setTasks((prevTasks) => [...prevTasks, normalizedTask]);
      setNewTask({ title: "", description: "", status: "Open", dueDate: "" });
      toast.success("Task created successfully!");
    } catch (err: unknown) {
      console.error("Error creating task:", err);
      if (err instanceof Error) {
        toast.error(`Failed to create task: ${err.message}`);
      } else {
        toast.error("Failed to create task.");
      }
    }
  };

  const updateTask = async (id: number) => {
    if (!editedTask) return;

    try {
      const apiTask = { ...editedTask, due_date: editedTask.dueDate };
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiTask),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTaskFromApi = await response.json();
      const normalizedTask = {
        ...updatedTaskFromApi,
        dueDate: updatedTaskFromApi.due_date || updatedTaskFromApi.dueDate,
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...normalizedTask } : task
        )
      );
      setEditedTask(null);
      toast.success("Task updated successfully!");
    } catch (err: unknown) {
      console.error("Error updating task:", err);
      if (err instanceof Error) {
        toast.error(`Failed to update task: ${err.message}`);
      } else {
        toast.error("Failed to update task.");
      }
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      toast.success("Task deleted successfully!");
    } catch (err: unknown) {
      console.error("Error deleting task:", err);
      if (err instanceof Error) {
        toast.error(`Failed to delete task: ${err.message}`);
      } else {
        toast.error("Failed to delete task.");
      }
    }
  };

  const initializeEditTask = (task: Task) => {
    const initialEditState = {
      id: task.id,
      status: task.status,
      dueDate: getTaskDate(task) || "",
    };
    setEditedTask(initialEditState);
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Add a Task Form */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Create a new task</h3>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="Task description"
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
          <option value="In progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="date"
          value={newTask.dueDate || ""}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={createTask}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add task
        </button>
      </div>
  
      {/* List of Tasks */}
      {tasks.length > 0 && (
        <h3 className="font-semibold mb-4">All tasks</h3>
      )}
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
                if (!editedTask || editedTask.id !== task.id) {
                  initializeEditTask(task);
                }
                setEditedTask((prev) => ({
                  ...(prev || { id: task.id }),
                  status: e.target.value,
                }));
              }}
              className="border p-2 rounded"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In progress</option>
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
                if (!editedTask || editedTask.id !== task.id) {
                  initializeEditTask(task);
                }
                setEditedTask((prev) => ({
                  ...(prev || { id: task.id }),
                  dueDate: e.target.value,
                }));
              }}
              className="border p-2 rounded"
            />
            <button
              onClick={() => updateTask(task.id)}
              className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded"
            >
              Update
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
            >
              <Trash size={20} />
            </button>
          </div>
        </div>
      ))}
      {tasks.length === 0 && !loading && (
        <p>No tasks available</p>
      )}
    </div>
  );
};

export default TaskList;
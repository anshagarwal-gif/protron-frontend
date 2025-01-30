import React, { createContext, useState, useContext } from "react";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Code Review",
      description: "Review the recent pull requests in the repository.",
      start: new Date("2025-01-27T14:00:00").toISOString(),
      end: new Date("2025-01-27T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Approved",
    },
    {
      id: 2,
      name: "Code Review",
      description: "Review the recent pull requests in the repository.",
      start: new Date("2025-01-27T14:00:00").toISOString(),
      end: new Date("2025-01-27T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Rejected",
    },
    {
      id: 3,
      name: "Code Review",
      description: "Review the recent pull requests in the repository.",
      start: new Date("2025-01-27T14:00:00").toISOString(),
      end: new Date("2025-01-27T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Send for Approval",
    },
    {
      id: 4,
      name: "Code Review",
      description: "Review the recent pull requests in the repository.",
      start: new Date("2025-01-27T14:00:00").toISOString(),
      end: new Date("2025-01-27T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 5,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 6,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 7,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 8,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 9,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 10,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 11,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 12,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 13,
      name: "PR Review",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Pending",
    },
    {
      id: 14,
      name: "AB deploy",
      description: "Review the recent pull requests in the repository of github.",
      start: new Date("2025-01-22T14:00:00").toISOString(),
      end: new Date("2025-01-22T15:00:00").toISOString(),
      duration: "1 hour",
      status: "Send for Approval",
    },
  ]);

  const addTask = (task) => setTasks([...tasks, task]);

  const updateTaskStatus = (id, status) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);

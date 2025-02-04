import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useTasks } from "../TaskContext";

const Manager = () => {
  const [sorted, setSorted] = useState(false);
  const { tasks, updateTaskStatus } = useTasks();

  const handleApprove = (id) => updateTaskStatus(id, "Approved");
  const handleReject = (id) => updateTaskStatus(id, "Rejected");

  const handleSortById = () => {
    const sortedTasks = [...tasks].sort((a, b) => a.id - b.id);
    setTasks(sortedTasks);
    setSorted(!sorted);
  };
  

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "tasks.xlsx");
  };

  return (
    <Box p={3}>
      <h1>Manager Dashboard</h1>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" onClick={handleSortById}>
          Sort by ID {sorted ? "(Descending)" : "(Ascending)"}
        </Button>
        <Button variant="contained" color="secondary" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Task Name</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              (task.status == "Pending" && <TableRow key={task.id}>
                <TableCell>{task.id}</TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.start}</TableCell>
                <TableCell>{task.end}</TableCell>
                <TableCell>{task.status || "Pending"}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(task.id)}
                    style={{ marginRight: "8px" }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(task.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>)
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Manager;
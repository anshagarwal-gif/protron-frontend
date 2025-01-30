import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import { Check, Close, Send, PendingActions } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useTasks } from "../TaskContext";

export const User = () => {
  const { tasks, updateTaskStatus, addTask } = useTasks(); // Accessing context methods
  const [page, setPage] = useState(1)
  
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState("User");
  
  const rowsPerPage = 5
  const handleAddTask = () => {
    if (!taskName || !taskDescription || !startTime) return;
    
    const startDateTime = new Date(startTime);
    const endDateTime = endTime
    ? new Date(endTime)
    : new Date(startDateTime.getTime() + 60 * 60 * 1000);
    
    const newTask = {
      id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
      name: taskName,
      description: taskDescription,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      duration: `${(endDateTime - startDateTime) / 60000} minutes`,
      status: "Send for Approval",
    };
    
    addTask(newTask); // Add task using context
    setTaskName("");
    setTaskDescription("");
    setStartTime("");
    setEndTime("");
    setIsDialogOpen(false);
  };

  const filteredTasks = tasks
  .filter((task) => {
    const matchesSearch =
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        
      // Filter by single date
      if (filterDate) {
        matchesDate =
          new Date(task.start).toLocaleDateString() ===
          new Date(filterDate).toLocaleDateString();
        }
        
        // Filter by date range
        if (filterStartDate && filterEndDate) {
        const taskDate = new Date(task.start);
        const startDate = new Date(filterStartDate);
        const endDate = new Date(filterEndDate);
        matchesDate = taskDate >= startDate && taskDate <= endDate;
      }
      
      const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;

      return matchesSearch && matchesDate && matchesStatus;
    })
    .sort((a, b) => a.id - b.id);

    const paginatedTasks = filteredTasks.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const exportToExcel = () => {
      const dataForExport = filteredTasks.map((task) => ({
      "Task ID": task.id,
      "Task Name": task.name,
      "Task Description": task.description,
      "Start Date/Time": new Date(task.start).toLocaleString(),
      "End Date/Time": new Date(task.end).toLocaleString(),
      "Duration": task.duration,
      Status: task.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  return (
    <Box display="flex">
      <Drawer
        variant="permanent"
        anchor="left"
        PaperProps={{ style: { width: "15%" } }}
      >
        <List>
          <ListItem button>
            <ListItemText primary="Timesheet" />
          </ListItem>
        </List>
      </Drawer>

      <Box width="85%" marginLeft="15%" p={3}>
        <Typography variant="h4" marginBottom="50px" gutterBottom>
          Employee Timesheet
        </Typography>

        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          {userRole === "User" && (
            <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
              Add Task
            </Button>
          )}

          <Box display="flex" gap={2}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
            {/* Filter by single date */}
            <TextField
              label="Filter by Date"
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterStartDate(""); // Reset range filter if date filter is used
                setFilterEndDate("");
                setFilterDate(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            {/* Filter by date range */}
            <TextField
              label="Start Date"
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterDate(""); // Reset single date filter if range filter is used
                setFilterStartDate(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            <FormControl size="small">
              <InputLabel shrink>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Send for Approval">Send for Approval</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </Box>
        </Box>
        <Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Task Description</TableCell>
                  <TableCell>Start Date/Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{new Date(task.start).toLocaleString()}</TableCell>
                    <TableCell>{task.duration}</TableCell>
                    <TableCell>
                      {task.status === "Send for Approval" && <PendingActions color="warning" />}
                      {task.status === "Approved" && <Check color="success" />}
                      {task.status === "Rejected" && <Close color="error" />}
                      {task.status === "Pending" && <PendingActions color="info" />}
                    </TableCell>
                    <TableCell>
                      {userRole === "Admin" ? (
                        <>
                          <Button startIcon={<Check />} color="success" onClick={() => updateTaskStatus(task.id, "Approved")}>Approve</Button>
                          <Button startIcon={<Close />} color="error" onClick={() => updateTaskStatus(task.id, "Rejected")}>Reject</Button>
                        </>
                      ) : (
                        <Button startIcon={<Send />} color="primary" disabled={task.status !== "Send for Approval"} onClick={() => updateTaskStatus(task.id, "Pending")}>
                          Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination count={Math.ceil(filteredTasks.length / rowsPerPage)} page={page} onChange={(event, value) => setPage(value)} sx={{ display: "flex", justifyContent: "center", marginTop: 2 }} />
        </Paper>
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Add Task</DialogTitle>
          <DialogContent>
            <TextField
              label="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

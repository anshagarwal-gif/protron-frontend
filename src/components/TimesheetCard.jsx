import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import * as XLSX from 'xlsx';
import axios from 'axios';

const TimesheetCard = ({ timesheet, onDelete, setTimesheets }) => {
 
  const [tasks, setTasks] = useState(timesheet.tasks || []);
  const [newTask, setNewTask] = useState({
    taskName: '',
    taskDescription: '',
    startTime: '',
    endTime: '',
    duration: '',
    timesheetId: timesheet.timesheetId
  });
  const [isOpen, setIsOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [approversModalOpen, setApproversModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [approvers, setApprovers] = useState([]); // List of available approvers
  const [selectedApprovers, setSelectedApprovers] = useState([]); // Selected approvers

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get("http://localhost:8282/approvers/getApprovers");
        setApprovers(response.data);
      } catch (error) {
        console.error("Error fetching approvers:", error);
      }
    };

    fetchApprovers();
  }, []);

  const getTotalDuration = () => {
    return tasks.reduce((acc, task) => acc + parseFloat(task.duration), 0).toFixed(2);
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / 1000 / 60 / 60;
    return duration.toFixed(2);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // const areApproversValid = () => {
  //   return approvers.every(approver =>
  //     approver.email.trim() === '' || isValidEmail(approver.email)
  //   ) && approvers.some(approver =>
  //     approver.email.trim() !== '' && isValidEmail(approver.email)
  //   );
  // };


  const addTask = async () => {
    if (newTask.startTime && newTask.endTime) {
      const duration = calculateDuration(newTask.startTime, newTask.endTime);
      const taskWithId = {
        ...newTask,
        duration,
        timesheetId: timesheet.timesheetId
      };

      try {
        if (editingTaskId) {

          const updatedTask = await axios.put(`http://localhost:8282/tasks/${editingTaskId}`, taskWithId);
          setTasks(tasks.map((task) => (task.taskId === editingTaskId ? updatedTask.data : task)));
        } else {

          const response = await axios.post('http://localhost:8282/tasks/create', taskWithId);

          setTasks([...tasks, response.data]);
        }


        setNewTask({ taskName: '', taskDescription: '', startTime: '', endTime: '', duration: '', timesheetId: timesheet.timesheetId });
        setOpenDialog(false);
        setEditingTaskId(null);
        setIsOpen(true);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`http://localhost:8282/tasks/${taskId}`);
      if (response.status === 204) {
        setTasks(tasks.filter((task) => task.taskId !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteTimesheet = () => {
    onDelete(timesheet.timesheetId);
  };


  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTask({ taskName: '', taskDescription: '', startTime: '', endTime: '', duration: '', timesheetId: timesheet.timesheetId });
    setEditingTaskId(null);
  };

  const handleDialogOpen = (task = null) => {
    if (task) {
      setNewTask(task);
      setEditingTaskId(task.taskId);
    } else {
      setNewTask({ taskName: '', taskDescription: '', startTime: '', endTime: '', duration: '', timesheetId: timesheet.timesheetId });
      setEditingTaskId(null);
    }
    setOpenDialog(true);
  };


  // const addApproverField = () => {
  //   setApprovers([...approvers, { email: '' }]);
  // };

  const handleApproverEmailChange = (index, value) => {
    const newApprovers = [...approvers];
    newApprovers[index].email = value;
    setApprovers(newApprovers);
  };

  // const removeApproverField = (index) => {
  //   const newApprovers = approvers.filter((_, i) => i !== index);
  //   setApprovers(newApprovers);
  // };

  // Export function
  const exportToExcel = () => {
    if (tasks.length === 0) {
      setSnackbar({
        open: true,
        message: 'No tasks to export',
        severity: 'warning'
      });
      alert('No tasks to export');
      return;
    }
    const exportData = tasks.map(task => ({
      "Task ID": task.taskId,
      "Name": task.taskName,
      "Task Description": task.taskDescription,
      "Start Date/Time": task.startTime,
      "End Date/Time": task.endTime,
      "Duration (hours)": task.duration
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, `${timesheet.date}_tasks.xlsx`);
  };

  // Submit timesheet function
  const submitTimesheet = async () => {
    try {
      const employeeId = '1';

      // Check if tasks array is empty
      if (tasks.length === 0) {
        setSnackbar({
          open: true,
          message: 'There are no tasks in the timesheet.',
          severity: 'warning',
        });
        return;
      }

      console.log('Approvers:', selectedApprovers, 'Tasks:', tasks);

      const formData = new URLSearchParams();
      formData.append("employeeId", employeeId);
      formData.append("timesheetId", timesheet.timesheetId);

      // Append selected approvers
      selectedApprovers.forEach(email => formData.append("approverEmails", email));

      // For debugging - log the form data
      console.log('Submitting with params:', Object.fromEntries(formData));

      const response = await axios.post('http://localhost:8282/submit', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.status === 200) {
        console.log('Process ID:', response.data);
        setSnackbar({
          open: true,
          message: 'Timesheet submitted for approval successfully!',
          severity: 'success'
        });

        // Close modal & reset selected approvers
        setApproversModalOpen(false);
        setApprovers([{ email: '' }]);
        setTimesheets((timesheets) => timesheets.map((ts) => {
          if (ts.timesheetId === timesheet.timesheetId) {
            return { ...ts, status: 'Pending' };
          }
          return ts;
        }));
      } else {
        throw new Error('Failed to submit timesheet');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit timesheet for approval',
        severity: 'error'
      });
      console.error('Error submitting timesheet:', error);
    }
  };

  // Status color function
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Card>
        <CardContent>
          {/* Header Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mr: 3 }}>{timesheet.date}</Typography>
              <Chip
                label={timesheet.status}
                color={getStatusColor(timesheet.status)}
                size="small"
                sx={{ mr: 3 }}
              />
              <Typography variant="subtitle1" sx={{ mr: 3 }}>
                Total Tasks: {tasks.length}
              </Typography>
              <Typography variant="subtitle1" sx={{ mr: 3 }}>
                Total Duration: {getTotalDuration()} Hr
              </Typography>
            </Box>

            <Box>
              {timesheet.status === 'Not Sent' && (
                <Button
                  size="small"
                  color="primary"
                  onClick={() => { setApproversModalOpen(true) }}
                  sx={{ mr: 2 }}
                >
                  <SendIcon />
                </Button>
              )}
              {timesheet.status === 'Not Sent' && (
                <Button
                  size="small"
                  onClick={() => handleDialogOpen()}
                  sx={{ mr: 2 }}
                >
                  <AddIcon />
                </Button>
              )}
              {timesheet.status === 'Not Sent' && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleDeleteTimesheet}
                  sx={{ mr: 2 }}
                >
                  <DeleteIcon />
                </Button>
              )}
              <Button
                size="small"
                color="success"
                onClick={exportToExcel}
                sx={{ mr: 2 }}
              >
                <FileDownloadIcon />
              </Button>
              <Button
                size="small"
                onClick={() => setIsOpen(!isOpen)}
                color="primary"
              >
                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
            </Box>
          </Box>

          {timesheet.status === 'Rejected' && timesheet.reason != "NA" && (
            <Typography>
              <strong>Reason: {timesheet.reason}</strong> 
            </Typography>)}

          {/* Tasks Table */}
          <Collapse in={isOpen}>
            <Box sx={{ mt: 2 }}>
              {tasks.length > 0 && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Task Description</TableCell>
                      <TableCell>Start Date/Time</TableCell>
                      <TableCell>End Date/Time</TableCell>
                      <TableCell>Duration (hours)</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.taskId}>
                        <TableCell>{task.taskId}</TableCell>
                        <TableCell>{task.taskName}</TableCell>
                        <TableCell>{task.taskDescription}</TableCell>
                        <TableCell>{task.startTime}</TableCell>
                        <TableCell>{task.endTime}</TableCell>
                        <TableCell>{task.duration}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleDialogOpen(task)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteTask(task.taskId)}
                            color="error"
                          >
                            <DeleteIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>

          {/* Add/Edit Task Dialog */}
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle>
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
            <DialogContent>
              <TextField
                label="Task Name"
                value={newTask.taskName}
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                fullWidth
                sx={{ mb: 2, mt: 2 }}
                required
              />
              <TextField
                label="Task Description"
                value={newTask.taskDescription}
                onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
                fullWidth
                sx={{ mb: 2, mt: 2 }}
                required
              />
              <TextField
                label="Start Date/Time"
                type="time"
                value={newTask.startTime ? newTask.startTime.split('T')[1] : ''}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  setNewTask({
                    ...newTask,
                    startTime: `${timesheet.date}T${newStartTime}`,
                  });
                }}
                fullWidth
                sx={{ mb: 2 }}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="End Date/Time"
                type="time"
                value={newTask.endTime ? newTask.endTime.split('T')[1] : ''}
                onChange={(e) => {
                  const newEndTime = e.target.value;
                  const newEndDateTime = `${timesheet.date}T${newEndTime}`;
                  setNewTask({
                    ...newTask,
                    endTime: newEndDateTime,
                    duration: newTask.startTime ?
                      calculateDuration(newTask.startTime, newEndDateTime) :
                      ''
                  });
                }}
                fullWidth
                sx={{ mb: 2 }}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="Duration (hours)"
                type="number"
                value={newTask.duration}
                onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                fullWidth
                required
                disabled
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button
                onClick={addTask}
                disabled={!newTask.taskName || !newTask.startTime || !newTask.endTime}
              >
                {editingTaskId ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={approversModalOpen}
            onClose={() => setApproversModalOpen(false)}
            PaperProps={{
              sx: { width: 500, maxHeight: 600 },
            }}
          >
            <DialogTitle>Add Approvers</DialogTitle>
            <DialogContent>
              {/* Searchable Dropdown */}
              <Autocomplete
                sx={{ mt: 2 }}
                multiple
                options={approvers.map((app) => app.email)}
                value={selectedApprovers}
                onChange={(event, newValue) => setSelectedApprovers(newValue)}
                renderInput={(params) => <TextField {...params} label="Search & Select Approvers" placeholder="Type to search" />}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setApproversModalOpen(false)}>Cancel</Button>
              <Button onClick={submitTimesheet} disabled={selectedApprovers.length === 0}>
                Submit for Approval
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default TimesheetCard;
import React, { useState } from 'react';
import { Card, CardContent, Button, Typography, Box, TextField, Table, TableHead, TableRow, TableCell, TableBody, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert } from '@mui/material';  
import * as XLSX from 'xlsx';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
const TimesheetCard = ({ timesheet, onDelete }) => {
  const [tasks, setTasks] = useState(timesheet.tasksarray);
  const [newTask, setNewTask] = useState({ taskid: '', name: '', startdatetime: '', enddatetime: '', duration: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  


  const submitTimesheet = async () => {
    try {
      // You should replace these with actual values from your authentication system
      const employeeId = '1223'; 
      
      const response = await fetch('http://localhost:8282/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          employeeId: employeeId,
          timesheetId: timesheet.uniqueid
        })
      });

      if (response.ok) {
        const processId = await response.text();
        console.log(processId);
        setSnackbar({
          open: true,
          message: 'Timesheet submitted for approval successfully!',
          severity: 'success'
        });
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
  const addTask = () => {
    if (newTask.startdatetime) {
      if (newTask.enddatetime) {
        const duration = calculateDuration(newTask.startdatetime, newTask.enddatetime);
        setNewTask((prevState) => ({ ...prevState, duration }));
      }

      const taskWithId = {
        ...newTask,
        taskid: editingTaskId || (tasks.length + 1).toString(),
      };

      if (editingTaskId) {
        setTasks(tasks.map((task) => (task.taskid === editingTaskId ? taskWithId : task)));
      } else {
        setTasks([...tasks, taskWithId]);
      }

      setNewTask({ taskid: '', name: '', startdatetime: '', enddatetime: '', duration: '' });
      setOpenDialog(false); 
      setEditingTaskId(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTask({ taskid: '', name: '', startdatetime: '', enddatetime: '', duration: '' });
    setEditingTaskId(null);
  };

  const handleDialogOpen = (task = null) => {
    if (task) {
      setNewTask(task);
      setEditingTaskId(task.taskid);
    } else {
      setNewTask({ taskid: '', name: '', startdatetime: '', enddatetime: '', duration: '' });
      setEditingTaskId(null);
    }
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.taskid !== taskId));
  };

  const handleDeleteTimesheet = () => {
    onDelete(timesheet.uniqueid);
  };

  const calculateDuration = (startdatetime, enddatetime) => {
    const start = new Date(startdatetime);
    const end = new Date(enddatetime);
    const duration = (end - start) / 1000 / 60 / 60;
    return duration.toFixed(2);
  };

  const exportToExcel = () => {
    const exportData = tasks.map(task => ({
      "Task ID": task.taskid,
      "Name": task.name,
      "Start Date/Time": task.startdatetime,
      "End Date/Time": task.enddatetime,
      "Duration (hours)": task.duration
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, `${timesheet.month}_${timesheet.year}_tasks.xlsx`);
  };

  return (
    <Card>
      <CardContent>
        <Box height='10px' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{timesheet.month} {timesheet.year}</Typography>

          <Box>
          <Button 
                size="small" 
                color="primary" 
                onClick={submitTimesheet} 
                startIcon={<SendIcon />}
                sx={{ mr: 2 }}
              >
                Submit for Approval
              </Button>
            <Button size="small" color="error" onClick={handleDeleteTimesheet} startIcon={<DeleteIcon />}>
              Delete
            </Button>
            <Button size="small" color="success" sx={{ ml: 2 }} onClick={exportToExcel} startIcon={<FileDownloadIcon />}>
              Export
            </Button>
            <Button size="small" onClick={() => setIsOpen(!isOpen)} color="primary" sx={{ ml: 2 }} startIcon={isOpen ? <AddIcon /> : <AddIcon />}>
              {isOpen ? 'Hide Tasks' : 'Show Tasks'}
            </Button>
          </Box>
        </Box>

        {/* Collapsible Section for Tasks */}
        <Collapse in={isOpen}>
          <Box sx={{ mt: 2 }}>
            <Button size="small" onClick={() => handleDialogOpen()} startIcon={<AddIcon />}>Add Task</Button>
            {tasks.length > 0 && (
              <Table sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Task ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Start Date/Time</TableCell>
                    <TableCell>End Date/Time</TableCell>
                    <TableCell>Duration (hours)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.taskid}>
                      <TableCell>{task.taskid}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.startdatetime}</TableCell>
                      <TableCell>{task.enddatetime}</TableCell>
                      <TableCell>{task.duration}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleDialogOpen(task)} startIcon={<EditIcon />}>Edit</Button>
                        <Button size="small" onClick={() => handleDeleteTask(task.taskid)} color="error" startIcon={<DeleteIcon />}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Collapse>
      </CardContent>

      {/* Dialog for Adding or Editing Task */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingTaskId ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <TextField 
            label="Task Name" 
            value={newTask.name} 
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} 
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            required
          />
          <TextField 
            label="Start Date/Time" 
            type="datetime-local" 
            value={newTask.startdatetime} 
            onChange={(e) => setNewTask({ ...newTask, startdatetime: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            label="End Date/Time" 
            type="datetime-local" 
            value={newTask.enddatetime} 
            onChange={(e) => {
              const enddatetime = e.target.value;
              setNewTask({ ...newTask, enddatetime });

              if (enddatetime && newTask.startdatetime) {
                const duration = calculateDuration(newTask.startdatetime, enddatetime);
                setNewTask((prevState) => ({ ...prevState, duration }));
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            label="Duration (hours)" 
            type="number" 
            value={newTask.duration} 
            onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button size="small" onClick={addTask} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
      open={snackbar.open} 
      autoHideDuration={1000} 
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        severity={snackbar.severity} 
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </Card>
  );
};

export default TimesheetCard;

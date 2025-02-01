import React, { useState } from 'react';
import { Card, CardContent, Button, Typography, Box, TextField, Table, TableHead, TableRow, TableCell, TableBody, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Chip} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import * as XLSX from 'xlsx';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const TimesheetCard = ({ timesheet, onDelete }) => {
  const [tasks, setTasks] = useState(timesheet.tasksarray);
  const [newTask, setNewTask] = useState({ taskid: '', name: '', startdatetime: '', enddatetime: '', duration: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const getTotalDuration = () => {
    return tasks.reduce((acc, task) => acc + parseFloat(task.duration), 0).toFixed(2);
  };

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
      setIsOpen(true);
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
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }
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

  // Set colors for different statuses
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box height='10px' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{mr: 3}}>{timesheet.selectedDate}</Typography>
            <Chip label={timesheet.status} color={getStatusColor(timesheet.status)} size="small" sx={{mr: 3}}/>
            <Typography variant="h8" sx={{mr: 3}}>Total Tasks: {tasks.length}</Typography>
            <Typography variant="h8" sx={{mr: 3}}>Total Duration: {getTotalDuration()} Hr </Typography>
          </Box>

          <Box>
          <Button 
                size="small" 
                color="primary" 
                onClick={submitTimesheet} 
                sx={{ mr: 2 }}
              >
                <SendIcon />
              </Button>
            <Button size="large" onClick={() => handleDialogOpen()} ><AddIcon /></Button>
            <Button size="large" color="error" onClick={handleDeleteTimesheet} ><DeleteIcon /></Button>
            <Button size="large" color="success" onClick={exportToExcel} ><FileDownloadIcon /></Button>
            <Button size="large" onClick={() => setIsOpen(!isOpen)} color="primary">
              {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>
          </Box>
        </Box>

        {/* Collapsible Section for Tasks */}
        <Collapse in={isOpen}>
          <Box sx={{ mt: 2 }}>
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
            type="time"
            value={newTask.startdatetime ? newTask.startdatetime.split('T')[1] : ''}
            onChange={(e) => {
              const newStartTime = e.target.value;
              setNewTask({
                ...newTask,
                startdatetime: `${timesheet.selectedDate}T${newStartTime}`, 
              });
            }}
            fullWidth
            sx={{ mb: 2 }}
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, 
            }}
          />
          <TextField
            label="End Date/Time"
            type="time"
            value={newTask.enddatetime ? newTask.enddatetime.split('T')[1] : ''}
            onChange={(e) => {
              const newEndTime = e.target.value;
              setNewTask({
                ...newTask,
                enddatetime: `${timesheet.selectedDate}T${newEndTime}`, 
              });

              if (newTask.startdatetime) {
                const duration = calculateDuration(newTask.startdatetime, `${timesheet.selectedDate}T${newEndTime}`);
                setNewTask((prevState) => ({ ...prevState, duration }));
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, 
            }}
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
    </Card>
  );
};

export default TimesheetCard;

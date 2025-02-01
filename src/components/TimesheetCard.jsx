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

const TimesheetCard = ({ timesheet, onDelete }) => {
  // State management
  const [tasks, setTasks] = useState(timesheet.tasks || []);
  const [newTask, setNewTask] = useState({ 
    taskid: '', 
    name: '', 
    startdatetime: '', 
    enddatetime: '', 
    duration: '' 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [approversModalOpen, setApproversModalOpen] = useState(false);
  const [approvers, setApprovers] = useState([{ email: '' }]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Utility functions
  const getTotalDuration = () => {
    return tasks.reduce((acc, task) => acc + parseFloat(task.duration), 0).toFixed(2);
  };

  const calculateDuration = (startdatetime, enddatetime) => {
    const start = new Date(startdatetime);
    const end = new Date(enddatetime);
    const duration = (end - start) / 1000 / 60 / 60;
    return duration.toFixed(2);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const areApproversValid = () => {
    return approvers.every(approver => 
      approver.email.trim() === '' || isValidEmail(approver.email)
    ) && approvers.some(approver => 
      approver.email.trim() !== '' && isValidEmail(approver.email)
    );
  };

  // Task management functions
  const addTask = () => {
    if (newTask.startdatetime && newTask.enddatetime) {
      const duration = calculateDuration(newTask.startdatetime, newTask.enddatetime);
      const taskWithId = {
        ...newTask,
        duration,
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

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.taskid !== taskId));
  };

  const handleDeleteTimesheet = () => {
    onDelete(timesheet.timesheetId);
  };

  // Dialog management functions
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

  // Approvers management functions
  const addApproverField = () => {
    setApprovers([...approvers, { email: '' }]);
  };

  const handleApproverEmailChange = (index, value) => {
    const newApprovers = [...approvers];
    newApprovers[index].email = value;
    setApprovers(newApprovers);
  };

  const removeApproverField = (index) => {
    const newApprovers = approvers.filter((_, i) => i !== index);
    setApprovers(newApprovers);
  };

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
      const employeeId = '1223';
      const approverEmails = approvers
        .map(approver => approver.email)
        .filter(email => email.trim() !== '' && isValidEmail(email));
      console.log('Approvers:', approverEmails, 'Tasks:', tasks);
      const response = await fetch('http://localhost:8282/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          employeeId: employeeId,
          timesheetId: timesheet.timesheetId
        })
      });

      if (response.ok) {
        const processId = await response.text();
        console.log('Process ID:', processId);
        setSnackbar({
          open: true,
          message: 'Timesheet submitted for approval successfully!',
          severity: 'success'
        });
        setApproversModalOpen(false);
        setApprovers([{ email: '' }]);
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
    <Card>
      <CardContent>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{mr: 3}}>{timesheet.date}</Typography>
            <Chip 
              label={timesheet.status} 
              color={getStatusColor(timesheet.status)} 
              size="small" 
              sx={{mr: 3}}
            />
            <Typography variant="subtitle1" sx={{mr: 3}}>
              Total Tasks: {tasks.length}
            </Typography>
            <Typography variant="subtitle1" sx={{mr: 3}}>
              Total Duration: {getTotalDuration()} Hr
            </Typography>
          </Box>

          <Box>
            <Button 
              size="small" 
              color="primary" 
              onClick={() => {setApproversModalOpen(true)}} 
              sx={{ mr: 2 }}
            >
              <SendIcon />
            </Button>
            <Button 
              size="small" 
              onClick={() => handleDialogOpen()}
              sx={{ mr: 2 }}
            >
              <AddIcon />
            </Button>
            <Button 
              size="small" 
              color="error" 
              onClick={handleDeleteTimesheet}
              sx={{ mr: 2 }}
            >
              <DeleteIcon />
            </Button>
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
                          onClick={() => handleDeleteTask(task.taskid)} 
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
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              fullWidth
              sx={{ mb: 2, mt: 2 }}
              required
            />
            <TextField
              label="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                  startdatetime: `${timesheet.date}T${newStartTime}`,
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
              value={newTask.enddatetime ? newTask.enddatetime.split('T')[1] : ''}
              onChange={(e) => {
                const newEndTime = e.target.value;
                const newEndDateTime = `${timesheet.date}T${newEndTime}`;
                setNewTask({
                  ...newTask,
                  enddatetime: newEndDateTime,
                  duration: newTask.startdatetime ? 
                    calculateDuration(newTask.startdatetime, newEndDateTime) : 
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
              disabled={!newTask.name || !newTask.startdatetime || !newTask.enddatetime}
            >
              {editingTaskId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Approvers Modal */}
        <Dialog open={approversModalOpen} onClose={() => setApproversModalOpen(false)}>
          <DialogTitle>Add Approvers</DialogTitle>
          <DialogContent>
            {approvers.map((approver, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: index === 0 ? 2 : 0 }}>
                <TextField
                  label={`Approver ${index + 1} Email`}
                  type="email"
                  value={approver.email}
                  onChange={(e) => handleApproverEmailChange(index, e.target.value)}
                  error={approver.email !== '' && !isValidEmail(approver.email)}
                  helperText={approver.email !== '' && !isValidEmail(approver.email) ? 'Invalid email format' : ''}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                {index > 0 && (
                  <IconButton onClick={() => removeApproverField(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addApproverField}
              sx={{ mt: 1 }}
            >
              Add Another Approver
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproversModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={()=>submitTimesheet()}
              disabled={!areApproversValid()}
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TimesheetCard;
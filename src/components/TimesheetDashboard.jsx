import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import TimesheetCard from './TimesheetCard';
import axios from 'axios';

const TimesheetDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [newTimesheet, setNewTimesheet] = useState({ 
    selectedDate: dateRange.startDate 
  });
  useEffect(()=>{
    try {
      const fetchTimesheets = async () => {
        const response = await fetch('http://localhost:8282/timesheets/' + '1');  // Replace 1 with actual employee ID
        const timesheets = await response.json();
        setTimesheets(timesheets);
      };
      fetchTimesheets();
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  },[])

  const getCurrentMonthYear = () => {
    const date = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = months[date.getMonth()];
    const currentYear = date.getFullYear();
    return { month: currentMonth, year: currentYear.toString() };
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    // Calculate end date (7 days after start date)
    const endDate = new Date(new Date(newStartDate).getTime() + 6 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    setDateRange({
      startDate: newStartDate,
      endDate: endDate
    });
  };

  const createTimesheet = async () => {
    const { selectedDate } = newTimesheet;
    const newTimesheetObject = {
      employeeId: 1, 
      date: selectedDate,
      taskDuration: 0, 
      status: 'Not Sent',
      tasks: [] 
    };
    
    try {
      const response = await axios.post('http://localhost:8282/insert', newTimesheetObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Timesheet created:', response.data);
      const updatedTimesheets = [...timesheets, {...response.data, tasks: response.data.tasks == null ? [] : response.data.tasks}];
      setTimesheets(updatedTimesheets);
      setFilteredTimesheets(updatedTimesheets);
    } catch (error) {
      console.error('Error creating timesheet:', error);
    }

    
    setOpenDialog(false);
    setNewTimesheet({ selectedDate: dateRange.startDate });
  };
  

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTimesheet({ month: '', year: '' });
  };

  const handleDialogOpen = () => {
    const { month, year } = getCurrentMonthYear();
    setNewTimesheet({ month, year });
    setOpenDialog(true);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleDeleteTimesheet = async (uniqueid) => {
    try {
      const response = await axios.delete('http://localhost:8282/delete/' + uniqueid);
      console.log('Timesheet deleted:', response.data);
      const updatedTimesheets = timesheets.filter((timesheet) => timesheet.timesheetId !== uniqueid);
      setTimesheets(updatedTimesheets);
      setFilteredTimesheets(updatedTimesheets);
    } catch (error) {
      console.error('Error deleting timesheet:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  
  useEffect(() => {
    const filtered = timesheets.filter((timesheet) => {
      // Check if the timesheet date is within the selected date range
      const isWithinDateRange = timesheet.date >= dateRange.startDate && timesheet.date <= dateRange.endDate;
      
      // If timesheet date is within the range, proceed with other filters (search query and task match)
      const tasksMatch = timesheet.tasks.some((task) =>
        task.taskName.toLowerCase().includes(debouncedSearchQuery) ||
        task.startTime.toLowerCase().includes(debouncedSearchQuery) ||
        task.endTime.toLowerCase().includes(debouncedSearchQuery)
      );
  
      return (
        isWithinDateRange && 
        (
          timesheet.timesheetId.toString().includes(debouncedSearchQuery) ||
          timesheet.date.toLowerCase().includes(debouncedSearchQuery) ||
          tasksMatch
        )
      );
    });
  
    setFilteredTimesheets(filtered);
  }, [debouncedSearchQuery, timesheets, dateRange]);
  
  return (
    <Container>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 5 }}>Timesheet Dashboard</Typography>
        {/* Date Range Picker */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: '200px' }}
          />
          <TextField
            label="End Date"
            type="date"
            value={dateRange.endDate}
            InputLabelProps={{
              shrink: true,
            }}
            disabled
            sx={{ width: '200px' }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' , mb: 4 }}>
        {/* Search Bar */}
        <TextField
          label="Search Timesheets"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ width: '600px' }}
        />

        {/* Create Timesheet Button */}
        <Button variant="contained" size='small' onClick={handleDialogOpen}>Create Timesheet</Button>
      </Box>

      {/* Timesheet List */}
      <Grid container spacing={2}>
        {filteredTimesheets.map((timesheet) => (
          <Grid item xs={12} key={timesheet.timesheetId}>
            <TimesheetCard timesheet={timesheet} onDelete={handleDeleteTimesheet} setTimesheets={setTimesheets} />
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Creating Timesheet */}
      {/* Dialog for Creating Timesheet */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Create New Timesheet</DialogTitle>
        <DialogContent>
          <TextField
            label="Select Date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: dateRange.startDate,
              max: dateRange.endDate
            }}
            fullWidth
            onChange={(e) => {
              const selectedDate = e.target.value;
              if (selectedDate >= dateRange.startDate && selectedDate <= dateRange.endDate) {
                setNewTimesheet({
                  ...newTimesheet,
                  selectedDate: selectedDate
                });
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={createTimesheet} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default TimesheetDashboard;
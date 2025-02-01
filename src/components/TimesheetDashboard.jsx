import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import TimesheetCard from './TimesheetCard';

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

  const createTimesheet = () => {
    const { selectedDate } = newTimesheet;
    const newTimesheetObject = {
      uniqueid: (timesheets.length + 1).toString(),
      selectedDate,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      tasksarray: [],
      status: 'Not sent'
    };
    const updatedTimesheets = [...timesheets, newTimesheetObject];
    setTimesheets(updatedTimesheets);
    setFilteredTimesheets(updatedTimesheets);
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

  const handleDeleteTimesheet = (uniqueid) => {
    const updatedTimesheets = timesheets.filter((timesheet) => timesheet.uniqueid !== uniqueid);
    setTimesheets(updatedTimesheets);
    setFilteredTimesheets(updatedTimesheets);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const filtered = timesheets.filter((timesheet) => {
      const tasksMatch = timesheet.tasksarray.some((task) =>
        task.name.toLowerCase().includes(debouncedSearchQuery) ||
        task.startdatetime.toLowerCase().includes(debouncedSearchQuery) ||
        task.enddatetime.toLowerCase().includes(debouncedSearchQuery)
      );

      return (
        timesheet.uniqueid.toLowerCase().includes(debouncedSearchQuery) ||
        timesheet.month.toLowerCase().includes(debouncedSearchQuery) ||
        tasksMatch
      );
    });

    setFilteredTimesheets(filtered);
  }, [debouncedSearchQuery, timesheets]);

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
          <Grid item xs={12} key={timesheet.uniqueid}>
            <TimesheetCard timesheet={timesheet} onDelete={handleDeleteTimesheet} />
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
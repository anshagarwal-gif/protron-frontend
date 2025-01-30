import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import TimesheetCard from './TimesheetCard';

const TimesheetDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({ month: '', year: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const getCurrentMonthYear = () => {
    const date = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = months[date.getMonth()]; // Get current month name
    const currentYear = date.getFullYear(); // Get current year
    return { month: currentMonth, year: currentYear.toString() };
  };

  const createTimesheet = () => {
    const { month, year } = newTimesheet;
    const newTimesheetObject = {
      uniqueid: (timesheets.length + 1).toString(),
      month,
      year,
      tasksarray: []
    };
    const updatedTimesheets = [...timesheets, newTimesheetObject];
    setTimesheets(updatedTimesheets);
    setFilteredTimesheets(updatedTimesheets); // Update filtered list as well
    setOpenDialog(false);
    setNewTimesheet({ month: '', year: '' });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTimesheet({ month: '', year: '' });
  };

  const handleDialogOpen = () => {
    // Set the month and year to the current values when the dialog opens
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
      <Typography variant="h4" gutterBottom>Timesheet Dashboard</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {/* Search Bar */}
        <TextField
          label="Search Timesheets"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{width:'600px'}}
        />
        
        {/* Create Timesheet Button */}
        <Button variant="contained" size='small' onClick={handleDialogOpen}>Create Timesheet</Button>
      </Box>

      {/* Timesheet List */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {filteredTimesheets.map((timesheet) => (
          <Grid item xs={12} key={timesheet.uniqueid}>
            <TimesheetCard timesheet={timesheet} onDelete={handleDeleteTimesheet} />
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Creating Timesheet */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Create New Timesheet</DialogTitle>
        <DialogContent>
          <TextField 
            label="Month" 
            value={newTimesheet.month} 
            onChange={(e) => setNewTimesheet({ ...newTimesheet, month: e.target.value })} 
            fullWidth
            sx={{ mb: 2,mt:2 }}
          />
          <TextField 
            label="Year" 
            value={newTimesheet.year} 
            onChange={(e) => setNewTimesheet({ ...newTimesheet, year: e.target.value })}
            fullWidth
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

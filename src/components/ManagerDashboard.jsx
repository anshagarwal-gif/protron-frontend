import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Collapse,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ManagerDashboard = ({ managerId }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTimesheetId, setSelectedTimesheetId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Apply initial filtering when data is loaded or tab changes
  useEffect(() => {
    filterApprovals(searchQuery, filterDate);
  }, [pendingApprovals, activeTab]);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get("http://localhost:8282/approvals/getApprovalByApproverId", {
        params: { approverId: 1 },
      });
      if (response.status === 200) {
        setPendingApprovals(response.data);
        setFilteredApprovals(response.data);
      } else {
        setSnackbar({ open: true, message: 'No tasks found for this manager.', severity: 'warning' });
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
      setSnackbar({ open: true, message: 'Error fetching approvals.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (timesheetId, status, approverEmails) => {
    if (rejectReason == '' && status === 'Rejected') {
      setSelectedTimesheetId(timesheetId);
      setOpenRejectModal(true);
      return;
    }

    try {
      const endpoint = `http://localhost:8282/${status === "Approved" ? "approve" : "reject"}/${timesheetId}`;

      const payload = {
        approverEmails: approverEmails,
        ...(status === "Rejected" && { reason: rejectReason }),
      };

      const response = await axios.post(endpoint, null, { params: payload });

      const updatedApprovals = pendingApprovals.map((approval) =>
        approval.timesheet.timesheetId === timesheetId
          ? { ...approval, timesheet: { ...approval.timesheet, status, reason: rejectReason } }
          : approval
      );

      setPendingApprovals(updatedApprovals);
      filterApprovals(searchQuery, filterDate, updatedApprovals);
      
      setSnackbar({ open: true, message: `Timesheet ${status}`, severity: 'success' });
    } catch (error) {
      console.error(`Error updating timesheet status to ${status}:`, error);
      setSnackbar({ open: true, message: `Error updating timesheet status.`, severity: 'error' });
    } finally {
      setOpenRejectModal(false);
      setRejectReason('');
    }
  };

  const handleExpandClick = (approvalId) => {
    setExpanded((prevState) => ({
      ...prevState,
      [approvalId]: !prevState[approvalId],
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterApprovals(query, filterDate);
  };

  const handleFilterByDate = (date) => {
    setFilterDate(date);
    filterApprovals(searchQuery, date);
  };

  const getStatusForTab = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return 'All';
      case 1:
        return 'Pending';
      case 2:
        return 'Approved';
      case 3:
        return 'Rejected';
      default:
        return 'All';
    }
  };

  const filterApprovals = (query = searchQuery, date = filterDate, approvals = pendingApprovals) => {
    const lowerQuery = query.toLowerCase();
    const currentStatus = getStatusForTab(activeTab);
    
    const filtered = approvals.filter((approval) => {
      const matchesSearch = approval.timesheet.employee.email.toLowerCase().includes(lowerQuery);
      const matchesDate = date ? approval.timesheet.date === date : true;
      const matchesStatus = currentStatus === 'All' ? true : approval.timesheet.status === currentStatus;
      
      return matchesSearch && matchesDate && matchesStatus;
    });

    setFilteredApprovals(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Manager Dashboard
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Search by Email"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="date"
          label="Filter by Date"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={(e) => handleFilterByDate(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TabPanel value={activeTab} index={activeTab}>
          {loading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : filteredApprovals.length === 0 ? (
            <Typography variant="h6" textAlign="center">
              No {getStatusForTab(activeTab).toLowerCase()} timesheets found
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredApprovals.map((approval) => (
                <Grid item xs={12} key={approval.approvalId}>
                  <Card elevation={3} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Typography
                          variant="h6"
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => handleExpandClick(approval.approvalId)}
                        >
                          Timesheet Date: {approval.timesheet.date}
                          <span style={{ margin: '0 10px' }}>|</span>
                          Email: {approval.timesheet.employee.email}
                        </Typography>
                        <IconButton onClick={() => handleExpandClick(approval.approvalId)}>
                          {expanded[approval.approvalId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Grid>

                      <Collapse in={expanded[approval.approvalId]} timeout="auto" unmountOnExit>
                        <Typography variant="h6" color={approval.timesheet.status === 'Approved' ? 'success' : approval.timesheet.status === 'Rejected' ? 'error' : 'warning'}>
                          Status: <span><b>{approval.timesheet.status}</b></span>
                        </Typography>

                        {approval.timesheet.status === 'Rejected' && approval.timesheet.reason !== "NA" && (
                          <Typography variant="h6" color="error">
                            Reason: {approval.timesheet.reason}
                          </Typography>
                        )}

                        <Table size="small" sx={{ mt: 2 }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell><strong>Task</strong></TableCell>
                              <TableCell><strong>Description</strong></TableCell>
                              <TableCell><strong>Duration</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {approval.timesheet.tasks.length > 0 ? (
                              approval.timesheet.tasks.map((task, index) => (
                                <TableRow key={index}>
                                  <TableCell>{task.taskName}</TableCell>
                                  <TableCell>{task.taskDescription}</TableCell>
                                  <TableCell>{task.duration} hours</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} align="center">No tasks available</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>

                        {approval.timesheet.status === 'Pending' && (
                          <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApproval(
                                  approval.timesheet.timesheetId,
                                  "Approved",
                                  approval.timesheet.approvers ? approval.timesheet.approvers.map(a => a.email) : []
                                )}
                              >
                                Approve
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleApproval(
                                  approval.timesheet.timesheetId,
                                  "Rejected",
                                  approval.timesheet.approvers ? approval.timesheet.approvers.map(a => a.email) : []
                                )}
                              >
                                Reject
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Grid>

      <Dialog open={openRejectModal} onClose={() => setOpenRejectModal(false)}>
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason for rejection"
            variant="outlined"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectModal(false)} color="secondary">Cancel</Button>
          <Button
            onClick={() => {
              if (rejectReason.trim()) {
                const selectedApproval = pendingApprovals.find(
                  (approval) => approval.timesheet.timesheetId === selectedTimesheetId
                );

                const approverEmails = selectedApproval?.timesheet?.approvers
                  ? selectedApproval.timesheet.approvers.map((a) => a.email)
                  : [];

                handleApproval(selectedTimesheetId, "Rejected", approverEmails);
              }
            }}
            color="error"
            disabled={!rejectReason.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ManagerDashboard;
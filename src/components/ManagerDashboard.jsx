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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

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
  const [selectedApprovers, setSelectedApprovers] = useState([]); // Store selected approvers
  const [selectedTimesheetId, setSelectedTimesheetId] = useState(null);


  useEffect(() => {
    fetchPendingApprovals();
  }, []);

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
        approverEmails: approverEmails,  // Make sure correct data is passed
        ...(status === "Rejected" && { reason: rejectReason }),
      };

      const response = await axios.post(endpoint, null, { params: payload });

      console.log(`${status} Success:`, response.data);

      setPendingApprovals((prevApprovals) =>
        prevApprovals.map((approval) =>
          approval.timesheet.timesheetId === timesheetId
            ? { ...approval, timesheet: { ...approval.timesheet, status, reason: rejectReason } }
            : approval
        )
      );
    
      setFilteredApprovals((prevApprovals) =>
        prevApprovals.map((approval) =>
          approval.timesheet.timesheetId === timesheetId
            ? { ...approval, timesheet: { ...approval.timesheet, status, reason: rejectReason } }
            : approval
        )
      );

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
    const lowerQuery = query.toLowerCase();

    // Filter approvals by both email and timesheet ID and apply the date filter if it exists
    const filtered = pendingApprovals.filter((approval) => {
      const matchesSearch = approval.timesheet.employee.email.toLowerCase().includes(lowerQuery)
      const matchesDate = filterDate ? approval.timesheet.date === filterDate : true;
      return matchesSearch && matchesDate;
    });

    setFilteredApprovals(filtered);
  };

  const handleFilterByDate = (date) => {
    setFilterDate(date);

    // Filter approvals by both date and search query
    const filtered = pendingApprovals.filter((approval) => {
      const matchesDate = approval.timesheet.date === date;
      const matchesSearch = searchQuery ? approval.timesheet.employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.timesheet.timesheetId.toString().includes(searchQuery) : true;
      return matchesSearch && matchesDate;
    });

    setFilteredApprovals(filtered);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Manager Dashboard
        </Typography>
      </Grid>

      {/* Search and Filter Inputs */}
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

      {loading ? (
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <CircularProgress />
        </Grid>
      ) : (
        filteredApprovals.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center">No pending approvals</Typography>
          </Grid>
        ) : (
          filteredApprovals.map((approval) => (
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
                      Status:
                      <span><b> {approval.timesheet.status}</b></span>
                    </Typography>

                    {approval.timesheet.status === 'Rejected' && approval.timesheet.reason != "NA" ? (
                      <Typography variant="h6" color="error">
                        Reason: {approval.timesheet.reason}
                      </Typography>
                    ) : (<></>)}

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

                    {!['Approved', 'Rejected'].includes(approval.timesheet.status) ? (
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
                      </Grid>) : (<></>)}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))
        )
      )}

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

import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Container } from '@mui/material';

const ManagerDashboard = ({ managerId }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchPendingApprovals(managerId);
  }, [managerId]);

  const fetchPendingApprovals = async (managerId) => {
    try {
      const response = await fetch(`http://localhost:8282/pendingApprovals/${managerId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data);
      } else {
        console.error("No tasks found for this manager.");
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Manager Dashboard</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task ID</TableCell>
            <TableCell>Timesheet ID</TableCell>
            <TableCell>Approval Level</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingApprovals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>No pending approvals</TableCell>
            </TableRow>
          ) : (
            pendingApprovals.map((task) => (
              <TableRow key={task.taskId}>
                <TableCell>{task.taskId}</TableCell>
                <TableCell>{task.timesheetId}</TableCell>
                <TableCell>{task.approvalLevel === 1 ? "Manager 1" : "Manager 2"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ManagerDashboard;

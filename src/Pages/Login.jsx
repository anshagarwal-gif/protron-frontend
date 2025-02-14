import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Groups,
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Email,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled components
const LoginCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  margin: 'auto',
  marginTop: theme.spacing(5),
  boxShadow: theme.shadows[3],
}));

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const LoginPage = () => {
  const [value, setValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (role) => (e) => {
    e.preventDefault();
    console.log(`Logging in as ${role}:`, formData);

    // Redirect based on role
    if (role === 'Team Member') navigate('/home');
    else if (role === 'Manager') navigate('/manager');
    else if (role === 'Admin') navigate('/admin');
  };

  const LoginForm = ({ role, color }) => (
    <form onSubmit={handleSubmit(role)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {role === 'Team Member' && <Person sx={{ fontSize: 48, color }} />}
          {role === 'Manager' && <Groups sx={{ fontSize: 48, color }} />}
          {role === 'Admin' && <AdminPanelSettings sx={{ fontSize: 48, color }} />}
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>
            {role} Login
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Please login to continue
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Email"
          name="email"
          variant="outlined"
          value={formData.email}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          value={formData.password}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="start"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              opacity: 0.9,
            },
          }}
        >
          Login as {role}
        </Button>
      </Box>
    </form>
  );

  return (
    <Box
      sx={{
        maxHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <LoginCard>
        <CardContent>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab icon={<Person />} label="Team Member" iconPosition="start" />
            <Tab icon={<Groups />} label="Manager" iconPosition="start" />
            <Tab icon={<AdminPanelSettings />} label="Admin" iconPosition="start" />
          </Tabs>

          <TabPanel value={value} index={0}>
            <LoginForm role="Team Member" color="#1976d2" />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <LoginForm role="Manager" color="#2e7d32" />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <LoginForm role="Admin" color="#9c27b0" />
          </TabPanel>
        </CardContent>
      </LoginCard>
    </Box>
  );
};

export default LoginPage;

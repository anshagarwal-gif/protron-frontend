import React, { useState, useCallback, memo } from 'react';
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

const LoginCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  margin: 'auto',
  marginTop: theme.spacing(5),
  boxShadow: theme.shadows[3],
}));

// Memoized input field component
const PasswordField = memo(({ value, onChange, showPassword, onTogglePassword }) => (
  <TextField
    fullWidth
    label="Password"
    name="password"
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    value={value}
    onChange={onChange}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <IconButton
            aria-label="toggle password visibility"
            onClick={onTogglePassword}
            onMouseDown={(e) => e.preventDefault()}
            edge="start"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
));

const EmailField = memo(({ value, onChange }) => (
  <TextField
    fullWidth
    label="Email"
    name="email"
    type="email"
    variant="outlined"
    value={value}
    onChange={onChange}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Email />
        </InputAdornment>
      ),
    }}
  />
));

// Memoized form header
const FormHeader = memo(({ role, color }) => (
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
));

// Memoized login form component
const LoginForm = memo(({ role, color, onSubmit }) => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((e) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formState);
  }, [formState, onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormHeader role={role} color={color} />
        
        <EmailField
          value={formState.email}
          onChange={handleInputChange}
        />

        <PasswordField
          value={formState.password}
          onChange={handleInputChange}
          showPassword={showPassword}
          onTogglePassword={togglePasswordVisibility}
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
});

// Memoized tab panel
const TabPanel = memo(({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`login-tabpanel-${index}`}
    aria-labelledby={`login-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
));

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleSubmit = useCallback((role) => (formData) => {
    console.log(`Logging in as ${role}:`, formData);
    
    switch(role) {
      case 'Team Member':
        navigate('/home');
        break;
      case 'Manager':
        navigate('/manager');
        break;
      case 'Admin':
        navigate('/admin');
        break;
      default:
        break;
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab
              icon={<Person />}
              label="Team Member"
              iconPosition="start"
              id="login-tab-0"
              aria-controls="login-tabpanel-0"
            />
            <Tab
              icon={<Groups />}
              label="Manager"
              iconPosition="start"
              id="login-tab-1"
              aria-controls="login-tabpanel-1"
            />
            <Tab
              icon={<AdminPanelSettings />}
              label="Admin"
              iconPosition="start"
              id="login-tab-2"
              aria-controls="login-tabpanel-2"
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <LoginForm 
              role="Team Member" 
              color="#1976d2" 
              onSubmit={handleSubmit('Team Member')}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <LoginForm 
              role="Manager" 
              color="#2e7d32" 
              onSubmit={handleSubmit('Manager')}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <LoginForm 
              role="Admin" 
              color="#9c27b0" 
              onSubmit={handleSubmit('Admin')}
            />
          </TabPanel>
        </CardContent>
      </LoginCard>
    </Box>
  );
};

export default LoginPage;
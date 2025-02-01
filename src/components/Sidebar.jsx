import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    styled,
} from '@mui/material';
import {
    Home as HomeIcon,
    Timer as TimerIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Custom styled components
const LogoContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1)
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
    margin: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: active ? theme.palette.primary.main : 'transparent',
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: active
            ? theme.palette.primary.dark
            : theme.palette.action.hover,
    }
}));

const StyledLink = styled(Link)({
    textDecoration: 'none',
    display: 'block',
    width: '100%',
    color: 'inherit'
});

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Home');

    const menuItems = [
        { name: 'Home', icon: <HomeIcon />, path: '/' },
        { name: 'Timesheet', icon: <TimerIcon />, path: '/timesheet' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    overflowX: 'hidden', // Prevent horizontal scrolling
                },
            }}
        >
            <LogoContainer>
                <Typography variant="h6" fontWeight="bold">
                    Protron
                </Typography>
            </LogoContainer>

            <List sx={{ flex: 1, pt: 2, width: '100%' }}>
                {menuItems.map((item) => (
                    <StyledLink to={item.path} key={item.name}>
                        <StyledListItem
                            button
                            active={activeItem === item.name ? 1 : 0}
                            onClick={() => setActiveItem(item.name)}
                        >
                            <ListItemIcon sx={{
                                color: activeItem === item.name ? 'inherit' : undefined,
                                minWidth: '40px' // Reduce icon spacing
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                        </StyledListItem>
                    </StyledLink>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
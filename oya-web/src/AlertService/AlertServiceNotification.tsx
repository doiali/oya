import { styled } from '@mui/material/styles';
import { Collapse, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { TransitionStatus } from 'react-transition-group';
import { Notification, NotificationType } from './AlertService';

type AlertServiceNotificationProps = {
  onRemove: (id: number) => void,
  notification: Notification,
  status?: TransitionStatus,
};

const StyledCollapse = styled(Collapse)(() => ({
  marginBottom: 1,
  boxShadow: '0 0.75rem 0.75rem rgba(0,0,0,.5)',
}));

const Container = styled('div')<{ type: NotificationType; }>(({ theme, type }) => ({
  padding: theme.spacing(2, 6),
  zIndex: theme.zIndex.snackbar,
  backgroundColor: theme.palette[type]?.main,
  color: theme.palette[type]?.contrastText,
  textAlign: 'center',
  position: 'relative',
  width: '100%',
}));

export default function AlertServiceNotification(props: AlertServiceNotificationProps) {
  const { status, onRemove, notification } = props;
  const onRemoveRef = useRef(onRemove);
  const [open, setOpen] = useState(status === undefined);
  onRemoveRef.current = onRemove;
  const [{ id, type, message, persistant, duration }] = useState(notification);

  useEffect(() => {
    let timeoutID: number;
    if (!persistant) {
      timeoutID = setTimeout(() => {
        onRemoveRef.current(id);
      }, duration);
      return () => {
        clearTimeout(timeoutID);
        onRemoveRef.current(id);
      };
    }
  }, [id, persistant, duration]);

  useEffect(() => {
    if (status === 'entering')
      setOpen(true);
    if (status === 'exiting')
      setOpen(false);
  }, [status]);

  return (
    <StyledCollapse in={open} timeout={300}>
      <Container type={type}>
        {persistant && <IconButton onClick={() => onRemove(id)}><Close /></IconButton>}
        {message}
      </Container>
    </StyledCollapse>
  );
}

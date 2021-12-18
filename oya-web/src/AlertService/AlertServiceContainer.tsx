import { styled } from '@mui/material/styles';
import { Transition, TransitionGroup } from 'react-transition-group';
import { AlertServiceNotification, useNotifications } from '.';
import AlertService from './AlertService';

const Container = styled('div')(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.snackbar,
  left: 0,
  bottom: 0,
}));

export default function AlertServiceContainer() {
  const notifications = useNotifications();
  // const newestNotification = notifications[0];
  return (
    <Container>
      <TransitionGroup id="test">
        {notifications.map((notif) => {
          return (
            <Transition key={notif.id} timeout={300}>
              {(status) => (
                <AlertServiceNotification
                  status={status}
                  notification={notif}
                  onRemove={(id) => AlertService.remove(id)}
                />
              )}
            </Transition>
          );
        })}
      </TransitionGroup>
    </Container>
  );
}

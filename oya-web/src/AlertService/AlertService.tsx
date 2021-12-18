import { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error';

export type Notification = {
  readonly message: string,
  readonly type: NotificationType,
  readonly persistant?: boolean,
  readonly duration?: number,
  readonly id: number,
};

export type AlertServieListener = (notifications: Notification[]) => void;

const AlertService = (function () {
  let id = 0;
  let notifications: Notification[] = [];
  const listeners: AlertServieListener[] = [];
  const addListener = (fn: AlertServieListener) => { listeners.push(fn); };
  const removeListener = (fn: AlertServieListener) => {
    const index = listeners.indexOf(fn);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
  const notify = () => {
    listeners.forEach((fn) => {
      fn(notifications);
    });
  };
  const add = ({ type = 'success', message = '', duration = 3000, persistant = false }: Partial<Omit<Notification, 'id'>>) => {
    id = id + 1;
    notifications = [{ persistant, message, type, id, duration }, ...notifications];
    notify();
    return id;
  };
  const remove = (id: number) => {
    const index = notifications.findIndex((x) => x.id === id);
    if (index > -1) {
      const newNotifications = [...notifications];
      const removedNotification = newNotifications.splice(index, 1);
      notifications = newNotifications;
      notify();
      return removedNotification;
    }
  };
  return Object.freeze({
    get notifications() {
      return notifications;
    },
    add,
    remove,
    error: (message: string, persistant = false) => add({ type: 'error', message, persistant }),
    success: (message: string, persistant = false) => add({ type: 'success', message, persistant }),
    addListener,
    removeListener,
  });
}());

declare global {
  interface Window { AlertService: typeof AlertService; }
}

if (typeof window === 'object' && process.env.NODE_ENV === 'development') {
  window.AlertService = AlertService;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(AlertService.notifications);
  useEffect(() => {
    const handleChange = (newNotifs: Notification[]) => setNotifications(newNotifs);
    AlertService.addListener(handleChange);
    setNotifications(AlertService.notifications);
    return () => {
      AlertService.removeListener(handleChange);
    };
  }, []);
  return notifications;
}

export default AlertService;

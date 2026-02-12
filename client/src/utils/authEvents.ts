export const AUTH_CHANGED_EVENT = 'auth-changed';

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};


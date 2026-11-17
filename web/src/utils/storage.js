const KEY = 'farmai.session';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function write(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode): session lasts until reload */
  }
}

export const getSession = () => read();
export const setSession = ({ accessToken, refreshToken, user }) =>
  write({ ...read(), accessToken, refreshToken, user });
export const setAccessToken = (accessToken) => write({ ...read(), accessToken });
export const clearSession = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export const endpoints = {
  login: "/users/login",
  register: "/users/register",
  deleteAccount: "/users/delete-account",
  notes: "/notes",
  noteById: (id: string) => `/notes/${id}`,
  profile: "/users/profile",
  profileUpdate: "/users/profile",
};
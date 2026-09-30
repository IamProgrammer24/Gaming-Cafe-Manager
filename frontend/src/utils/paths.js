export const homePathFor = (role) =>
  role === "superadmin" ? "/admin" : "/dashboard";

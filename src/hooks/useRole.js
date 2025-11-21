import { useAuth } from "../main";

export const useRole = () => {
  const { user } = useAuth();
  return user?.role;
};

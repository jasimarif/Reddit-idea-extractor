import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GoogleCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    try {
      if (token && userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("auth_token", token);
        setUser(user);
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      navigate("/dashboard");
    }
  }, [setUser, navigate, location.search]);

  return <div>Logging you in...</div>;
}
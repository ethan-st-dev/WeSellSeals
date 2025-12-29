import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { Route } from "./+types/user";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Account - WeSellSeals" },
    { name: "description", content: "Manage your account" },
  ];
}

export default function User() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="user-container">
      <div className="user-card">
        <div className="user-header">
          <div className="user-avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1>My Account</h1>
        </div>

        <div className="user-info">
          <div className="info-group">
            <label>Email</label>
            <p>{user.email}</p>
          </div>

          <div className="info-group">
            <label>Member Since</label>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="user-actions">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate, useLocation } from "react-router";
import { GridView } from "@mui/icons-material";
import { FaUser, FaSignOutAlt, FaUserEdit, FaCalendarAlt } from "react-icons/fa";

import { useAuthStore } from "../../hooks";

import taskor from "../icons/taskorInverso.png";
import "../style/navbar.css";

export const Navbar = () => {
  const { startLogout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();  

  const handleCalendarClick = () => navigate("/calendar");
  const handleBackClick = () => navigate("/");
  const handleProfileClick = () => navigate("/profile");

  const isCalendarPage = location.pathname === "/calendar";
  const isProfilePage = location.pathname === "/profile";
  const isHomePage = location.pathname === "/";

  const showDivider = !isProfilePage;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container-fluid">
        <img src={taskor} alt="Taskor" className="navbar-brand"/>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="d-none d-lg-flex ms-auto align-items-center gap-4">
          {!isHomePage && (
            <button className="btn nav-link text-white d-flex align-items-center" onClick={handleBackClick}>
              <GridView className="me-2 icon-size" /> Tableros
            </button>
          )}

          {!isCalendarPage && (
            <button className="btn nav-link text-white d-flex align-items-center" onClick={handleCalendarClick}>
              <FaCalendarAlt className="me-2 icon-size" /> Calendario
            </button>
          )}

          <div className="dropdown">
            <button
              className="btn nav-link dropdown-toggle text-start text-white d-flex align-items-center"
              id="userDropdownSmall"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaUser className="me-2 icon-size" /> {user ? user.username : "Usuario"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end dropdown-dark mt-lg-3" aria-labelledby="userDropdown">
              {!isProfilePage && (
                <li>
                  <button className="dropdown-item d-flex align-items-center" onClick={handleProfileClick}>
                    <FaUserEdit className="me-2 icon-size" /> Mi perfil
                  </button>
                </li>
              )}
              {showDivider && <li><hr className="dropdown-divider" /></li>}
              <li>
                <button className="dropdown-item d-flex align-items-center" onClick={startLogout}>
                  <FaSignOutAlt className="me-2 icon-size" /> Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="offcanvas offcanvas-end text-bg-dark d-lg-none"
          tabIndex={-1}
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              Menú
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav">
              {!isHomePage && (
                <li className="nav-item">
                  <button className="btn nav-link text-start text-white d-flex align-items-center" onClick={handleBackClick}>
                    <GridView className="me-2 icon-size" /> Tableros
                  </button>
                </li>
              )}

              {!isCalendarPage && (
                <li className="nav-item">
                  <button className="btn nav-link text-start text-white d-flex align-items-center" onClick={handleCalendarClick}>
                    <FaCalendarAlt className="me-2 icon-size" /> Calendario
                  </button>
                </li>
              )}

              <li className="nav-item dropdown">
                <button
                  className="btn nav-link dropdown-toggle text-start text-white d-flex align-items-center"
                  id="userDropdownSmall"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUser className="me-2 icon-size" /> {user ? user.username : "Usuario"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-dark" aria-labelledby="userDropdownSmall">
                  {!isProfilePage && (
                    <li>
                      <button className="dropdown-item d-flex align-items-center" onClick={handleProfileClick}>
                        <FaUserEdit className="me-2 icon-size" /> Mi perfil
                      </button>
                    </li>
                  )}
                  {showDivider && <li><hr className="dropdown-divider" /></li>}
                  <li>
                    <button className="dropdown-item d-flex align-items-center" onClick={startLogout}>
                      <FaSignOutAlt className="me-2 icon-size" /> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};


import { useNavigate } from "react-router";
import { useAuthStore } from "../../hooks";

export const Navbar = () => {
  const { startLogout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-calendar-alt me-2"></i>
            {user ? user.username : "Usuario"}
          </span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="offcanvas offcanvas-end text-bg-dark"
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
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <button
                    className="nav-link btn text-start text-white"
                    onClick={handleBackClick}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Tableros
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn text-start text-white"
                    onClick={handleCalendarClick}
                  >
                    <i className="fas fa-calendar-alt me-2"></i>
                    Calendario
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn text-start text-white"
                    onClick={startLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="mt-5 pt-4"></div>

    </>
  );
};

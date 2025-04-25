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
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="fas fa-calendar-alt"></i>&nbsp;
          {user ? user.username : "Usuario"}
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasDarkNavbar"
          aria-controls="offcanvasDarkNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="offcanvas offcanvas-end text-bg-dark"
          tabIndex={-1}
          id="offcanvasDarkNavbar"
          aria-labelledby="offcanvasDarkNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
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
                <button className="btn btn-outline-light w-100 mb-2" onClick={handleBackClick}>
                  <i className="fas fa-arrow-left"></i>&nbsp; Tableros
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light w-100 mb-2" onClick={handleCalendarClick}>
                  <i className="fas fa-calendar-alt"></i>&nbsp; Calendario
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger w-100" onClick={startLogout}>
                  <i className="fas fa-sign-out-alt"></i>&nbsp; Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

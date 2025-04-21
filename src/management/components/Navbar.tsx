import { useNavigate } from "react-router";
import { useAuthStore } from "../../hooks";

export const Navbar = () => {
  const { startLogout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="navbar navbar-dark bg-dark mb-4 px-4">
      <span className="navbar-brand">
        <i className="fas fa-calendar-alt"></i>
        &nbsp;
        {user ? user.username : "Usuario"}
      </span>

      <button
        className="btn btn-outline-light"
        onClick={handleBackClick}
      >
        <i className="fas fa-back-alt"></i>
        &nbsp;
        <span>Volver</span>
      </button>

      <button
        className="btn btn-outline-light"
        onClick={handleCalendarClick}
      >
        <i className="fas fa-calendar-alt"></i>
        &nbsp;
        <span>Calendario</span>
      </button>

      <button
        className="btn btn-outline-danger"
        onClick={startLogout}
      >
        <i className="fas fa-sign-out-alt"></i>
        &nbsp;
        <span>Salir</span>
      </button>
    </div>
  );
};

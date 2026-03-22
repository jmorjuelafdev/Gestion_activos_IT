import logo from '../assets/images/logo.png';

const Titulo = () => {
  return (
    <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
      <img src={logo} alt="Logo" style={{ width: '60px', height: '60px', marginRight: '20px' }} />
      <div>
        <h1 className="fw-bold mb-0" style={{ color: '#5FB3A2' }}>Gestión de Activos IT</h1>
        <p className="text-muted mb-0">Sistema de control y seguimiento de equipos</p>
      </div>
    </div>
  );
};

export default Titulo;

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Clients from './pages/Clients';
import Employees from './pages/Employees/';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectReport from './pages/Projects/report';
import Tasks from './pages/Tasks';
import { RoutesPath } from './utils/constants';

function App() {
  return (
    <>
      <Router>
        
        <div>
          {/* Configuración de las rutas */}
          <Routes>
            <Route path={RoutesPath.HOME} element={<Home />} />
            <Route path={RoutesPath.PROJECTS} element={<Projects />} />
            <Route path={RoutesPath.PROJECT_REPORT} element= {<ProjectReport />} />
            <Route path={RoutesPath.TASKS} element={<Tasks />} />
            <Route path={RoutesPath.CLIENTS} element={<Clients />} />
            <Route path={RoutesPath.EMPLOYEES} element={<Employees />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import { SnackbarContext, SnackbarState } from './hooks/snackbarContext';
import Clients from './pages/Clients';
import Employees from './pages/Employees/';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import { RoutesPath } from './utils/constants';

function App() {
  const [state, setState] = useState<SnackbarState>({ open: false, message: '' });

  useEffect(() => {
    if (state.open) {
      setTimeout(
        () =>
          setState(s => {
            return { ...s, open: false };
          }),
        2000
      );
    }
  }, [state]);

  return (
    <SnackbarContext.Provider value={{ state, setState }}>
      <Router>
        <Layout>
          {/* Configuración de las rutas */}
          <Routes>
            <Route path={RoutesPath.HOME} element={<Home />} />
            <Route path={`${RoutesPath.PROJECTS}/*`} element={<Projects />} />
            <Route path={RoutesPath.TASKS} element={<Tasks />} />
            <Route path={RoutesPath.CLIENTS} element={<Clients />} />
            <Route path={RoutesPath.EMPLOYEES} element={<Employees />} />
          </Routes>
        </Layout>
      </Router>
    </SnackbarContext.Provider>
  );
}

export default App;

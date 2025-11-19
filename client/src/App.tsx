import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Compare from './pages/Compare';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="setup" element={<Setup />} />
        <Route path="compare" element={<Compare />} />
      </Route>
    </Routes>
  );
}

export default App;

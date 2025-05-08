import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Landing/Home';
import Galaxy from './components/Galaxy/Galaxy';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/galaxy" element={<Galaxy />} />
      </Routes>
    </Router>
  );
};

export default App;
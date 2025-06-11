import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Landing/Home';
import Galaxy from './components/Galaxy/Galaxy';
import Mission001 from './components/Games/Mission001/Mission';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/galaxy" element={<Galaxy />} />
        <Route path="/galaxy/mercury" element={<Mission001 />} />
      </Routes>
    </Router>
  );
};

export default App;
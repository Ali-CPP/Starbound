import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Home.css';

const Home = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUserClick = () => {
    setShowRegister(true);
    setError('');
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    setError('');
    setFormData({ username: '', password: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.username.trim()) {
      setError('Please enter your astronaut name');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your secret code');
      return;
    }
    if (formData.password.length < 6) {
      setError('Secret code must be at least 6 characters');
      return;
    }

    // Here you would typically make an API call to authenticate
    // For now, we'll just store the username in localStorage and navigate
    localStorage.setItem('astronautName', formData.username);
    navigate('/galaxy');
  };

  return (
    <>
      <header>
        <nav>
          <Link to="/about"><i className="fa-solid fa-circle-info" style={{ fontSize: '2rem' }}></i></Link>
          <h1>Starbound</h1>
          <i 
            id="user" 
            className="fa-solid fa-user" 
            style={{ fontSize: '2rem', cursor: 'pointer' }}
            onClick={handleUserClick}
          ></i>
        </nav>

        {showRegister && (
          <>
            <div id="shade" style={{ display: 'block' }} onClick={handleCloseRegister}></div>
            <section id="register" style={{ display: 'block' }}>
              <button id="remover" onClick={handleCloseRegister} style={{ cursor: 'pointer' }}>x</button>
              <h1>Hop in!</h1>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="username">Astronaut-name:</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="password">Secret-code:</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                {error && (
                  <div style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <input type="submit" id="submit" value="Roam the galaxy" />
                </div>
              </form>
            </section>
          </>
        )}
      </header>

      <main>
        <section id="hero">
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', translate: '0rem 1.75rem' }}>
            Space Exploration Just Got Real!
          </h1>

          <p style={{ fontFamily: 'Nebula', fontSize: '1.25rem', fontWeight: '700', width: '70%' }}>
            Ditch the textbooks and get ready to explore the galaxy like never before! Play killer games on each
            planet, unlock secret info, and show off your smarts with mind-blowing quizzes. Learning's about to get
            a whole lot more lit.
          </p>

          <Link to="/galaxy" style={{ translate: '-0.20rem -1rem' }} id="cta" className="cta-button">
            Blast off!
          </Link>
        </section>
      </main>
    </>
  );
};

export default Home; 
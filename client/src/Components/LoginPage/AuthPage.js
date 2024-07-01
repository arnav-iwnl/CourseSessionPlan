// src/Components/LoginPage/AuthPage.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only needed for signup
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // To toggle between signup and signin
  const navigate = useNavigate();
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith('sies.edu.in')) {
      setError('You must use an sies.edu.in email address');
      return;
    }
  
    setError('');
    setIsLoading(true);
  
    try {
      const endpoint = isSignup ? 'http://localhost:5000/SignUp' : 'http://localhost:5000/SignIn';
      const body = isSignup ? JSON.stringify({ name, email, password }) : JSON.stringify({ email, password });
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'An error occurred');
        }
  
        // Successful login/signup
        onLogin(email); // Notify the App component of the login
  
        if (email.startsWith('hod')) {
          navigate('/hod', { state: { name: data.name } });
        } else {
          navigate('/faculty',  { state: { name: data.name } });
        }
      } else {
        // Handle non-JSON response
        const text = await response.text();
        throw new Error('The server returned an unexpected response');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
  <Row className="w-100 justify-content-center">
    <Col md="6" lg="5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">{isSignup ? 'Sign Up' : 'Sign In'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {isSignup && (
              <Form.Group controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
            </Button>

            <Button
              variant="link"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');  // Clear any existing errors when switching modes
              }}
              className="w-100 mt-2"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>
  );
};

export default AuthPage;

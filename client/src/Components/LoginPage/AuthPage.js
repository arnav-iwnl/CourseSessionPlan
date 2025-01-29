import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/authContext.js';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';


const supabase = createClient(process.env.REACT_APP_SUPABASE_URL,  process.env.REACT_APP_SUPABASE_KEY);

const AuthPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith('sies.edu.in')) {
      setError('You must use an sies.edu.in email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email);

        if (fetchError) throw fetchError;

        if (existingUser.length > 0) {
          setError('User already exists');
          setIsLoading(false);
          return;
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const { error: dbError } = await supabase.from('users').insert([
          {
            email: email,
            password: hashedPassword, // Store hashed password
            name: name,
          },
        ]);

        if (dbError) throw dbError;

        toast.success(`${email} signed up successfully`);
        onLogin(email);

        const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
        login({ email, role: userRole, name });

        navigate(userRole === 'hod' ? '/hod' : '/faculty', { state: { name } });
      } else {
        // Login logic
        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email);

        if (dbError) throw dbError;

        if (!data || data.length === 0) {
          setError('User does not exist');
          setIsLoading(false);
          return;
        }

        const user = data[0];

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          setError('Invalid password');
          return;
        }

        toast.success(`${email} logged in successfully`);
        onLogin(email);

        const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
        login({ email, role: userRole, name: user.name });

        navigate(userRole === 'hod' ? '/hod' : '/faculty', { state: { name: user.name } });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred');
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
              <h2 className="text-center mb-4">{isSignup ? 'Sign Up' : 'Login'}</h2>
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
                  {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
                </Button>

                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                  className="w-100 mt-2"
                >
                  {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
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

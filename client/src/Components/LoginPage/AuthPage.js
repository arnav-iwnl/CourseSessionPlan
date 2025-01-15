import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/authContext.js';
// import { useSubject } from '../../Context/subjectContext';

const AuthPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  // const { setSubjectCode } = useSubject();

  // Nested subject options

  // Handle category change and reset the subject dropdown
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubjectCode(''); // Reset subject selection
  };

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
      const body = isSignup
        ? JSON.stringify({ name, email, password,  })
        : JSON.stringify({ email, password });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'An error occurred');
        }

        // Update the context with the selected subject code
        // setSubjectCode(selectedSubjectCode);

        // Successful login/signup
        onLogin(email);
        const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
        login({ email, role: userRole, name: data.name });

        if (userRole === 'hod') {
          toast.success(`${data.name} logged in successfully`);
          navigate('/hod', { state: { name: data.name } });
        } else {
          toast.success(`${data.name} logged in successfully`);
          navigate('/faculty', { state: { name: data.name } });
        }
      } else {
        throw new Error('The server returned an unexpected response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
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
                    autoComplete=""
                  />
                </Form.Group>

                {/* Category dropdown */}
                {/* <Form.Group controlId="formCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Control as="select" value={selectedCategory} onChange={handleCategoryChange} required>
                    <option value="">Select Category</option>
                    {Object.keys(subjectsData).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group> */}

                {/* Subject dropdown (conditional based on selected category) */}
                {/* {selectedCategory && (
                  <Form.Group controlId="formSubject">
                    <Form.Label>Subject Code</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedSubjectCode}
                      onChange={(e) => setSelectedSubjectCode(e.target.value)}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjectsData[selectedCategory].map((subject) => (
                        <option key={subject.code} value={subject.code}>
                          {subject.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )} */}

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

import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/authContext.js';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://bogosjbvzcfcldahqzqv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ29zamJ2emNmY2xkYWhxenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTg2NjEsImV4cCI6MjA1MjQzNDY2MX0.UlaFnLDqXJgVF9tYCOL0c0hjCAd4__Yq47K5mVYdXcc';
const supabase = createClient(supabaseUrl, supabaseKey);

// import { useSubject } from '../../Context/subjectContext';

// const AuthPage = ({ onLogin }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSignup, setIsSignup] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email.endsWith('sies.edu.in')) {
//       setError('You must use an sies.edu.in email address');
//       return;
//     }

//     setError('');
//     setIsLoading(true);

//     try {
//       const endpoint = isSignup ? 'http://localhost:5000/SignUp' : 'http://localhost:5000/SignIn';
//       const body = isSignup
//         ? JSON.stringify({ name, email, password,  })
//         : JSON.stringify({ email, password });

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: body,
//       });

//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.indexOf('application/json') !== -1) {
//         const data = await response.json();
//         if (!response.ok) {
//           throw new Error(data.message || 'An error occurred');
//         }


//         // Successful login/signup
//         onLogin(email);
//         const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
//         login({ email, role: userRole, name: data.name });

//         if (userRole === 'hod') {
//           toast.success(`${data.name} logged in successfully`);
//           navigate('/hod', { state: { name: data.name } });
//         } else {
//           toast.success(`${data.name} logged in successfully`);
//           navigate('/faculty', { state: { name: data.name } });
//         }
//       } else {
//         throw new Error('The server returned an unexpected response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
//       <Row className="w-100 justify-content-center">
//         <Col md="6" lg="5">
//           <Card className="shadow-sm">
//             <Card.Body>
//               <h2 className="text-center mb-4">{isSignup ? 'Sign Up' : 'Login'}</h2>
//               {error && <Alert variant="danger">{error}</Alert>}
//               <Form onSubmit={handleSubmit}>
//                 {isSignup && (
//                   <Form.Group controlId="formBasicName">
//                     <Form.Label>Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       placeholder="Enter your name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                     />
//                   </Form.Group>
//                 )}

//                 <Form.Group controlId="formBasicEmail">
//                   <Form.Label>Email address</Form.Label>
//                   <Form.Control
//                     type="email"
//                     placeholder="Enter email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="formBasicPassword">
//                   <Form.Label>Password</Form.Label>
//                   <Form.Control
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     autoComplete=""
//                   />
//                 </Form.Group>                
//                 <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
//                   {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
//                 </Button>

//                 <Button
//                   variant="link"
//                   onClick={() => {
//                     setIsSignup(!isSignup);
//                     setError('');
//                   }}
//                   className="w-100 mt-2"
//                 >
//                   {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };
// export default AuthPage;





// const AuthPage = ({ onLogin }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSignup, setIsSignup] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email.endsWith('sies.edu.in')) {
//       setError('You must use an sies.edu.in email address');
//       return;
//     }

//     setError('');
//     setIsLoading(true);

//     try {
//       if (isSignup) {
//         // Sign up with Supabase Auth
//         const { user, error: authError } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: { name } // Store name in user metadata
//           }
//         });

//         if (authError) throw authError;

//         // Insert user data into the 'users' table after successful sign-up
//         const { error: dbError } = await supabase
//           .from('users') // Replace with your table name
//           .insert([
//             {
//               id: user.id, // Use the user ID from Supabase Auth
//               email: user.email,
//               name: name, // User name
//             }
//           ]);

//         if (dbError) throw dbError;

//         // Successful sign-up
//         toast.success(`${user.email} signed up successfully`);
//         onLogin(user.email);

//         const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
//         login({ email, role: userRole, name });

//         // Navigate based on role
//         if (userRole === 'hod') {
//           navigate('/hod', { state: { name } });
//         } else {
//           navigate('/faculty', { state: { name } });
//         }
//       } else {
//         // Log in
//         const { user, error: authError } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (authError) throw authError;

//         // Fetch user data from 'users' table after login
//         const { data, error: dbError } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', user.id)
//           .single();

//         if (dbError) throw dbError;

//         // Successful login
//         toast.success(`${user.email} logged in successfully`);
//         onLogin(user.email);

//         const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
//         login({ email, role: userRole, name: data.name });

//         // Navigate based on role
//         if (userRole === 'hod') {
//           navigate('/hod', { state: { name: data.name } });
//         } else {
//           navigate('/faculty', { state: { name: data.name } });
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error(error.message || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
//       <Row className="w-100 justify-content-center">
//         <Col md="6" lg="5">
//           <Card className="shadow-sm">
//             <Card.Body>
//               <h2 className="text-center mb-4">{isSignup ? 'Sign Up' : 'Login'}</h2>
//               {error && <Alert variant="danger">{error}</Alert>}
//               <Form onSubmit={handleSubmit}>
//                 {isSignup && (
//                   <Form.Group controlId="formBasicName">
//                     <Form.Label>Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       placeholder="Enter your name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                     />
//                   </Form.Group>
//                 )}

//                 <Form.Group controlId="formBasicEmail">
//                   <Form.Label>Email address</Form.Label>
//                   <Form.Control
//                     type="email"
//                     placeholder="Enter email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="formBasicPassword">
//                   <Form.Label>Password</Form.Label>
//                   <Form.Control
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </Form.Group>

//                 <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
//                   {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
//                 </Button>

//                 <Button
//                   variant="link"
//                   onClick={() => {
//                     setIsSignup(!isSignup);
//                     setError('');
//                   }}
//                   className="w-100 mt-2"
//                 >
//                   {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default AuthPage;

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
        // Check if user already exists in the 'users' table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        if (fetchError) throw fetchError;

        if (existingUser) {
          setError('User already exists');
          return;
        }

        // Insert user data into the 'users' table after successful sign-up
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              email: email,
              password: password, // Storing plain password
              name: name, // User name
            }
          ]);

        if (dbError) throw dbError;

        // Successful sign-up
        toast.success(`${email} signed up successfully`);
        onLogin(email);

        const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
        login({ email, role: userRole, name });

        // Navigate based on role
        if (userRole === 'hod') {
          navigate('/hod', { state: { name } });
        } else {
          navigate('/faculty', { state: { name } });
        }
      } else {
        // Log in: Check if the user exists in the 'users' table
        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (dbError) throw dbError;

        if (!data) {
          setError('User does not exist');
          return;
        }

        // Check if password matches
        if (password !== data.password) {
          setError('Invalid password');
          return;
        }

        // Successful login
        toast.success(`${email} logged in successfully`);
        onLogin(email);

        const userRole = email.startsWith('hod') ? 'hod' : 'faculty';
        login({ email, role: userRole, name: data.name });

        // Navigate based on role
        if (userRole === 'hod') {
          navigate('/hod', { state: { name: data.name } });
        } else {
          navigate('/faculty', { state: { name: data.name } });
        }
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
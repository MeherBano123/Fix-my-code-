import { Routes, Route } from 'react-router-dom';
import Login from '../components/pages/Login';
import SignUp from '../components/pages/Signup'
import Home from '../components/pages/Home'
import CodeFixer from '../components/pages/codefixer';
import About from '../components/pages/About';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    
      <Route path="/login" element={<Login />} /> 
      <Route path="/signup" element={<SignUp />} /> 
      <Route path="/code-fix" element={<CodeFixer />} />
      <Route path="/about" element={<About />} />
      
    </Routes>
  );
};

export default AppRoutes;

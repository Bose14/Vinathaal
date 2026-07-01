
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import AppLayout from '@/components/layout/AppLayout';
import Workspaces from './pages/Workspaces';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Generator from './pages/Generator';
import QuestionBankGenerator from './components/QuestionBankGenerator';
import MCQGenerator from './pages/MCQGenerator';
import MCQAnswerKey from './pages/MCQAnswerKey';
import Result from './pages/Result';
import AnswerKey from './pages/AnswerKey';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Support from './pages/Support';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner";
import './App.css';


function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkspaceProvider>
          <div className="App">
            <Routes>
              {/* Public routes — no sidebar */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* App routes — sidebar shown when authenticated */}
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/history" element={<AppLayout><History /></AppLayout>} />
              <Route path="/generator" element={<AppLayout><Generator /></AppLayout>} />
              <Route path="/question-bank" element={<AppLayout><QuestionBankGenerator /></AppLayout>} />
              <Route path="/mcq-generator" element={<AppLayout><MCQGenerator /></AppLayout>} />
              <Route path="/result/:templateId" element={<AppLayout><Result /></AppLayout>} />
              <Route path="/answer-key" element={<AppLayout><AnswerKey /></AppLayout>} />
              <Route path="/pricing" element={<AppLayout><Pricing /></AppLayout>} />
              <Route path="/support" element={<AppLayout><Support /></AppLayout>} />
              <Route path="/templates" element={<AppLayout><Templates /></AppLayout>} />
              <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
              <Route path="/create-community" element={<AppLayout><CreateCommunity /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
              <Route path="/workspaces" element={<AppLayout><Workspaces /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="/mcq-answer-key" element={<AppLayout><MCQAnswerKey /></AppLayout>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

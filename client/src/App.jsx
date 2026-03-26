import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { PublicRoute } from './components/PublicRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import MockTest from './pages/MockTest'
import Exam from './pages/Exam'
import Result from './pages/Result'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminTests from './pages/admin/AdminTests'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import Pricing from './pages/Pricing'

function App() {
  

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />}/>
          <Route path="/sign-in" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }/>
          <Route path="/sign-up" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }/>
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }/>
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }/>

          {/* Protected routes */}
          <Route path="/mocks" element={
            <ProtectedRoute>
              <MockTest />
            </ProtectedRoute>
          }/>
          <Route path="/exam" element={
            <ProtectedRoute>
              <Exam />
            </ProtectedRoute>
          }/>
          <Route path="/result" element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }/>
          <Route path="/pricing" element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }/>

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="tests" element={<AdminTests />} />
          </Route>

          {/* Catch all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App



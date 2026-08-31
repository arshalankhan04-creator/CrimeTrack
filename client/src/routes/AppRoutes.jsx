import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FoundationStatus from '../pages/FoundationStatus';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import ViewerDashboard from '../pages/viewer/ViewerDashboard';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route (No application layout frame) */}
      <Route path="/login" element={<Login />} />

      {/* Main Application Frame Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <FoundationStatus />
          </Layout>
        }
      />
      <Route
        path="/health"
        element={
          <Layout>
            <FoundationStatus />
          </Layout>
        }
      />

      {/* Admin Protected Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin User Management */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <Layout>
                <Users />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Officer Protected Dashboard */}
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['OFFICER']}>
              <Layout>
                <OfficerDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Viewer Protected Dashboard */}
      <Route
        path="/viewer/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['VIEWER']}>
              <Layout>
                <ViewerDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Unauthorized 403 Page */}
      <Route
        path="/unauthorized"
        element={
          <Layout>
            <Unauthorized />
          </Layout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

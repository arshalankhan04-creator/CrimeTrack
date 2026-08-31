import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FoundationStatus from '../pages/FoundationStatus';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FoundationStatus />} />
        <Route path="/health" element={<FoundationStatus />} />
        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

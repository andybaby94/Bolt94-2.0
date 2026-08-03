import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { NewIncident } from '@/pages/NewIncident';
import { EditIncident } from '@/pages/EditIncident';
import { IncidentDetail } from '@/pages/IncidentDetail';
import { StudentList } from '@/pages/StudentList';
import { StudentDetail } from '@/pages/StudentDetail';
import { StudentForm } from '@/pages/StudentForm';
import { GuardianNotice } from '@/pages/GuardianNotice';
import { BatchPrint } from '@/pages/BatchPrint';
import { IncidentList } from '@/pages/IncidentList';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { AuthGate } from '@/components/AuthGate';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<AuthGate />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents/new" element={<NewIncident />} />
          <Route path="/incidents/:id/edit" element={<EditIncident />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/incidents/:id/notice" element={<GuardianNotice />} />
          <Route path="/print/today" element={<BatchPrint />} />
          <Route path="/incidents/all" element={<IncidentList />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id/edit" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

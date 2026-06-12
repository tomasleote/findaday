import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GroupProvider } from '../../shared/context';
import { ErrorBoundary } from '../../shared/ui';
import { runStorageMigration } from '../../utils/storageMigration';

const AdminPanel = React.lazy(() => import('../admin/AdminPage'));
const ParticipantView = React.lazy(() => import('../../components/ParticipantView'));
const HomePage = React.lazy(() => import('../home/HomePage'));
const GroupCreatedScreen = React.lazy(() => import('../home/GroupCreatedScreen'));

function RootHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gId = searchParams.get('group');
  const adminTok = searchParams.get('admin');
  const pId = searchParams.get('p');

  const [groupId, setGroupId] = useState(gId || null);
  const [adminToken, setAdminToken] = useState(adminTok || null);
  const [participantId, setParticipantId] = useState(pId || null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    runStorageMigration();

    if (gId) {
      setGroupId(gId);
      if (adminTok) {
        setAdminToken(adminTok);
        setCurrentPage('admin');
        try { localStorage.setItem(`fad_admin_${gId}`, adminTok); } catch { }
        return;
      }
      if (pId) {
        setParticipantId(pId);
        setCurrentPage('participant');
        return;
      }

      // localStorage fallback
      try {
        const storedAdmin = localStorage.getItem(`fad_admin_${gId}`);
        if (storedAdmin) {
          setAdminToken(storedAdmin);
          setCurrentPage('admin');
          return;
        }
        const storedParticipant = localStorage.getItem(`fad_p_${gId}`);
        if (storedParticipant) {
          const { participantId: storedPId } = JSON.parse(storedParticipant);
          setParticipantId(storedPId);
          setCurrentPage('participant');
          return;
        }
      } catch { }

      setAdminToken(null);
      setParticipantId(null);
      setCurrentPage('participant');
    } else {
      setAdminToken(null);
      setParticipantId(null);
      setCurrentPage('home');
    }
  }, [gId, adminTok, pId]);

  const handleCreateGroup = ({ groupId, adminToken }) => {
    setGroupId(groupId);
    setAdminToken(adminToken);
    try { localStorage.setItem(`fad_admin_${groupId}`, adminToken); } catch { }
    setCurrentPage('created');
  };

  const handleEnterAdmin = () => {
    setCurrentPage('admin');
    try { localStorage.setItem(`fad_admin_${groupId}`, adminToken); } catch { }
    navigate(`/?group=${groupId}&admin=${adminToken}`);
  };

  const handleJoinGroup = (joinGId, optAdminToken) => {
    if (optAdminToken) {
      handleRecoverAdmin(joinGId, optAdminToken);
      return;
    }
    setGroupId(joinGId);
    setAdminToken(null);
    setParticipantId(null);
    setCurrentPage('participant');
    navigate(`/?group=${joinGId}`);
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setGroupId(null);
    setAdminToken(null);
    setParticipantId(null);
    navigate('/');
  };

  const handleRecoverAdmin = (recGId, newAdminToken) => {
    setGroupId(recGId);
    setAdminToken(newAdminToken);
    try { localStorage.setItem(`fad_admin_${recGId}`, newAdminToken); } catch { }
    setCurrentPage('admin');
    navigate(`/?group=${recGId}&admin=${newAdminToken}`);
  };

  const isAdmin = !!adminToken;

  return (
    <GroupProvider groupId={groupId} adminToken={adminToken} isAdmin={isAdmin}>
      {currentPage === 'home' && (
        <ErrorBoundary>
          <HomePage onCreateGroup={handleCreateGroup} onJoinGroup={handleJoinGroup} onRecoverAdmin={handleRecoverAdmin} />
        </ErrorBoundary>
      )}
      {currentPage === 'created' && (
        <ErrorBoundary>
          <GroupCreatedScreen
            groupId={groupId}
            adminToken={adminToken}
            onEnterAdmin={handleEnterAdmin}
            onBack={handleBackHome}
          />
        </ErrorBoundary>
      )}
      {currentPage === 'admin' && (
        <ErrorBoundary>
          <AdminPanel
            onBack={handleBackHome}
          />
        </ErrorBoundary>
      )}
      {currentPage === 'participant' && (
        <ErrorBoundary>
          <ParticipantView
            participantId={participantId}
            onBack={handleBackHome}
          />
        </ErrorBoundary>
      )}
    </GroupProvider>
  );
}

export default RootHandler;

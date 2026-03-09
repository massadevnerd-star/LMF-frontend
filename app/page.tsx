'use client'

import { useState } from "react";
import { ViewType, Song } from '@/app/types';
import GenioAi from "./_components/GenioAi/page";
import Dashboard from "./_components/Dashboard/page";
import MainLayout from "./_components/MainLayout";
import Laboratorio from "./_components/Laboratorio/page";
import AtelierView from "./_components/AtelierView/page";
import ParentsArea from "./_components/ParentsArea/page";
import SearchView from "./_components/SearchView/page";
import { useAuth } from "@/app/context/AuthContext";
import ProfileSelection from "./_components/ProfileSelection/page";
import UserProfile from "./_components/UserProfile/page";

export default function Home() {
  const { user, activeProfile } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>('home');
  // selectedStory seems unused in current renderView logic, but keeping state to avoid breaking potential future handling
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Unused handlers kept for safety if they are used by children I passed props to? 
  // Wait, Dashboard doesn't take these handlers in the original code. 
  // I will just keep logic as is but minimal.

  const handleSideNav = (view: ViewType) => {
    if (view === 'laboratorio') {
      setSelectedDraftId(null);
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard
          currentView={currentView}
          setView={setCurrentView}
          isDarkMode={isDarkMode}
          setSelectedDraftId={setSelectedDraftId}
        />;

      /*      case 'atelier':
              return <AtelierView
                currentView={currentView}
                setView={setCurrentView}
                isDarkMode={isDarkMode}
                setSelectedDraftId={setSelectedDraftId}
              />; */
      case 'search':
        return <SearchView currentView={currentView} setView={setCurrentView} isDarkMode={isDarkMode} />;
      case 'ai-discovery':
        return <GenioAi currentView={currentView} setView={setCurrentView} isDarkMode={isDarkMode} />;
      case 'profile-selection':
        return <ProfileSelection isDarkMode={isDarkMode} setView={setCurrentView} />;
      case 'laboratorio':
        return <Laboratorio
          currentView={currentView}
          setView={setCurrentView}
          isDarkMode={isDarkMode}
          selectedDraftId={selectedDraftId}
        />;
      case 'gadgets':
        return 'GadgetsView';
      case 'user-profile':
        return <UserProfile isDarkMode={isDarkMode} setView={setCurrentView} />;
      case 'parents-area':
        return <ParentsArea currentView={currentView} setView={setCurrentView} isDarkMode={isDarkMode} />;
      default:
        return 'HomeView';
    }
  }

  // Guard: If logged in but no profile selected, render ProfileSelection View
  // We override currentView safely here or just let the effect of renderView handle it?
  // Better approach: If user && !activeProfile, force the view to be profile selection in the switch or override the return of renderView

  const contentToRender = (user && !activeProfile) ? <ProfileSelection isDarkMode={isDarkMode} setView={setCurrentView} /> : renderView();


  return (
    <MainLayout
      currentView={currentView}
      setView={handleSideNav}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      {contentToRender}
    </MainLayout>
  );
}

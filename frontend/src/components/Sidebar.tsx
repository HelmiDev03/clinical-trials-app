import React, { useState } from 'react';
import { Search, BarChart3, TrendingUp, PieChart, MapPin, Activity, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const mainSections = [
    {
      id: 'trials',
      label: 'Search & Filter',
      icon: Search,
      description: 'Find clinical trials',
      path: '/'
    }
  ];

  const analyticsSections = [
    {
      id: 'status-analytics',
      label: 'Trial Status',
      icon: Activity,
      description: 'Status distribution',
      path: '/status-analytics'
    },
    {
      id: 'country-analytics',
      label: 'By Country',
      icon: MapPin,
      description: 'Geographic distribution',
      path: '/country-analytics'
    },
    {
      id: 'phase-analytics',
      label: 'Phase Analysis',
      icon: TrendingUp,
      description: 'Phase breakdown',
      path: '/phase-analytics'
    }
  ];

  const SectionItem = ({ section, isActive, onClick }: any) => (
    <button
      onClick={() => {
        onClick(section.path);
        // Close mobile menu when item is clicked
        if (onToggle && window.innerWidth < 768) {
          onToggle();
        }
      }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:scale-105",
        isActive
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-105"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      <section.icon className={cn(
        "h-5 w-5 transition-all duration-300",
        isActive ? "text-primary-foreground" : "group-hover:text-primary"
      )} />
      <div className="text-left">
        <div className={cn(
          "font-medium text-sm",
          isActive ? "text-primary-foreground" : ""
        )}>
          {section.label}
        </div>
        <div className={cn(
          "text-xs opacity-70",
          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {section.description}
        </div>
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {onToggle && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Single sidebar that works for both mobile and desktop */}
      <div className={cn(
        "border-r border-border/50 shadow-xl",
        // Background: solid on mobile, gradient on desktop
        onToggle ? "bg-background" : "bg-gradient-to-b from-background to-muted/20",
        // Base positioning and sizing
        "w-80 h-full",
        // Mobile: when onToggle is provided, use fixed positioning with animation
        onToggle && "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none",
        onToggle && (isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
        // Desktop: when onToggle is NOT provided, use relative positioning (always visible)
        !onToggle && "relative"
      )}>
        <div className="p-4 md:p-6">
          {/* Mobile Close Button */}
          <div className="flex justify-end md:hidden mb-4">
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                ClinicalTrials Data
              </h2>
              <p className="text-xs text-muted-foreground">Analytics Platform</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="space-y-2 mb-6 md:mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Main
            </h3>
            {mainSections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                isActive={location.pathname === section.path}
                onClick={(path: string) => navigate(path)}
              />
            ))}
          </div>

          {/* Analytics Navigation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Analytics
            </h3>
            {analyticsSections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                isActive={location.pathname === section.path}
                onClick={(path: string) => navigate(path)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

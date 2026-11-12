import React from 'react';
import { FolderTree, Terminal, Radio, BookOpen, GitBranch, Network, Luggage } from 'lucide-react';

export type TabType = 'transformer' | 'portability' | 'docker' | 'compatibility' | 'player' | 'github' | 'guide';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  strmCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  strmCount
}) => {
  const tabs = [
    {
      id: 'transformer' as TabType,
      label: 'Media Library & Directory Mapper',
      icon: FolderTree,
      badge: `${strmCount} files`
    },
    {
      id: 'portability' as TabType,
      label: '.STRM Portability Hub',
      icon: Luggage,
      badge: 'Zero Storage'
    },
    {
      id: 'docker' as TabType,
      label: 'Docker YAML & Compose Suite',
      icon: Terminal,
      badge: 'ZimaOS & CasaOS'
    },
    {
      id: 'compatibility' as TabType,
      label: 'Plex, Emby, Jellyfin & VLC (DuckDNS/NPM)',
      icon: Network,
      badge: '4 Players'
    },
    {
      id: 'player' as TabType,
      label: 'Live HTTPS Stream Simulator',
      icon: Radio,
      badge: '206 Partial'
    },
    {
      id: 'github' as TabType,
      label: 'GitHub & AGPL-3.0 Publisher',
      icon: GitBranch,
      badge: 'AGPLv3'
    },
    {
      id: 'guide' as TabType,
      label: 'Architecture & Deployment Guide',
      icon: BookOpen,
      badge: 'Docs'
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-[#0B0F17]/80 backdrop-blur-sm sticky top-[65px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

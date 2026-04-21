import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function TopNav() {
  const { user, logout } = useAuthStore();

  const handleQuickExit = () => {
    // Implement an instant redirect to a safe page like Google, 
    // replacing the current history state to prevent back navigation.
    window.location.replace('https://www.google.com');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-[72px]">
        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center">
          <button className="p-2 text-neutral-500 hover:text-primary transition-colors hover:bg-primary-light rounded-full">
            <Menu size={24} />
          </button>
        </div>

        {/* Center/Left Content (Spacer for Desktop) */}
        <div className="hidden md:flex flex-1 items-center gap-4">
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
            Hello, {user?.alias || user?.name || 'Welcome'}
          </h2>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Exit Button - Prioritized for Patient Safety */}
          <Button
            variant="dangerGhost"
            size="sm"
            onClick={handleQuickExit}
            className="font-bold tracking-wide mr-2 hidden sm:flex !bg-alert/10 hover:!bg-alert/20 !text-alert border border-alert/20"
            title="Instantly exit the platform"
          >
            Quick Exit
          </Button>

          <button className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors hover:bg-primary-light rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-alert rounded-full border-2 border-background" />
          </button>

          <div className="h-6 w-px bg-neutral-200 mx-1" />

          <div className="flex items-center gap-3 cursor-pointer hover:bg-neutral-200/50 p-1.5 pr-3 rounded-full transition-colors group">
            <Avatar size="sm" name={user?.alias || user?.name} online={true} />
            <span className="text-[14px] font-medium text-neutral-900 hidden sm:block group-hover:text-primary transition-colors">
              {user?.alias || user?.name?.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-10 h-10 flex hidden sm:flex items-center justify-center text-neutral-400 hover:text-alert transition-colors hover:bg-alert-light rounded-full ml-1"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

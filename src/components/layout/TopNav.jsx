import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Bell, Check, ExternalLink, Calendar, MessageSquare, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    subscribeNotifications, 
    markAsRead, 
    markAllAsRead,
    cleanup 
  } = useNotificationStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      subscribeNotifications(user.uid);
    }
    return () => cleanup();
  }, [user?.uid, subscribeNotifications, cleanup]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (user?.role === 'professional') {
      navigate('/pro/profile');
    } else if (user?.role === 'patient') {
      navigate('/patient/settings');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-primary" />;
      case 'booking': return <Calendar size={16} className="text-accent-hover" />;
      default: return <Info size={16} className="text-neutral-400" />;
    }
  };

  const handleQuickExit = () => {
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

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 flex items-center justify-center transition-all rounded-full relative ${
                showNotifications ? 'bg-primary-light text-primary' : 'text-neutral-500 hover:text-primary hover:bg-primary-light'
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-4 h-4 bg-alert text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-[24px] shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 text-[16px]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-[12px] font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                    >
                      <Check size={14} /> Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-neutral-50">
                      {notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-5 cursor-pointer transition-all hover:bg-neutral-50 flex gap-4 ${!notif.read ? 'bg-primary-light/10' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'message' ? 'bg-primary-light/50' : 'bg-accent-light/50'
                          }`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-[14px] font-bold truncate ${!notif.read ? 'text-neutral-900' : 'text-neutral-600'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && <span className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            <p className="text-[13px] text-neutral-500 line-clamp-2 leading-snug">
                              {notif.body}
                            </p>
                            <p className="text-[11px] font-bold text-neutral-400 mt-2 uppercase tracking-wider">
                              {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 px-6 text-center">
                      <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <Bell size={24} />
                      </div>
                      <p className="font-bold text-neutral-900 text-[15px]">All caught up!</p>
                      <p className="text-[13px] text-neutral-500 mt-1">No new notifications at the moment.</p>
                    </div>
                  )}
                </div>

                {notifications.length > 5 && (
                  <div className="p-4 bg-neutral-50 text-center">
                    <button className="text-[13px] font-bold text-neutral-500 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto">
                      View all history <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-neutral-200 mx-1" />

          <div 
            onClick={handleProfileClick}
            className="flex items-center gap-3 cursor-pointer hover:bg-neutral-200/50 p-1.5 pr-3 rounded-full transition-colors group"
          >
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

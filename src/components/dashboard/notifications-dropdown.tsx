'use client';

import { AlertCircle, Bell, Check, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  _id: string;
  type: 'integration_failure' | 'system' | 'warning' | 'submission';
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    formId?: string;
    formName?: string;
    submissionId?: string;
  };
  createdAt: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'integration_failure':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'submission':
        return <Inbox className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-foreground text-sm font-semibold">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto p-0 text-xs hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-100">
          {(() => {
            if (loading) {
              return (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground text-sm">Loading...</div>
                </div>
              );
            }
            if (notifications.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-8">
                  <Bell className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    No notifications yet
                  </p>
                </div>
              );
            }
            return (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const link = notification.metadata?.formId
                    ? `/dashboard/forms/${notification.metadata.formId}`
                    : '/dashboard';

                  return (
                    <Link
                      key={notification._id}
                      href={link}
                      onClick={() => handleNotificationClick(notification)}
                      className={`block px-4 py-3 transition-colors hover:bg-secondary ${
                        !notification.read ? 'bg-secondary/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm ${
                                !notification.read
                                  ? 'text-foreground font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {notification.message}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {new Date(notification.createdAt).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })()}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmailStore } from '@/lib/store';
import { TrackedEmail } from '@/types';
import { TrackEmailDialog } from './TrackEmailDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Inbox, CheckCircle, Send, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
const statusConfig = {
  WAITING: {
    label: 'Waiting',
    color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30 dark:text-yellow-400',
    icon: Clock,
  },
  REPLIED: {
    label: 'Replied',
    color: 'bg-green-400/20 text-green-600 border-green-400/30 dark:text-green-400',
    icon: CheckCircle,
  },
  FOLLOW_UP_SENT: {
    label: 'Follow-up Sent',
    color: 'bg-blue-400/20 text-blue-600 border-blue-400/30 dark:text-blue-500',
    icon: Send,
  },
};
const EmailTableRow = ({ email }: { email: TrackedEmail }) => {
  const updateEmailStatus = useEmailStore((state) => state.updateEmailStatus);
  const config = statusConfig[email.status];
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hover:bg-muted/50 transition-colors"
    >
      <TableCell>
        <div className="font-medium">{email.recipient}</div>
        <div className="text-sm text-muted-foreground hidden md:block">{email.subject}</div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div>{format(email.sentAt, 'MMM d, yyyy')}</div>
        <div className="text-sm text-muted-foreground">{formatDistanceToNow(email.sentAt, { addSuffix: true })}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-center">{email.followUpInterval} days</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("font-semibold", config.color)}>
          <config.icon className="mr-1.5 h-3.5 w-3.5" />
          {config.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => updateEmailStatus(email.id, 'WAITING')}>Mark as Waiting</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateEmailStatus(email.id, 'REPLIED')}>Mark as Replied</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
};
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="text-center py-16 px-4"
  >
    <Inbox className="mx-auto h-16 w-16 text-muted-foreground/50" />
    <h3 className="mt-4 text-2xl font-semibold text-foreground">No Emails Tracked Yet</h3>
    <p className="mt-2 text-base text-muted-foreground">
      Click "Track New Email" to start monitoring your conversations.
    </p>
    <div className="mt-6">
      <TrackEmailDialog />
    </div>
  </motion.div>
);
const LoadingState = () => (
    <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
);
const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 text-destructive"
    >
        <AlertTriangle className="mx-auto h-16 w-16" />
        <h3 className="mt-4 text-2xl font-semibold">Something went wrong</h3>
        <p className="mt-2 text-base">{error}</p>
        <Button onClick={onRetry} className="mt-6">Try Again</Button>
    </motion.div>
);
export function Dashboard() {
  const { emails, isLoading, error, fetchEmails } = useEmailStore((state) => ({
    emails: state.emails,
    isLoading: state.isLoading,
    error: state.error,
    fetchEmails: state.fetchEmails,
  }));
  useEffect(() => {
    // This effect will run on mount and fetch emails.
    // The store already calls this once, but this is a good pattern for components
    // that need to trigger a fetch.
    if (emails.length === 0 && !isLoading) {
        fetchEmails();
    }
    // Set up an interval to re-fetch data periodically to keep it fresh
    const interval = setInterval(() => {
        fetchEmails();
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [fetchEmails, emails.length, isLoading]);
  const sortedEmails = [...emails].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  const renderContent = () => {
    if (isLoading && emails.length === 0) {
        return <LoadingState />;
    }
    if (error) {
        return <ErrorState error={error} onRetry={fetchEmails} />;
    }
    if (sortedEmails.length === 0) {
        return <EmptyState />;
    }
    return (
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Recipient & Subject</TableHead>
                <TableHead className="hidden lg:table-cell">Date Sent</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Interval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <AnimatePresence>
                {sortedEmails.map((email) => (
                    <EmailTableRow key={email.id} email={email} />
                ))}
                </AnimatePresence>
            </TableBody>
            </Table>
        </div>
    );
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Keep your conversations moving forward.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            <TrackEmailDialog />
        </div>
      </div>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Tracked Emails</CardTitle>
          <CardDescription>A list of all emails you are currently tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
}
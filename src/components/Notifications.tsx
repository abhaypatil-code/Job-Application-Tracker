import { useEffect } from 'react';
import { useJobs } from '../hooks/useJobs';
import { isAfter, isBefore, addHours, parseISO } from 'date-fns';

const Notifications = () => {
  const { jobs } = useJobs();

  useEffect(() => {
    const checkUpcomingRounds = () => {
      if (!('Notification' in window)) return;

      if (
        Notification.permission !== 'granted' &&
        Notification.permission !== 'denied'
      ) {
        Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        const now = new Date();
        const next24h = addHours(now, 24);

        jobs.forEach((job) => {
          job.rounds.forEach((round) => {
            if (!round.completed) {
              const roundDate = parseISO(round.date);
              if (isAfter(roundDate, now) && isBefore(roundDate, next24h)) {
                // Check if we already notified? (Simplified: just notify on load/check)
                // In a real app, we'd track notification state to avoid spam.
                // For now, we'll just log or show one if it's very close.

                // Let's only notify if it's within 1 hour for demo purposes, or just notify once per session.
                // We'll rely on the browser to handle duplicates if we use a tag.
                new Notification(`Upcoming Interview: ${job.company}`, {
                  body: `${round.type} round in less than 24 hours!`,
                  tag: `${job.id}-${round.id}`, // Prevent duplicate notifications
                });
              }
            }
          });
        });
      }
    };

    checkUpcomingRounds();
    // Check every hour
    const interval = setInterval(checkUpcomingRounds, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [jobs]);

  return null; // Headless component
};

export default Notifications;

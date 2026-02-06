import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EventContext = createContext();

export const EventProvider = ({ children, eventSlug }) => {
  const [eventData, setEventData] = useState(null);
  const [theme, setTheme] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch Event details
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('slug', eventSlug)
          .maybeSingle();

        if (eventError) throw eventError;

        if (!event) {
          setError(`Evento "${eventSlug}" não encontrado.`);
          setLoading(false);
          return;
        }

        setEventData(event);

        // Fetch Theme Config (Resilient query: order by created_at and limit 1)
        const { data: themeData, error: themeError } = await supabase
          .from('theme_configs')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (themeError) console.error('Error fetching theme:', themeError);
        setTheme(themeData);

        // Fetch Quiz Questions
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('event_id', event.id);

        if (quizError) console.error('Error fetching quiz:', quizError);
        setQuiz(quizData || []);

      } catch (err) {
        console.error('Event Context Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventSlug]);

  const value = {
    eventData,
    theme,
    quiz,
    loading,
    error,
    eventSlug
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

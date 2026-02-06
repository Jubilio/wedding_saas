DO $$ 
BEGIN
  -- 1. Create the publication if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- 2. Add tables to the publication individually (ignoring errors if already present)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;
  EXCEPTION WHEN others THEN RAISE NOTICE 'Table rsvps already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invites;
  EXCEPTION WHEN others THEN RAISE NOTICE 'Table invites already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  EXCEPTION WHEN others THEN RAISE NOTICE 'Table tables already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
  EXCEPTION WHEN others THEN RAISE NOTICE 'Table guests already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_messages;
  EXCEPTION WHEN others THEN RAISE NOTICE 'Table messages already in publication';
  END;

END $$;

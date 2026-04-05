
DROP POLICY "Authenticated can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications for others" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

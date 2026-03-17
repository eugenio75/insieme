
-- Storage bucket for health documents
INSERT INTO storage.buckets (id, name, public) VALUES ('health-documents', 'health-documents', false);

-- Storage RLS policies
CREATE POLICY "Users can upload own health documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'health-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own health documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'health-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own health documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'health-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Health documents table
CREATE TABLE public.health_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('diet', 'medical_tests')),
  file_path TEXT,
  file_name TEXT,
  manual_content TEXT,
  ai_analysis JSONB,
  ai_meal_plan JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own health documents"
ON public.health_documents FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own health documents"
ON public.health_documents FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own health documents"
ON public.health_documents FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health documents"
ON public.health_documents FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_health_documents_updated_at
  BEFORE UPDATE ON public.health_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

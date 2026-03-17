import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface HealthDocument {
  id: string;
  user_id: string;
  doc_type: 'diet' | 'medical_tests';
  file_path: string | null;
  file_name: string | null;
  manual_content: string | null;
  ai_analysis: any;
  ai_meal_plan: any;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export const useHealthDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('health_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data as unknown as HealthDocument[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = async (file: File, docType: 'diet' | 'medical_tests') => {
    if (!user) return null;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('health-documents')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Errore nel caricamento del file');
      return null;
    }

    const { data: doc, error: insertError } = await supabase
      .from('health_documents')
      .insert({
        user_id: user.id,
        doc_type: docType,
        file_path: filePath,
        file_name: file.name,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (insertError) {
      toast.error('Errore nel salvataggio');
      return null;
    }

    await analyzeDocument((doc as any).id, docType);
    await fetchDocuments();
    return doc;
  };

  const submitManual = async (content: string, docType: 'diet' | 'medical_tests') => {
    if (!user) return null;

    const { data: doc, error } = await supabase
      .from('health_documents')
      .insert({
        user_id: user.id,
        doc_type: docType,
        manual_content: content,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Errore nel salvataggio');
      return null;
    }

    await analyzeDocument((doc as any).id, docType, content);
    await fetchDocuments();
    return doc;
  };

  const analyzeDocument = async (documentId: string, docType: string, manualContent?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ documentId, docType, manualContent }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Troppe richieste, riprova tra poco');
        } else if (response.status === 402) {
          toast.error('Crediti AI esauriti');
        } else {
          toast.error('Errore nell\'analisi');
        }
        return;
      }

      toast.success('Analisi completata! 🎉');
      await fetchDocuments();
    } catch (e) {
      toast.error('Errore di connessione');
    }
  };

  const deleteDocument = async (id: string, filePath?: string | null) => {
    if (filePath) {
      await supabase.storage.from('health-documents').remove([filePath]);
    }
    await supabase.from('health_documents').delete().eq('id', id);
    await fetchDocuments();
    toast.success('Documento eliminato');
  };

  const dietDocs = documents.filter(d => d.doc_type === 'diet');
  const medicalDocs = documents.filter(d => d.doc_type === 'medical_tests');

  return {
    documents, dietDocs, medicalDocs, loading,
    uploadFile, submitManual, deleteDocument, fetchDocuments,
  };
};


'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAppSettings } from '@/context/app-settings-context';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const settingsSchema = z.object({
  appName: z.string().min(1, 'O nome do aplicativo é obrigatório.'),
  logo: z.any().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { toast } = useToast();
  const { appName, logoUrl, setAppName, setLogoUrl, loading } = useAppSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);


  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: '',
    },
  });

  useEffect(() => {
    if (!loading) {
      form.setValue('appName', appName);
      if (logoUrl) {
        setLogoPreview(logoUrl);
      }
    }
  }, [appName, logoUrl, loading, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      let newLogoUrl = logoUrl;
      const logoFile = data.logo?.[0];

      if (logoFile) {
        const storageRef = ref(storage, `logos/app-logo`);
        const snapshot = await uploadBytes(storageRef, logoFile);
        newLogoUrl = await getDownloadURL(snapshot.ref);
      }
      
      const settingsData = {
        appName: data.appName,
        logoUrl: newLogoUrl,
      };

      await setDoc(doc(db, 'settings', 'app-config'), settingsData);

      setAppName(data.appName);
      if (newLogoUrl) {
        setLogoUrl(newLogoUrl);
      }

      toast({
        title: 'Configurações Salvas!',
        description: 'As configurações do aplicativo foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidade Visual</CardTitle>
        <CardDescription>Personalize o nome e o logo que aparecem no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aplicativo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Minha Oficina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                   <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 rounded-md">
                        <AvatarImage src={logoPreview || ''} className="object-contain" />
                        <AvatarFallback className="rounded-md">Logo</AvatarFallback>
                    </Avatar>
                    <FormControl>
                        <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                                field.onChange(e.target.files);
                                handleLogoChange(e);
                            }}
                        />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

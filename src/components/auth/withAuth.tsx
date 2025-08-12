
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      if (loading) {
        return; 
      }
      if (error) {
        console.error('Authentication error:', error);
        router.push('/login');
        return;
      }
      if (!user) {
        router.push('/login');
        return;
      }

      const checkAuthorization = async () => {
        if (user && user.email) {
          try {
            const userDocRef = doc(db, 'authorizedUsers', user.email);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          } catch (e) {
            console.error('Authorization check error:', e);
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      };
      
      checkAuthorization();

    }, [user, loading, error, router]);

    if (loading || isAuthorized === null) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }
    
    if (!isAuthorized) {
        return (
            <div className="flex h-screen flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold">Acesso Negado</h1>
                <p className="text-muted-foreground">
                    Você não tem permissão para acessar esta aplicação.
                </p>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };
  
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}

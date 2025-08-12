
'use client';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
      </svg>
    );
}

export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            toast({
                title: "Erro de Autenticação",
                description: "Não foi possível fazer login com o Google. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
                    <CardDescription>Por favor, faça login com sua conta Google para continuar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleSignIn}>
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Entrar com Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    return (
        <Suspense fallback={<Loading />}>
            <CallbackHandler />
        </Suspense>
    );
}

function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#fff9f0]">
            <Loader2 className="w-12 h-12 text-[#9d319e] animate-spin mb-4" />
            <p className="text-[#4a1d96] font-bold text-lg">Accesso in corso...</p>
        </div>
    );
}

function CallbackHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Persist the Bearer token so axios interceptors attach it on every request
            localStorage.setItem("auth_token", token);
        }

        // Hard reload to home so AuthContext re-fetches the user with the new token
        window.location.href = "/";
    }, [searchParams]);

    return <Loading />;
}

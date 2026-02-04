"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EcolageRootPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace("/ecolage/insertion")
    }, [router])

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
    )
}

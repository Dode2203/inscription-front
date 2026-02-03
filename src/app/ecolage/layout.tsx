import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Ecolage | Service Scolarité",
    description: "Module de gestion de l'écolage pour le service scolarité.",
}

export default function EcolageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

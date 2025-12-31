
import { Suspense } from 'react'
import EditUserContent from './editcontent'
import { Skeleton } from '@/components/ui/skeleton' // Si vous avez un composant Skeleton

export default function EditUserPage() {
  return (
    <Suspense fallback={<EditUserSkeleton />}>
      <EditUserContent />
    </Suspense>
  )
}
// Pour le server
function EditUserSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <Skeleton className="h-8 w-64" />
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6 bg-card p-8 rounded-lg border">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-4 pt-6">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </main>
  )
}

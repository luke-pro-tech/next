import PreferenceForm from '@/components/PreferenceForm';
import { AgoraProvider } from '@/contexts/AgoraContext';

export default function Home() {
  return (
    <AgoraProvider>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              What kind of experiences do you enjoy?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the tourism genres that interest you most. We'll use your preferences to create the perfect travel recommendations.
            </p>
          </header>
        
        <main className="max-w-4xl mx-auto">
          <PreferenceForm />
        </main>

      </div>
    </div>
      </AgoraProvider>
  );
}

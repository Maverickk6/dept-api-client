import Image from "next/image";
import globe from "./public/globe.svg";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">
            Streamline Your Organization
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your department management with our intuitive platform designed for modern enterprises.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/register"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg border-2 border-orange-500 hover:bg-orange-50 transition-colors"
            >
              Existing User
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mt-24">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-orange-500 text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold mb-4">Hierarchy Management</h3>
            <p className="text-gray-600">Visualize and manage complex organizational structures with ease</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-orange-500 text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-4">Secure Access</h3>
            <p className="text-gray-600">Role-based access control and enterprise-grade security</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-orange-500 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-4">Real-time Updates</h3>
            <p className="text-gray-600">Instant changes across your organization hierarchy</p>
          </div>
        </div>
      </div>
    </main>
  );
}
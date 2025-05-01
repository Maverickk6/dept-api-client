import Image from 'next/image';
import globe from './public/globe.svg';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">
          Department Management System
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Efficiently manage your organizational structure with our intuitive department management system. Create, organize, and maintain departments and sub-departments with ease.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Departments</h2>
            <p className="text-gray-600 mb-6">Create and manage departments, add sub-departments, and view the complete organizational hierarchy.</p>
            <a
              href="/departments"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Manage Departments
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Account Access</h2>
            <p className="text-gray-600 mb-6">Login to your account to access the department management features and administrative controls.</p>
            <a
              href="/login"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Login
            </a>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <h3 className="font-bold text-orange-500 mb-2">Department Hierarchy</h3>
              <p className="text-gray-600">View and manage your complete organizational structure</p>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-orange-500 mb-2">Easy Management</h3>
              <p className="text-gray-600">Create, update, and delete departments with just a few clicks</p>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-orange-500 mb-2">Sub-departments</h3>
              <p className="text-gray-600">Organize departments with nested sub-departments</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

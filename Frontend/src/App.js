import logo from './logo.svg';
import './App.css';
import Dashboard from './dashboard.js';


function App() {
  return (
    <div class="bg-gray-200 flex flex-col min-h-screen ">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold text-gray-900">
            
          </h1>
          <h1 class="text-3xl font-bold text-gray-900">
            Movie Recommendation
          </h1>
          <p class="text-xl font-bold text-gray-900">
            Select a movie to see similar movies
          </p>
        </div>
      </header>
      <main class="flex-grow">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ">
          <Dashboard />
        </div>
      </main>
      <footer class="items-center text-center">
        <p class="text-sm font-bold mb-1">
          42913 Social and Information Network Analysis Assignment-3 2021 Autumn by Luke and Krijan
        </p>
      </footer>
    </div>
  );
}

export default App;

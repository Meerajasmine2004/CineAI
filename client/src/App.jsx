import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

// Layout
import Navbar from "./components/common/Navbar";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import ComingSoon from "./pages/ComingSoon";
import MyBookings from "./pages/MyBookings";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import ProtectedRoute from "./routes/ProtectedRoute";
import CineAIAssistant from "./components/CineAIAssistant";

// Placeholder pages
const SearchPage = () => (
  <div className="min-h-screen bg-dark-950 pt-24 px-4">
    <h1 className="text-white text-3xl">Search Results - Coming Soon</h1>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen bg-dark-950 text-white">
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#1e293b",
                  color: "#fff",
                  border: "1px solid #334155",
                },
                success: {
                  iconTheme: {
                    primary: "#d63939",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />

            {/* Navbar */}
            <Navbar />

            {/* Routes */}
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/book/:id" element={
                  <ProtectedRoute>
                    <SeatSelection />
                  </ProtectedRoute>
                } />
                <Route path="/coming-soon" element={<ComingSoon />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={<Payment />} />
                <Route path="/search" element={<SearchPage />} />

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-cinema-600 mb-4">
                          404
                        </h1>
                        <p className="text-2xl text-gray-400 mb-8">
                          Page Not Found
                        </p>
                        <a href="/" className="btn-primary">
                          Go Home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
          </div>
        </BookingProvider>
      </AuthProvider>
      
      {/* Chatbot Assistant */}
      <CineAIAssistant />
    </Router>
  );
}

export default App;

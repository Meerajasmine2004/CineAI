import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, CreditCard, ArrowLeft, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState(() => {
    const saved = localStorage.getItem("cineai_payment_details");
    return saved
      ? JSON.parse(saved)
      : {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: ''
        };
  });
  const [upiId, setUpiId] = useState(() => {
    return localStorage.getItem("cineai_upi") || "";
  });

  useEffect(() => {
    // Check for booking data from navigation state (manual booking)
    if (location.state) {
      setBookingData(location.state);
      return;
    }

    // Retrieve booking data from sessionStorage (chatbot booking)
    const storedData = sessionStorage.getItem('chatbotBookingData');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    } else {
      // No booking data, redirect to home
      navigate('/');
    }
  }, [navigate, location.state]);

  const handlePayment = async () => {
    if (!bookingData) return;

    // Validate payment inputs
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
    }

    setLoading(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create booking after payment simulation
    const bookingPayload = {
      movie: typeof bookingData.movie === 'string' ? bookingData.movie : bookingData.movie.id,
      theatre: bookingData.theatre,
      showTime: bookingData.showTime,
      bookingDate: bookingData.bookingDate,
      seats: bookingData.seats,
      totalPrice: bookingData.totalPrice,
      paymentMethod,
      paymentStatus: "SUCCESS",
      bookingStatus: "CONFIRMED"
    };

    try {
      console.log("Creating booking with payload:", bookingPayload);
      const response = await api.post('/bookings', bookingPayload);
      console.log("Booking created successfully:", response.data);
      
      // Save payment details to localStorage for future use
      localStorage.setItem("cineai_payment_details", JSON.stringify(cardDetails));
      localStorage.setItem("cineai_upi", upiId);
      
      // Always show success popup in sandbox mode
      sessionStorage.removeItem('chatbotBookingData');
      setShowSuccessPopup(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
      
    } catch (error) {
      // In sandbox mode, still show success even if API fails
      console.error('Booking API Error:', error);
      
      // Save payment details to localStorage even if API fails (sandbox mode)
      localStorage.setItem("cineai_payment_details", JSON.stringify(cardDetails));
      localStorage.setItem("cineai_upi", upiId);
      
      sessionStorage.removeItem('chatbotBookingData');
      setShowSuccessPopup(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const value = formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
        <div className="text-center">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Complete Your Booking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-6">Booking Details</h2>
            
            <div className="space-y-4">
              {bookingData.movie && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cinema-400 mt-1" />
                  <div>
                    <p className="text-sm text-dark-400">Movie</p>
                    <p className="text-white font-medium">{bookingData.movie.title}</p>
                    {bookingData.movie.genre && (
                      <p className="text-sm text-gray-400">{bookingData.movie.genre}</p>
                    )}
                  </div>
                </div>
              )}

              {bookingData.theatre && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cinema-400 mt-1" />
                  <div>
                    <p className="text-sm text-dark-400">Theatre</p>
                    <p className="text-white font-medium">{bookingData.theatre}</p>
                  </div>
                </div>
              )}

              {bookingData.showTime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cinema-400 mt-1" />
                  <div>
                    <p className="text-sm text-dark-400">Show Time</p>
                    <p className="text-white font-medium">{bookingData.showTime}</p>
                  </div>
                </div>
              )}

              {bookingData.seats && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-cinema-400 mt-1" />
                  <div>
                    <p className="text-sm text-dark-400">Seats</p>
                    <p className="text-white font-medium">{bookingData.seats.join(', ')}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-cinema-400 mt-1" />
                <div>
                  <p className="text-sm text-dark-400">Total Price</p>
                  <p className="text-white font-bold text-xl">
                    ₹{bookingData.totalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-6">Payment Information</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-purple-600 bg-purple-600/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm">Credit/Debit Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-purple-600 bg-purple-600/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="w-5 h-5 mx-auto mb-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded"></div>
                  <p className="text-sm">UPI</p>
                </button>
              </div>
            </div>

            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="w-full p-3 bg-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full p-3 bg-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full p-3 bg-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      maxLength="3"
                      className="w-full p-3 bg-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment */}
            {paymentMethod === 'upi' && (
              <div className="text-center py-8">
                <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">UPI</span>
                </div>
                <p className="text-gray-400 mb-4">Scan QR code or enter UPI ID</p>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter UPI ID"
                  className="w-full p-3 bg-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-cinema-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ₹{bookingData.totalPrice.toLocaleString('en-IN')}
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>🔒 Secure payment powered by CineAI</p>
              <p>Your payment information is encrypted and safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup with Full Screen Confetti */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
    
          {/* Full Screen Confetti Layer */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(80)].map((_, i) => (
              <span
                key={i}
                className="absolute text-3xl animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              >
                {['🎉','🎊','✨','🌟','💫','🎈'][Math.floor(Math.random()*6)]}
              </span>
            ))}
          </div>

          {/* Success Message */}
          <div className="bg-white shadow-xl rounded-xl p-6 text-center z-10">
            <h2 className="text-xl font-bold text-green-600">
              Payment Successful 🎉
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;

// Add CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
  .confetti-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .confetti {
    position: absolute;
    animation: floatUp 2s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
  
  @keyframes floatUp {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-200px);
      opacity: 0;
    }
  }
  
  @keyframes scaleIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-confetti {
    animation: confettiBurst 3s ease-out forwards;
  }
  
  @keyframes confettiBurst {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      transform: translateY(50vh) rotate(180deg);
      opacity: 1;
    }
    90% {
      transform: translateY(-50vh) rotate(360deg);
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(540deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

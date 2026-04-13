import React from 'react';
import { useNavigate } from 'react-router-dom';

function BookingCard({ card }) {
  const navigate = useNavigate();

  // ADD DEBUG LOG (IMPORTANT)
  console.log("CARD DATA:", card.data);

  // Ensure card data exists
  if (!card || !card.data) {
    return null;
  }

  return (
    <div className="bg-[#1e293b] p-5 rounded-xl text-white shadow-lg">
      
      <h3 className="text-lg font-semibold mb-3">📅 Recommended Booking</h3>

      <p><strong>Movie:</strong> {card.data?.movie || "N/A"}</p>

      <p className="mt-2">
        📍 <strong>Theatre:</strong> {card.data?.theatre}
      </p>

      <p className="mt-2">
        ⏰ <strong>Time:</strong> {card.data?.time}
      </p>

      <p className="mt-2">
        👥 <strong>Seats:</strong> {card.data?.seats?.join(", ")}
      </p>

      <p className="mt-2 text-purple-400 font-semibold">
        💰 Total: ₹{(card.data?.total || 0).toLocaleString()}
      </p>

      <button
        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-red-500 py-2 rounded-lg font-semibold"
        onClick={() => navigate("/payment", { state: card.data })}
      >
        💳 Proceed to Payment
      </button>

    </div>
  );
}

export default BookingCard;

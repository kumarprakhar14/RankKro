import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { paymentAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.plan === "PREMIUM") {
      alert("You are already a Premium member!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      // 1. Create order on the server
      const response = await paymentAPI.createOrder(1); // ₹1
      
      const order = (response as any).order;
      if (!order) {
        throw new Error("Failed to create order");
      }

      // 2. Initialize Razorpay options
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "RanKro Premium",
        description: "Unlock all mock tests and analytics",
        order_id: order.id, // The order ID created by Razorpay

        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on the server
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // 4. Handle success properly by instantly updating the local context session
              if (user) {
                setUser({ ...user, plan: "PREMIUM" });
              }
              alert("Payment successful! Welcome to Premium!");
              navigate("/mocks");
            }
          } catch (err: any) {
            alert(`Verification failed: ${err.message}`);
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      // Check if Razorpay is loaded
      if (!(window as any).Razorpay) {
        throw new Error("Payment gateway failed to load. Please refresh and try again.");
      }

      const razorpayInstance = new (window as any).Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response: any){
        alert(`Payment failed: ${response.error.description}`);
      });

      setIsLoading(false)

      razorpayInstance.open();

    } catch (err: any) {
      console.error("Payment setup error", err);
      setError(err.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Unlock your true potential and access all premium mock tests with our standard plan.
        </p>
      </div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center bg-indigo-50/50">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">RanKro Premium</h2>
          <div className="mt-4 flex items-center justify-center">
            <span className="text-5xl font-extrabold text-gray-900">₹1</span>
            <span className="text-xl font-medium text-gray-500 ml-2">/ lifetime</span>
          </div>
        </div>

        <div className="px-8 pt-6 pb-8 bg-white text-left">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            What's included
          </h3>
          <ul className="mt-4 space-y-4">
            {["Unlimited Mock Tests", "Detailed Performance Analytics", "Ad-Free Experience", "Priority Support"].map((feature, i) => (
              <li key={i} className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">{feature}</p>
              </li>
            ))}
          </ul>
          
          {error && (
            <div className="mt-6 p-4 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8">
            {user?.plan === "PREMIUM" ? (
              <div className="w-full flex items-center justify-center px-6 py-4 border-2 border-green-200 rounded-xl bg-green-50 shadow-sm transition-all">
                <Check className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-bold text-green-700">You are Subscribed to this Plan</span>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  "Get Premium Access"
                )}
              </button>
            )}
            <p className="mt-4 text-center text-xs text-gray-500 uppercase tracking-wide font-medium">
              Secured by Razorpay • Instant Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

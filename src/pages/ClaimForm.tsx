import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ClaimFormData {
  orderNumber: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  brand: string;
  problemDescription: string;
}

const ClaimForm: React.FC = () => {
  const [formData, setFormData] = useState<ClaimFormData>({
    orderNumber: '',
    email: '',
    name: '',
    address: '',
    phoneNumber: '',
    brand: '',
    problemDescription: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }
      const newClaim = await response.json();
      navigate('/status', { state: { claimId: newClaim.id } });
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (keep existing form fields) ... */}
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  );
};

export default ClaimForm;
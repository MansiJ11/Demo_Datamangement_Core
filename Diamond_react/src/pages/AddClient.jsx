import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function AddClient() {

    const navigation = useNavigate();

    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setName(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const response = await fetch(`https://diamond-core.onrender.com/api/Product/AddClient`, {
                method: 'POST', // or 'POST' if backend requires
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ClientName: name,
                })
            });

            console.log("response", response);

            const data = await response.text();
            setLoading(false);

            if (response.ok) {
                setSuccess('Product updated successfully!');
                navigation(-1);
            } else {
                setError(data.message || 'Failed to update product.');
            }
        } catch (err) {
            setLoading(false);
            setError('Something went wrong. Please try again.');
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-7xl sm:min-w-md my-8"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Add Client
                </h2>
                {(error || success || loading) && (
                    <div className="mb-6 w-full">
                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 shadow">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2 shadow">
                                {success}
                            </div>
                        )}
                        {loading && (
                            <div className="bg-blue-100 text-btnAdd px-4 py-2 rounded mb-2 shadow">
                                Submitting...
                            </div>
                        )}
                    </div>
                )}
                <div className="grid grid-cols-1  gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter name"
                            required
                            autoComplete='off'
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
                    <button
                        type="submit"
                        className="w-full md:w-1/2 bg-btnAdd hover:bg-opacity-70 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => navigation(-1)}
                        className="w-full md:w-1/2 bg-gray-100 hover:bg-gray-600 text-black hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddClient

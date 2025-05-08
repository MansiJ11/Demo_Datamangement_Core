import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DimandForm = () => {

    const navigation = useNavigate();
    const { state } = useLocation();

    const clientNames = state?.clientNames;

    console.log("clientNames:", clientNames)


    const handleSuggestionClick = (name) => {
        console.log("name:", name)
        setFormData(prev => ({ ...prev, name }));
        setShow(false)

        const suggestions = (clientNames || []).filter(client =>
            client.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredSuggestions(suggestions);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const suggestions = (clientNames || []).filter(client =>
            client.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(suggestions);
    };



    const [formData, setFormData] = useState({
        name: '',
        packageNo: '',
        grams: '',
        product_Price: '',
        end_Date: '',
        start_Date: '',
        pics: '',
        weight: ''
    });

    const [filteredSuggestions, setFilteredSuggestions] = useState(clientNames ? clientNames : []);

    clientNames
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [show, setShow] = useState(false);
    const [checked, setChecked] = useState(0);
    const [id, setId] = useState(null);

    useEffect(() => {
        if (state && state.data) {
            setFormData({
                name: state.data.name,
                packageNo: state.data.packageNo,
                grams: state.data.grams,
                product_Price: state.data.product_Price,
                end_Date: state.data.end_Date,
                start_Date: state.data.start_Date,
                pics: state.data.pics || '',
                weight: state.data.weight || ''
            });
            setId(state.data.id)
            setIsEdit(true);
        }
    }, []);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        console.log('Form Data:', formData);

        e.preventDefault();

        const { name, packageNo, grams, product_Price, start_Date, end_Date, pics, weight } = formData;

        // Basic validation
        if (!name || !packageNo || !grams || !start_Date || !product_Price || !pics || !weight) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        if (Number(grams) <= 0 || Number(product_Price) <= 0 || Number(pics) <= 0 || Number(weight) <= 0) {
            setError('Grams, pics, weight and Product Price must be positive numbers.');
            setLoading(false);
            return;
        }

        // if (new Date(start_Date) > new Date(end_Date)) {
        //     setError('Start Date must be before End Date.');
        //     setLoading(false);
        //     return;
        // }

        console.log('Form Data:', formData);

        if (isEdit) {
            try {
                const response = await fetch(`https://diamond-core.onrender.com/api/Product/EditProduct/${id}`, {
                    method: 'PUT', // or 'POST' if backend requires
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        IsComplete: checked
                    })
                });

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
        else {
            try {
                const response = await fetch('https://diamond-core.onrender.com/api/Product/AddProduct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Name: name,
                        PackageNo: packageNo,
                        Grams: grams,
                        Product_Price: product_Price,
                        Start_Date: start_Date,
                        End_Date: end_Date,
                        Pics: pics,
                        Weight: weight,
                    })
                });

                console.log("response:", response);

                const data = await response.text();
                setLoading(false);

                console.log("data:", data);

                if (response.ok) {
                    setSuccess('Product added successfully!');
                    setFormData({
                        name: '',
                        packageNo: '',
                        grams: '',
                        product_Price: '',
                        end_Date: '',
                        start_Date: ''
                    });
                    navigation(-1);
                } else {
                    setError(data.message || 'Failed to submit form.');
                }
            } catch (err) {
                setLoading(false);
                console.log("error add product:", err);
                setError('Something went wrong. Please try again.');
            }
        }

    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-7xl sm:min-w-md my-8"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    <span role="img" aria-label="diamond">💎</span>{isEdit ? 'Edit' : 'Create'} Diamond Form
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter name"
                            required
                            disabled={isEdit}
                            onFocus={() => setShow(true)}
                        // onBlur={() => setTimeout(() => setShow(false), 100)}

                        />
                        {!isEdit && filteredSuggestions.length > 0 && show && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg max-h-40 overflow-auto">
                                {filteredSuggestions.map((client, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(client)}
                                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                    >
                                        {client}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Package No */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="packageNo">Package No</label>
                        <input
                            type="text"
                            name="packageNo"
                            id="packageNo"
                            value={formData.packageNo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter package no"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* Crt */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="grams">Crt</label>
                        <input
                            type="number"
                            name="grams"
                            id="grams"
                            value={formData.grams}
                            placeholder="Crt"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* Product Price */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="product_Price">Product Price</label>
                        <input
                            type="number"
                            name="product_Price"
                            id="product_Price"
                            value={formData.product_Price}
                            placeholder="Product Price"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* Pics */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="pics">Pics</label>
                        <input
                            type="number"
                            name="pics"
                            id="pics"
                            value={formData.pics}
                            placeholder="Pics"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="weight">Weight</label>
                        <input
                            type="number"
                            name="weight"
                            id="weight"
                            value={formData.weight}
                            placeholder="Weight"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-gray-600 mb-2" htmlFor="start_Date">Issue Date</label>
                        <input
                            type="date"
                            name="start_Date"
                            id="start_Date"
                            value={formData.start_Date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {/* End Date */}
                    {isEdit && formData.end_Date && <div>
                        <label className="block text-gray-600 mb-2" htmlFor="end_Date">Return date</label>
                        <input
                            type="date"
                            name="end_Date"
                            id="end_Date"
                            value={formData.end_Date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>}

                    {isEdit && !formData.end_Date && <div>
                        <label className="block text-gray-600 mb-2" htmlFor="end_Date">Return date</label>
                        <input
                            type="checkbox"
                            name="Return date"
                            id="Return date"
                            checked={checked === 1}
                            onChange={(e) =>{
                                console.log("abb",e.target.checked)
                                let status = e.target.checked ? 1 : 0;
                                setChecked(status)
                            }}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>}

                </div>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
                    <button
                        type="submit"
                        className="w-full md:w-1/2 bg-btnAdd hover:bg-opacity-70 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                    >
                        {isEdit ? 'Edit' : 'Submit'}
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
    );

}

export default DimandForm
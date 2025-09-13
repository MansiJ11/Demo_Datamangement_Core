import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Spinner from '../Components/Spinner'; // adjust the path if needed


const Home = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showData, setShowData] = useState([]);
  const [button, setButton] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(0);
  const [isSearch, setIsSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Can be updated by user
  const [totalItems, setTotalItems] = useState(0); // Set from API
  const [totalPages, setTotalPages] = useState(0); // Set from API
  const [totalPrice, setTotalPrice] = useState(0); // Set from API

  const [clientNames, setClientNames] = useState([]);

  const [startType, setStartType] = useState("text");
  const [endType, setEndType] = useState("text");

  useEffect(() => {
    getPaginationButtons();
  }, [totalItems, pageSize])


  const getPaginationButtons = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
    setTotalPages(totalPages);
    const buttons = [];

    if (currentPage > 1) buttons.push('Prev');

    if (currentPage <= 2) {
      // Beginning
      buttons.push(1);
      if (totalPages > 1) buttons.push(2);
      if (totalPages > 3) buttons.push('...');
      if (totalPages > 2) buttons.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
      // End
      if (totalPages > 3) buttons.push(1);
      if (totalPages > 4) buttons.push('...');
      if (totalPages >= 2) buttons.push(totalPages - 1);
      buttons.push(totalPages);
    } else {
      // Middle
      if (totalPages > 3) buttons.push(1);
      if (currentPage > 3) buttons.push('...');
      buttons.push(currentPage);
      if (currentPage + 1 < totalPages) buttons.push(currentPage + 1);
      if (currentPage + 2 < totalPages) buttons.push('...');
      buttons.push(totalPages);
    }
    setButton(buttons)
    return buttons;
  };

  const handlePageChange = (page) => {
    if (page === 'Prev') {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
    } else if (page === 'Next') {
      const totalPages = Math.ceil(totalItems / pageSize);
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    } else {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchList(currentPage, pageSize, false);
  }, [currentPage, pageSize]);

  useEffect(() => {
    setError(null);
    fetch('https://demo-datamangement-core.onrender.com/api/Product/GetAllClientNames')
      .then((response) => {
        return response.json();
      }).then((data) => {
        console.log("client names:", data);
        setClientNames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch client names');
        setLoading(false);
      });
  }, []);


  const fetchList = async (page, size, download) => {
    setError(null);
    setLoading(true);
    if (!download) {
      setShowData([]);
    }
    const params = new URLSearchParams({
      startDate,
      endDate,
      name,
      status,
      page,
      size,
    });
    try {
      const response = await fetch(`https://demo-datamangement-core.onrender.com/api/Product/GetProducts?${params}`);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      console.log("data:", data);


      if (download) {
        return data.data; // Return data for download
      } else {
        setShowData(data.data);
        setTotalItems(data.totalRecords); // Set total items from API response
        setTotalPrice(data.totalAmount); // Set total price from API response
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  }
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  }
  const handleNameChange = (e) => {
    setName(e.target.value);
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      const response = await fetch(`https://demo-datamangement-core.onrender.com/api/Product/DeleteProduct/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully');
      setCurrentPage(1);
      fetchList(1, pageSize, false); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    } finally {
      setLoading(false);
    }
  };
  const handleReturn = async (id) => {
    if (!window.confirm('Are you sure you wanted to complete the order')) return;

    try {
      setLoading(true);
      const response = await fetch(`https://demo-datamangement-core.onrender.com/api/Product/EditProduct/${id}`, {
        method: 'PUT', // or 'POST' if backend requires
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          IsComplete: 1
        })
      });
      // const data = await response.json();
      console.log("return response", response);
      setLoading(false);

      if (response.ok) {
        fetchList(1, pageSize, false); // Refresh the list after deletion
        // setSuccess('Product Return successfully!');
      } else {
        setError(data.message || 'Failed to update product.');
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }


  const handleDownloadPDF = async () => {

    let data = [] // Fetch data for PDF download


    data = await fetchList(1, totalItems, true); // Fetch data for PDF download


    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    const title = "Diamond";
    const totalPriceText = `Total Amount: ${totalPrice}`;

    // Center the title
    doc.setFontSize(14);
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 10); // Centered horizontally

    // Total Price - right aligned on next row
    doc.setFontSize(12);
    const priceTextWidth = doc.getTextWidth(totalPriceText);
    doc.text(totalPriceText, pageWidth - priceTextWidth - 25, 18); // Right aligned

    // Table
    const columns = [
      "Issue Date",
      "Name",
      "Package No",
      "Pieces",
      "Crt",
      "Product Price",
      "Total Price",
      "Return date"
    ];

    const rows = data.map((item, index) => [
      item.start_Date,
      item.name,
      item.packageNo,
      item.pics,
      item.grams,
      item.product_Price,
      item.totalPrice,
      item.end_Date
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      styles: { fontSize: 8 },
    });

    doc.save('Diamond.pdf');
  };


  const handleDownloadExcel = async () => {

    let data = [] // Fetch data for PDF download

    data = await fetchList(1, totalItems, true); // Fetch data for PDF download


    const workbook = XLSX.utils.book_new();

    // Create data rows
    const dataRows = data.map((item, index) => ({
      IssueDate: item.start_Date,
      Name: item.name,
      PackageNo: item.packageNo,
      Pieces: Number(item.pics),
      Crt: Number(item.grams),
      ProductPrice: Number(item.product_Price),
      TotalPrice: Number(item.totalPrice),
      ReturnDate: item.end_Date
    }));

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(dataRows, { origin: "A3" });

    // Add title and total price manually
    XLSX.utils.sheet_add_aoa(worksheet, [["Diamond"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [[`Total Amount: ${totalPrice}`]], { origin: "F2" }); // Adjust column F or G if needed

    // Merge cells for title row (A1 to H1)
    if (!worksheet["!merges"]) worksheet["!merges"] = [];
    worksheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }); // Merge A1:H1

    XLSX.utils.book_append_sheet(workbook, worksheet, "Diamond");

    XLSX.writeFile(workbook, "Diamond.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <span role="img" aria-label="diamond">💎</span> Diamond
      </h1>
      <div className="flex flex-row  items-center justify-between mb-4">
        <button className="bg-white text-black rounded px-6 py-2 mb-4 hover:bg-gray-100 text-center shadow-xl" onClick={() => navigate('/Addclient')}>
          <span role="img" aria-label="add" className="text-white">➕</span>
          Add New Client
        </button>

        <button className="bg-white text-black rounded px-6 py-2 mb-4 hover:bg-gray-100 text-center shadow-xl" onClick={() => navigate('/DimandForm', { state: { clientNames: clientNames } })}>
          <span role="img" aria-label="add" className="text-white">➕</span>
          Add New Diamond
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">

        <input
          type={startType}
          value={startDate}
          onFocus={() => setStartType("date")}
          onBlur={() => startDate === "" && setStartType("text")}
          placeholder="Issue Date"
          className="border rounded px-4 py-2 w-full"
          onChange={handleStartDateChange}
        />
        <input
          type={endType}
          value={endDate}
          onFocus={() => setEndType("date")}
          onBlur={() => endDate === "" && setEndType("text")}
          className="border rounded px-4 py-2 w-full"
          placeholder="Return date"
          onChange={handleEndDateChange}
        />
        <input
          type='text'
          value={name}
          onChange={handleNameChange}
          className="border rounded px-4 py-2 w-full"
          placeholder="Name"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="0">All</option>
          <option value="1">Pending</option>
          <option value="2">Complete</option>
        </select>
        <button className="bg-white text-black rounded px-4 py-2 w-full shadow-lg hover:bg-gray-100" onClick={() => { fetchList(1, pageSize, false); setIsSearch(true); setCurrentPage(1); }}>
          <span role="img" aria-label="search">🔍</span>
          Search
        </button>
        <button
          className="bg-red-500 text-white rounded px-4 py-2 w-full shadow-lg hover:bg-red-600"
          onClick={() => {
            setName('');
            setStartDate('');
            setEndDate('');
            setStatus(0);
            setIsSearch(false);
            setCurrentPage(1);
            setPageSize(10);
            fetchList(1, pageSize, false);
          }}
        >
          Reset
        </button>
      </div>


      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Package No</th>
              <th className="px-4 py-3">Pieces</th>
              <th className="px-4 py-3">Crt</th>
              <th className="px-4 py-3">Product Price</th>
              <th className="px-4 py-3">Total Price</th>
              <th className="px-4 py-3">Return date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              !loading && showData.length === 0 && <tr><td colSpan="9" className="text-center p-4">No data found</td></tr>
            }
            {showData && showData.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{Number((currentPage - 1) * 10) + Number(idx + 1)}</td>
                <td className="px-4 py-2">{item.start_Date}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.packageNo}</td>
                <td className="px-4 py-2">{item.pics}</td>
                <td className="px-4 py-2">{item.grams}</td>
                <td className="px-4 py-2">{item.product_Price}</td>
                <td className="px-4 py-2">{item.totalPrice}</td>
                <td className="px-4 py-2">{item.end_Date}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="bg-btnAdd text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => {
                    console.log("client names:", clientNames);
                    handleReturn(item.id)
                  }}>
                    Return
                  </button>
                  <button className="bg-delete text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => { handleDelete(item.id) }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="flex items-center justify-center h-full my-5">
            <Spinner />
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {button.map((btn, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded text-sm font-medium ${btn === currentPage
              ? 'bg-btnAdd text-white'
              : 'bg-gray-300 hover:bg-gray-400'
              }`}
            onClick={() => handlePageChange(btn)}
            disabled={btn === '...' || btn === currentPage}
          >
            {btn}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          className="bg-btnAdd text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </button>
        <button
          className="bg-btnAdd text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
          onClick={handleDownloadExcel}
        >
          Download Excel
        </button>
      </div>
    </div>
  );

}

export default Home

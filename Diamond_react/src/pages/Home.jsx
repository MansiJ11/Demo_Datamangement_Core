import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Spinner from '../Components/Spinner'; // adjust the path if needed


const Home = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [showData, setShowData] = useState([]);
  const [button, setButton] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [name, setName] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Can be updated by user
  const [totalItems, setTotalItems] = useState(0); // Set from API
  const [totalPages, setTotalPages] = useState(0); // Set from API
  const [totalPrice, setTotalPrice] = useState(0); // Set from API

  useEffect(() => {
    getPaginationButtons();
  },[totalItems, pageSize])


  const getPaginationButtons = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
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


  const fetchList = async (page , size, download ) => {
    setLoading(true);
    try {
      const response = await fetch(`https://diamond-core.onrender.com/api/Product/GetAll?page=${page}&size=${size}`);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      console.log("data:", data);
      

      if(download){
        setData(data.data);
        return data.data; // Return data for download
      } else{
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
      const response = await fetch(`https://diamond-core.onrender.com/api/Product/DeleteProduct/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully');
      fetchList();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      // Construct search URL with query params
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        name
      }).toString();

      const response = await fetch(`https://diamond-core.onrender.com/api/Product/Search?${queryParams}`);

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      console.log("search data:", data);
      setData(data); // Update table with searched data
      setShowData(data); // Update table with searched data
      setTotalItems(10)
    } catch (error) {
      console.error('Error fetching search results:', error);
      alert('Error searching products');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {

    const data = await fetchList(currentPage, totalItems, true); // Fetch data for PDF download

    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
  
    const title = "Dimand List";
    const totalPriceText = `Total Price: ${totalPrice}`;
  
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
      "SN.",
      "Name",
      "Package No",
      "Crt",
      "Product Price",
      "Total Price",
      "Start Date",
      "End Date"
    ];
  
    const rows = data.map((item, index) => [
      index + 1,
      item.name,
      item.packageNo,
      item.grams,
      item.product_Price,
      item.totalPrice,
      item.start_Date,
      item.end_Date
    ]);
  
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      styles: { fontSize: 8 },
    });
  
    doc.save('dimand-list.pdf');
  };
  

  const handleDownloadExcel = async () => {

    const data = await fetchList(currentPage, totalItems, true); // Fetch data for PDF download

    const workbook = XLSX.utils.book_new();
  
    // Create data rows
    const dataRows = data.map((item, index) => ({
      SN: index + 1,
      Name: item.name,
      PackageNo: item.packageNo,
      Crt: item.grams,
      ProductPrice: item.product_Price,
      TotalPrice: item.totalPrice,
      StartDate: item.start_Date,
      EndDate: item.end_Date
    }));
  
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(dataRows, { origin: "A3" });
  
    // Add title and total price manually
    XLSX.utils.sheet_add_aoa(worksheet, [["Dimand List"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [[`Total Price: ${totalPrice}`]], { origin: "F2" }); // Adjust column F or G if needed
  
    // Merge cells for title row (A1 to H1)
    if (!worksheet["!merges"]) worksheet["!merges"] = [];
    worksheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }); // Merge A1:H1
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dimand");
  
    XLSX.writeFile(workbook, "dimand-list.xlsx");
  };
  


  return (
    <div className='h-full flex flex-col items-center justify-center bg-gray-100 py-10'>
      <h1 className='text-4xl font-bold mb-10'>Welcome to the Home Page</h1>
      <Link to='/DimandForm' className='bg-btnAdd text-white px-4 py-2 rounded mb-4 w-2/3 text-center'>
        Add New Product
      </Link>
      <div className='flex flex-row items-center justify-between mb-4 gap-2 w-2/3'>
        <div className='flex flex-row items-center justify-between gap-5'>
          <div className='flex flex-row items-center justify-center gap-2 mt-4'>
            <label className='text-lg font-semibold'>Start Date :</label>
            <input type="date" value={startDate} placeholder="Enter date" className='border border-gray-300 p-2 rounded' onChange={handleStartDateChange} />
          </div>
          <div className='flex flex-row items-center justify-center gap-2 mt-4'>
            <label className='text-lg font-semibold'>End Date :</label>
            <input type="date" value={endDate} placeholder="Enter date" className='border border-gray-300 p-2 rounded' onChange={handleEndDateChange} />
          </div>
        </div>
        <div className='flex flex-row items-center justify-between gap-2'>
          <div className='flex flex-row items-center justify-center gap-2 mt-4'>
            <label className='text-lg font-semibold'>Name :</label>
            <input type="text" value={name} placeholder="Enter name" className='border border-gray-300 p-2 rounded' onChange={handleNameChange} />
          </div>
          <button className='bg-btnAdd text-white px-4 py-2 rounded mt-4' onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div className="overflow-x-auto w-2/3 ">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className='bg-[#adb5bd]'>
              <th className="border border-gray-300 p-2">SN.</th>
              <th className="border border-gray-300 p-2">name</th>
              <th className="border border-gray-300 p-2">packageNo</th>
              <th className="border border-gray-300 p-2">Crt</th>
              <th className="border border-gray-300 p-2">product_Price</th>
              <th className="border border-gray-300 p-2">totalPrice</th>
              <th className="border border-gray-300 p-2">start_Date</th>
              <th className="border border-gray-300 p-2">end_Date</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>

          <tbody>

            {
              !loading && data.length === 0 && <tr><td colSpan="9" className="text-center p-4">No data found</td></tr>
            }
            {
              showData && showData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">{item.packageNo}</td>
                  <td className="border border-gray-300 p-2">{item.grams}</td>
                  <td className="border border-gray-300 p-2">{item.product_Price}</td>
                  <td className="border border-gray-300 p-2">{item.totalPrice}</td>
                  <td className="border border-gray-300 p-2">{item.start_Date}</td>
                  <td className="border border-gray-300 p-2">{item.end_Date}</td>
                  <td className="border border-gray-300 p-2">
                    <button className='bg-btnAdd text-white px-4 py-2 rounded'
                      onClick={() => navigate('/DimandForm', { state: { data: item } })}>Edit</button>
                    <button className='bg-delete text-white px-4 py-2 rounded ml-2' onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            }

          </tbody>

        </table>

        <div className="flex gap-2 mt-6 items-center flex-wrap">
          {button.map((btn, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${btn === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400'
                }`}
              onClick={() => handlePageChange(btn)}
              disabled={btn === '...' || btn === currentPage}
            >
              {btn}
            </button>
          ))}
        </div>
        {loading && <div className="flex items-center justify-center h-full my-5">
          <Spinner />
        </div>}
      </div>
      <div className='flex flex-row justify-between gap-5'>
        <button className='bg-btnAdd text-white px-4 py-2 rounded mt-4' onClick={handleDownloadPDF}>Download PDF</button>
        <button className='bg-btnAdd text-white px-4 py-2 rounded mt-4' onClick={handleDownloadExcel}>Download Excel</button>
      </div>
    </div>
  )
}

export default Home

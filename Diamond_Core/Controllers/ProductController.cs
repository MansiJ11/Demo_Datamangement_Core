using System.Text;
using Microsoft.AspNetCore.Mvc;
using RadheDaimond.Helper;
using RadheDaimond.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
 // product
namespace Diamond_Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductHelper _productHelper;

        public ProductController(IConfiguration configuration)
        {
            _productHelper = new ProductHelper(configuration);
        }

        [HttpGet("GetAll")]
        public IActionResult Get([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            int totalRecords;
            string totalAmount;
            var products = _productHelper.GetAllProducts(page, size, out totalRecords, out totalAmount);

            return Ok(new
            {
                TotalRecords = totalRecords,
                Page = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling((double)totalRecords / size),
                TotalAmount = totalAmount,
                Data = products
            });
        }



        [HttpGet("GetOne/{id}")]
        public ActionResult<Product> GetOne(int id)
        {
            var res = _productHelper.GetOneProducts(id);
            return Ok(res);
        }

        [HttpPost("AddProduct")]
        public IActionResult Post([FromBody] AddProductRequest value)
        {
            if (value == null)
                return BadRequest("Product data is null.");

            bool isInserted = _productHelper.InsertProduct(value);

            return isInserted ? Ok("Product inserted successfully.") : StatusCode(500);
        }

        [HttpPut("EditProduct/{id}")]
        public IActionResult Put(int id, [FromBody] EditProductRequest value)
        {
            if (value == null)
                return BadRequest("Product request is null.");

            bool isUpdated = _productHelper.UpdateProduct(value, id);

            return isUpdated ? Ok("Product updated successfully.") : StatusCode(500);
        }

        [HttpDelete("DeleteProduct/{id}")]
        public IActionResult Delete(int id)
        {
            bool isDeleted = _productHelper.DeleteProduct(id);

            return isDeleted ? Ok("Product Deleted successfully.") : StatusCode(500);
        }


        [HttpGet("GetProducts")]
        public IActionResult GetProducts(
     string? startDate = null,
     string? endDate = null,
     string? name = null,
     int? status = null,  // Nullable status: 0 = all, 1 = pending, 2 = completed, null = all data
     int page = 1,
     int size = 10)
        {
            ProductSearchResult result = _productHelper.GetSearchProducts(
                startDate, endDate, name, status, page, size, ignorePagination: false);

            int totalRecords = result.TotalRecords;
            int totalPages = (int)Math.Ceiling((double)totalRecords / size);

            return Ok(new
            {
                TotalRecords = totalRecords,
                Page = page,
                PageSize = size,
                TotalPages = totalPages,
                TotalAmount = result.TotalAmount,
                Data = result.Products
            });
        }

        [HttpPost("AddClient")]
        public IActionResult AddClient([FromBody] AddClient value)
        {
            if (value == null)
                return BadRequest("please add client name.");

            bool isInserted = _productHelper.InsertClient(value);

            return isInserted ? Ok("Product inserted successfully.") : StatusCode(500);
        }


        [HttpGet("GetAllClientNames")]
        public IActionResult GetAllClientNames()
        {
            List<string> names = _productHelper.GetAllClientNames();
            return Ok(names);
        }




    }




}

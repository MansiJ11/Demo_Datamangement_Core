using Microsoft.AspNetCore.Mvc;
using RadheDaimond.Helper;
using RadheDaimond.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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
        public ActionResult<IEnumerable<Product>> Get()
        {
            var res = _productHelper.GetAllProducts();
            return Ok(res);
        }

        [HttpGet("GetOne/{id}")]
        public ActionResult<Product> GetOne(int id)
        {
            var res = _productHelper.GetOneProducts(id);
            return Ok(res);
        }

        [HttpPost("AddProduct")]
        public IActionResult Post([FromBody] Product value)
        {
            if (value == null)
                return BadRequest("Product data is null.");

            bool isInserted = _productHelper.InsertProduct(value);

            return isInserted ? Ok("Product inserted successfully.") : StatusCode(500);
        }

        [HttpPut("EditProduct/{id}")]
        public IActionResult Put(int id, [FromBody] Product value)
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

        [HttpGet("SearchByName")]
        public IActionResult SearchByName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Name parameter is required.");

            var result = _productHelper.SearchProductsByName(name);

            return result.Any() ? Ok(result) : NotFound();
        }

        [HttpGet("SearchByDate")]
        public IActionResult SearchByDate(string startDate, string endDate)
        {
            if (string.IsNullOrWhiteSpace(startDate) || string.IsNullOrWhiteSpace(endDate))
                return BadRequest("Start date and end date are required.");

            var result = _productHelper.SearchProductsByDateRange(startDate, endDate);

            return result.Any() ? Ok(result) : NotFound();
        }

        [HttpGet("Search")]
        public IActionResult Search(string? startDate = null, string? endDate = null, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            var result = _productHelper.SearchProducts(startDate, endDate, name, pageNumber, pageSize);

            return result.Any() ? Ok(result) : NotFound();
        }
    }
}

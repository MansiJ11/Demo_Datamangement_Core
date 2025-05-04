using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace RadheDaimond.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PackageNo { get; set; }
        public string Grams { get; set; }
        public string Start_Date { get; set; }
        public string End_Date { get; set; }
        public string Product_Price { get; set; }
        public string TotalPrice { get; set; }
        public string TotalAmount { get; set; }
    }

    public class AddProductRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string PackageNo { get; set; }

        [Required]
        public string Grams { get; set; }

        [Required]
        public string Start_Date { get; set; }
    }

    public class EditProductRequest
    {
        [Required]
        public string End_Date { get; set; }

        [Required]
        public string Product_Price { get; set; }


    }

    public class Pagination
    {
        [Required]
        public int Page { get; set; }

        [Required]
        public int Size { get; set; }
    }

    public class ProductSearchResult
    {
        public List<Product> Products { get; set; }
        public string TotalAmount { get; set; }
        public int TotalRecords { get; set; }
    }

}
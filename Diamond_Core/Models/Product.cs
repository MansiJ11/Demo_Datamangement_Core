using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace RadheDaimond.Models
{
    public class Product
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string PackageNo { get; set; }
        [Required]
        public string Grams { get; set; }
        [Required]
        public string Start_Date { get; set; }

        public string End_Date { get; set; }
        public string Product_Price { get; set; }
        public string TotalPrice { get; set; }
        public string TotalAmount { get; set; }
    }
}
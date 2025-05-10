using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using MySql.Data.MySqlClient;
using RadheDaimond.Models;

namespace RadheDaimond.Helper
{
    public class ProductHelper
    {
        private readonly string connStr;

        public ProductHelper(IConfiguration configuration)
        {
            connStr = configuration.GetConnectionString("MySqlConnection");
        }


        private string CalculateTotalPrice(string gramsStr, string priceStr)
        {
            if (decimal.TryParse(gramsStr, out decimal grams) && decimal.TryParse(priceStr, out decimal price))
            {
                decimal total = grams * price;
                return total.ToString("0.00"); // Format as needed
            }

            return "0.00"; // fallback if data is not valid
        }


        public List<Product> GetAllProducts(int pageNumber, int pageSize, out int totalRecords, out string totalAmount)
        {
            List<Product> products = new List<Product>();
            totalRecords = 0;
            decimal total = 0;
            decimal Amount = 0;

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();

                // Count total records
                using (MySqlCommand countCmd = new MySqlCommand("SELECT COUNT(*) FROM product", conn))
                {
                    totalRecords = Convert.ToInt32(countCmd.ExecuteScalar());
                }

                int offset = (pageNumber - 1) * pageSize;
                string query = "SELECT * FROM product ORDER BY Id DESC LIMIT @Limit OFFSET @Offset";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Limit", pageSize);
                    cmd.Parameters.AddWithValue("@Offset", offset);

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string gramsStr = reader["Grams"]?.ToString();
                            string priceStr = reader["Product_Price"]?.ToString();
                            string totalPrice = CalculateTotalPrice(gramsStr, priceStr);

                            decimal parsedTotal = 0;
                            decimal.TryParse(totalPrice, out parsedTotal);
                            total += parsedTotal;
                            if (decimal.TryParse(totalPrice, out var tp))
                                Amount += tp;

                            var product = new Product
                            {
                                Id = reader.GetInt32("Id"),
                                Name = reader.GetString("Name"),
                                PackageNo = reader.GetString("PackageNo"),
                                Grams = gramsStr,
                                Start_Date = reader.GetString("Start_Date"),
                                End_Date = reader["End_Date"]?.ToString(),
                                Product_Price = priceStr,
                                TotalPrice = totalPrice,
                                pics = reader.GetString("Pics")
                            };

                            products.Add(product);
                        }
                    }
                }
            }

            totalAmount = Amount.ToString("0.00"); // e.g., "15000.50"
            return products;
        }



        public Product GetOneProducts(int Id)
        {
            Product product = null;
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = "SELECT * FROM product WHERE Id = @Id"; // Adjust your query to your table structure

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", Id);
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                             product = new Product
                            {
                                Id = reader.GetInt32("Id"),
                                Name = reader.GetString("Name"),
                                PackageNo = reader.GetString("PackageNo"),
                                Grams = reader.GetString("Grams"),
                                Start_Date = reader.GetString("Start_Date"),
                                End_Date = reader["End_Date"]?.ToString(),
                                Product_Price = reader["Product_Price"]?.ToString(),
                            };

                        }
                    }
                }
            }
            return product;

        }


        public bool InsertProduct(AddProductRequest product)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"INSERT INTO product (Name, PackageNo, Grams, Start_Date,Product_Price,Pics) 
                         VALUES (@Name, @PackageNo, @Grams, @Start_Date,@Product_Price,@Pics)";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", product.Name);
                    cmd.Parameters.AddWithValue("@PackageNo", product.PackageNo);
                    cmd.Parameters.AddWithValue("@Grams", product.Grams);
                    cmd.Parameters.AddWithValue("@Start_Date", product.Start_Date);
                    cmd.Parameters.AddWithValue("@Product_Price", product.Product_Price);
                    cmd.Parameters.AddWithValue("@Pics", product.Pics);


                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }


        public bool UpdateProduct(EditProductRequest product,int id)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();

                string? endDateValue = product.IsComplete == 1 ? DateTime.Now.ToString("yyyy-MM-dd"): null;

                string query = @"UPDATE product 
                         SET End_Date = @End_Date WHERE Id = @Id";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@End_Date", (object?)endDateValue ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Id", id);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }

        public bool DeleteProduct(int id)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"Delete From product 
                         WHERE Id = @Id";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", id);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }

        public List<Product> SearchProductsByName(string name)
        {
            List<Product> products = new List<Product>();

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = "SELECT * FROM product WHERE Name LIKE @Name";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", "%" + name + "%");
                    
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            products.Add(new Product
                            {
                                Id = reader.GetInt32("Id"),
                                Name = reader.GetString("Name"),
                                PackageNo = reader.GetString("PackageNo"),
                                Grams = reader.GetString("Grams"),
                                Start_Date = reader.GetString("Start_Date"),
                                End_Date = reader["End_Date"]?.ToString(),
                                Product_Price = reader["Product_Price"]?.ToString(),
                            });
                        }
                    }
                }
            }

            return products;
        }


        public List<Product> SearchProductsByDateRange(string startDate, string endDate)
        {
            List<Product> products = new List<Product>();

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"SELECT * FROM product 
                         WHERE Start_Date >= @StartDate AND End_Date <= @EndDate";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@StartDate", startDate);
                    cmd.Parameters.AddWithValue("@EndDate", endDate);

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            products.Add(new Product
                            {
                                Id = reader.GetInt32("Id"),
                                Name = reader.GetString("Name"),
                                PackageNo = reader.GetString("PackageNo"),
                                Grams = reader.GetString("Grams"),
                                Start_Date = reader.GetString("Start_Date"),
                                End_Date = reader["End_Date"]?.ToString(),
                                Product_Price = reader["Product_Price"]?.ToString(),
                            });
                        }
                    }
                }
            }

            return products;
        }


        //public ProductSearchResult SearchProducts(string startDate, string endDate, string name, int pageNumber, int pageSize, bool ignorePagination = false)
        //{
        //    List<Product> products = new List<Product>();
        //    decimal totalAmount = 0;

        //    using (MySqlConnection conn = new MySqlConnection(connStr))
        //    {
        //        conn.Open();

        //        List<string> conditions = new List<string>();
        //        if (!string.IsNullOrWhiteSpace(startDate)) conditions.Add("Start_Date >= @StartDate");
        //        if (!string.IsNullOrWhiteSpace(endDate)) conditions.Add("End_Date <= @EndDate");
        //        if (!string.IsNullOrWhiteSpace(name)) conditions.Add("Name LIKE @Name");

        //        string whereClause = conditions.Any() ? "WHERE " + string.Join(" AND ", conditions) : "";
        //        string query = $"SELECT * FROM product {whereClause}";

        //        if (!ignorePagination)
        //        {
        //            query += " ORDER BY Id DESC LIMIT @PageSize OFFSET @Offset";
        //        }

        //        using (MySqlCommand cmd = new MySqlCommand(query, conn))
        //        {
        //            if (!string.IsNullOrWhiteSpace(startDate))
        //                cmd.Parameters.AddWithValue("@StartDate", startDate);
        //            if (!string.IsNullOrWhiteSpace(endDate))
        //                cmd.Parameters.AddWithValue("@EndDate", endDate);
        //            if (!string.IsNullOrWhiteSpace(name))
        //                cmd.Parameters.AddWithValue("@Name", "%" + name + "%");

        //            if (!ignorePagination)
        //            {
        //                int offset = (pageNumber - 1) * pageSize;
        //                cmd.Parameters.AddWithValue("@PageSize", pageSize);
        //                cmd.Parameters.AddWithValue("@Offset", offset);
        //            }

        //            using (MySqlDataReader reader = cmd.ExecuteReader())
        //            {
        //                while (reader.Read())
        //                {
        //                    string gramsStr = reader["Grams"]?.ToString();
        //                    string priceStr = reader["Product_Price"]?.ToString();
        //                    string totalPrice = CalculateTotalPrice(gramsStr, priceStr);

        //                    if (decimal.TryParse(totalPrice, out var tp))
        //                        totalAmount += tp;

        //                    products.Add(new Product
        //                    {
        //                        Id = reader.GetInt32("Id"),
        //                        Name = reader.GetString("Name"),
        //                        PackageNo = reader.GetString("PackageNo"),
        //                        Grams = gramsStr,
        //                        Start_Date = reader.GetString("Start_Date"),
        //                        End_Date = reader["End_Date"]?.ToString(),
        //                        Product_Price = priceStr,
        //                        TotalPrice = totalPrice,
        //                        pics = reader.GetString("Pics")
        //                    });
        //                }
        //            }
        //        }
        //    }

        //    return new ProductSearchResult
        //    {
        //        Products = products,
        //        TotalAmount = totalAmount.ToString("0.00")
        //    };
        //}


        public string GenerateCsv(List<Product> products, string totalAmount)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Id,Name,PackageNo,Grams,Start_Date,End_Date,Product_Price,TotalPrice");

            foreach (var p in products)
            {
                csv.AppendLine($"{p.Id},{p.Name},{p.PackageNo},{p.Grams},{p.Start_Date},{p.End_Date},{p.Product_Price},{p.TotalPrice}");
            }

            csv.AppendLine();
            csv.AppendLine($"Total Amount,,,,,,, {totalAmount}");

            return csv.ToString();
        }

        public byte[] GeneratePdf(List<Product> products, string totalAmount)
        {
            // Placeholder: Implement this using QuestPDF or any other PDF library
            var dummyPdfContent = Encoding.UTF8.GetBytes("PDF generation not implemented.");
            return dummyPdfContent;
        }


        public ProductSearchResult GetSearchProducts(string startDate, string endDate, string name, int? status, int pageNumber, int pageSize, bool ignorePagination = false)
        {
            List<Product> products = new List<Product>();
            decimal totalAmount = 0;
            int totalRecords = 0;

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();

                // Build WHERE conditions
                List<string> conditions = new List<string>();
                if (!string.IsNullOrWhiteSpace(startDate)) conditions.Add("Start_Date >= @StartDate");
                if (!string.IsNullOrWhiteSpace(endDate)) conditions.Add("End_Date <= @EndDate");
                if (!string.IsNullOrWhiteSpace(name)) conditions.Add("Name LIKE @Name");

                if (status == 1)
                    conditions.Add("End_Date IS NULL"); // Pending
                else if (status == 2)
                    conditions.Add("End_Date IS NOT NULL"); // Completed

                string whereClause = conditions.Any() ? "WHERE " + string.Join(" AND ", conditions) : "";

                // Get total count
                string countQuery = $"SELECT COUNT(*) FROM product {whereClause}";
                using (MySqlCommand countCmd = new MySqlCommand(countQuery, conn))
                {
                    if (!string.IsNullOrWhiteSpace(startDate)) countCmd.Parameters.AddWithValue("@StartDate", startDate);
                    if (!string.IsNullOrWhiteSpace(endDate)) countCmd.Parameters.AddWithValue("@EndDate", endDate);
                    if (!string.IsNullOrWhiteSpace(name)) countCmd.Parameters.AddWithValue("@Name", "%" + name + "%");

                    totalRecords = Convert.ToInt32(countCmd.ExecuteScalar());
                }

                // Fetch paginated data
                int offset = (pageNumber - 1) * pageSize;
                string query = $"SELECT * FROM product {whereClause}";

                if (!ignorePagination)
                    query += " ORDER BY Id DESC LIMIT @PageSize OFFSET @Offset";
                else
                    query += " ORDER BY Id DESC";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    if (!string.IsNullOrWhiteSpace(startDate)) cmd.Parameters.AddWithValue("@StartDate", startDate);
                    if (!string.IsNullOrWhiteSpace(endDate)) cmd.Parameters.AddWithValue("@EndDate", endDate);
                    if (!string.IsNullOrWhiteSpace(name)) cmd.Parameters.AddWithValue("@Name", "%" + name + "%");

                    if (!ignorePagination)
                    {
                        cmd.Parameters.AddWithValue("@PageSize", pageSize);
                        cmd.Parameters.AddWithValue("@Offset", offset);
                    }

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string gramsStr = reader["Grams"]?.ToString();
                            string priceStr = reader["Product_Price"]?.ToString();
                            string totalPrice = CalculateTotalPrice(gramsStr, priceStr);

                            if (decimal.TryParse(totalPrice, out var tp))
                                totalAmount += tp;

                            string endDateValue = reader["End_Date"]?.ToString();
                            string statusStr = string.IsNullOrEmpty(endDateValue) ? "Pending" : "Completed";

                            products.Add(new Product
                            {
                                Id = reader.GetInt32("Id"),
                                Name = reader.GetString("Name"),
                                PackageNo = reader.GetString("PackageNo"),
                                Grams = gramsStr,
                                Start_Date = reader.GetString("Start_Date"),
                                End_Date = endDateValue,
                                Product_Price = priceStr,
                                TotalPrice = totalPrice,
                                pics = reader["Pics"]?.ToString()
                            });
                        }
                    }
                }
            }

            return new ProductSearchResult
            {
                Products = products,
                TotalAmount = totalAmount.ToString("0.00"),
                TotalRecords = totalRecords
            };
        }


        public bool InsertClient(AddClient value)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"INSERT INTO client (ClientName) 
                         VALUES (@ClientName)";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@ClientName", value.ClientName);

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        public List<string> GetAllClientNames()
        {
            List<string> clientNames = new List<string>();

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = "SELECT * FROM client";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        clientNames.Add(reader.GetString("ClientName"));
                    }
                }
            }

            return clientNames;
        }




    }
}
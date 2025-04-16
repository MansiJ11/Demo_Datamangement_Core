using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
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


        public List<Product> GetAllProducts()
        {
            List<Product> products = new List<Product>();

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = "SELECT * FROM product"; // Adjust your query to your table structure

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string gramsStr = reader["Grams"]?.ToString();
                        string priceStr = reader["Product_Price"]?.ToString();

                        // Calculate total price
                        string totalPrice = CalculateTotalPrice(gramsStr, priceStr);
                        var product = new Product
                        {
                            Id = reader.GetInt32("Id"),
                            Name = reader.GetString("Name"),
                            PackageNo = reader.GetString("PackageNo"),
                            Grams = gramsStr,
                            Start_Date = reader.GetString("Start_Date"),
                            End_Date = reader["End_Date"]?.ToString(),
                            Product_Price = priceStr,
                            TotalPrice = totalPrice
                        };
                        products.Add(product);
                    }
                }
            }

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


        public bool InsertProduct(Product product)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"INSERT INTO product (Name, PackageNo, Grams, Start_Date) 
                         VALUES (@Name, @PackageNo, @Grams, @Start_Date)";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", product.Name);
                    cmd.Parameters.AddWithValue("@PackageNo", product.PackageNo);
                    cmd.Parameters.AddWithValue("@Grams", product.Grams);
                    cmd.Parameters.AddWithValue("@Start_Date", product.Start_Date);

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }


        public bool UpdateProduct(Product product,int id)
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();
                string query = @"UPDATE product 
                         SET End_Date = @End_Date, 
                             Product_Price = @Product_Price 
                         WHERE Id = @Id";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@End_Date", product.End_Date);
                    cmd.Parameters.AddWithValue("@Product_Price", product.Product_Price);
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

        public List<Product> SearchProducts(string startDate, string endDate, string name, int pageNumber, int pageSize)
        {
            List<Product> products = new List<Product>();

            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();

                List<string> conditions = new List<string>();
                if (!string.IsNullOrWhiteSpace(startDate)) conditions.Add("Start_Date >= @StartDate");
                if (!string.IsNullOrWhiteSpace(endDate)) conditions.Add("End_Date <= @EndDate");
                if (!string.IsNullOrWhiteSpace(name)) conditions.Add("Name LIKE @Name");

                string whereClause = conditions.Any() ? "WHERE " + string.Join(" AND ", conditions) : "";

                int offset = (pageNumber - 1) * pageSize;
                string query = $@"
            SELECT * FROM product 
            {whereClause}
            LIMIT @PageSize OFFSET @Offset";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    if (!string.IsNullOrWhiteSpace(startDate))
                        cmd.Parameters.AddWithValue("@StartDate", startDate);
                    if (!string.IsNullOrWhiteSpace(endDate))
                        cmd.Parameters.AddWithValue("@EndDate", endDate);
                    if (!string.IsNullOrWhiteSpace(name))
                        cmd.Parameters.AddWithValue("@Name", "%" + name + "%");

                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    cmd.Parameters.AddWithValue("@Offset", offset);

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

    }
}
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasicCommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase4And5Constraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_product_price",
                table: "products",
                sql: "\"Price\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_product_stock",
                table: "products",
                sql: "\"StockQuantity\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_orders_CreatedAt",
                table: "orders",
                column: "CreatedAt");

            migrationBuilder.AddCheckConstraint(
                name: "ck_order_total",
                table: "orders",
                sql: "\"TotalAmount\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_order_item_linetotal",
                table: "order_items",
                sql: "\"LineTotal\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_order_item_quantity",
                table: "order_items",
                sql: "\"Quantity\" > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_order_item_unitprice",
                table: "order_items",
                sql: "\"UnitPrice\" >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_product_price",
                table: "products");

            migrationBuilder.DropCheckConstraint(
                name: "ck_product_stock",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_orders_CreatedAt",
                table: "orders");

            migrationBuilder.DropCheckConstraint(
                name: "ck_order_total",
                table: "orders");

            migrationBuilder.DropCheckConstraint(
                name: "ck_order_item_linetotal",
                table: "order_items");

            migrationBuilder.DropCheckConstraint(
                name: "ck_order_item_quantity",
                table: "order_items");

            migrationBuilder.DropCheckConstraint(
                name: "ck_order_item_unitprice",
                table: "order_items");
        }
    }
}

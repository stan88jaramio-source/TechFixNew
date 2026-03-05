using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechFix.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRepairResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RepairResult",
                table: "Repairs",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RepairResult",
                table: "Repairs");
        }
    }
}

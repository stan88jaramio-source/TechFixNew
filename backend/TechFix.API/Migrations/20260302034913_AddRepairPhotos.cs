using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechFix.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRepairPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Photos",
                table: "Repairs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Photos",
                table: "Repairs");
        }
    }
}

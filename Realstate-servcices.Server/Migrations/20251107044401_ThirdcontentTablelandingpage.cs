using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Realstate_servcices.Server.Migrations
{
    /// <inheritdoc />
    public partial class ThirdcontentTablelandingpage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScheduleProperties_ScheduleTime",
                table: "ScheduleProperties");

            migrationBuilder.CreateTable(
                name: "ThirdSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThirdSections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeatureItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdSectionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeatureItems_ThirdSections_ThirdSectionId",
                        column: x => x.ThirdSectionId,
                        principalTable: "ThirdSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdSectionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessSteps_ThirdSections_ThirdSectionId",
                        column: x => x.ThirdSectionId,
                        principalTable: "ThirdSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeatureItems_ThirdSectionId",
                table: "FeatureItems",
                column: "ThirdSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessSteps_StepNumber",
                table: "ProcessSteps",
                column: "StepNumber");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessSteps_ThirdSectionId_StepNumber",
                table: "ProcessSteps",
                columns: new[] { "ThirdSectionId", "StepNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ThirdSections_CreatedAt",
                table: "ThirdSections",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeatureItems");

            migrationBuilder.DropTable(
                name: "ProcessSteps");

            migrationBuilder.DropTable(
                name: "ThirdSections");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleProperties_ScheduleTime",
                table: "ScheduleProperties",
                column: "ScheduleTime");
        }
    }
}

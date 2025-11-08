using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Realstate_servcices.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixSchedulePropertiesClientRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleProperties_Clients_ClientId",
                table: "ScheduleProperties");

            migrationBuilder.DropIndex(
                name: "IX_Clients_BaseMemberId",
                table: "Clients");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Clients_BaseMemberId",
                table: "Clients",
                column: "BaseMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleProperties_Clients_ClientId",
                table: "ScheduleProperties",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "BaseMemberId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleProperties_Clients_ClientId",
                table: "ScheduleProperties");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Clients_BaseMemberId",
                table: "Clients");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_BaseMemberId",
                table: "Clients",
                column: "BaseMemberId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleProperties_Clients_ClientId",
                table: "ScheduleProperties",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Realstate_servcices.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixSchedulePropertiesAgentRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleProperties_Agents_AgentId",
                table: "ScheduleProperties");

            migrationBuilder.DropIndex(
                name: "IX_Agents_BaseMemberId",
                table: "Agents");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Agents_BaseMemberId",
                table: "Agents",
                column: "BaseMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleProperties_Agents_AgentId",
                table: "ScheduleProperties",
                column: "AgentId",
                principalTable: "Agents",
                principalColumn: "BaseMemberId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleProperties_Agents_AgentId",
                table: "ScheduleProperties");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Agents_BaseMemberId",
                table: "Agents");

            migrationBuilder.CreateIndex(
                name: "IX_Agents_BaseMemberId",
                table: "Agents",
                column: "BaseMemberId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleProperties_Agents_AgentId",
                table: "ScheduleProperties",
                column: "AgentId",
                principalTable: "Agents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

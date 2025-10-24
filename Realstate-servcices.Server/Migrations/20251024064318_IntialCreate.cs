using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Realstate_servcices.Server.Migrations
{
    /// <inheritdoc />
    public partial class IntialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "ScheduleProperties",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "ScheduleProperties",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "ScheduleProperties",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetingLocation",
                table: "ScheduleProperties",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetingType",
                table: "ScheduleProperties",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderSentAt",
                table: "ScheduleProperties",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduleEndTime",
                table: "ScheduleProperties",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "VirtualMeetingLink",
                table: "ScheduleProperties",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AgentAvailabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgentId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgentAvailabilities_Agents_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Agents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AgentScheduleConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgentId = table.Column<int>(type: "int", nullable: false),
                    SlotDurationMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 60),
                    MaxAppointmentsPerDay = table.Column<int>(type: "int", nullable: false, defaultValue: 8),
                    BufferTimeMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 15),
                    AllowWeekendAppointments = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DayStartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    DayEndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    AdvanceBookingDays = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentScheduleConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgentScheduleConfigs_Agents_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Agents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AgentTimeOffs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgentId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentTimeOffs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgentTimeOffs_Agents_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Agents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleProperties_ScheduleNo",
                table: "ScheduleProperties",
                column: "ScheduleNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleProperties_ScheduleTime",
                table: "ScheduleProperties",
                column: "ScheduleTime");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleProperties_Status",
                table: "ScheduleProperties",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AgentAvailabilities_AgentId_DayOfWeek",
                table: "AgentAvailabilities",
                columns: new[] { "AgentId", "DayOfWeek" });

            migrationBuilder.CreateIndex(
                name: "IX_AgentAvailabilities_IsAvailable",
                table: "AgentAvailabilities",
                column: "IsAvailable");

            migrationBuilder.CreateIndex(
                name: "IX_AgentScheduleConfigs_AgentId",
                table: "AgentScheduleConfigs",
                column: "AgentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgentTimeOffs_AgentId_StartDate_EndDate",
                table: "AgentTimeOffs",
                columns: new[] { "AgentId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_AgentTimeOffs_IsApproved",
                table: "AgentTimeOffs",
                column: "IsApproved");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgentAvailabilities");

            migrationBuilder.DropTable(
                name: "AgentScheduleConfigs");

            migrationBuilder.DropTable(
                name: "AgentTimeOffs");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleProperties_ScheduleNo",
                table: "ScheduleProperties");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleProperties_ScheduleTime",
                table: "ScheduleProperties");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleProperties_Status",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "MeetingLocation",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "MeetingType",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "ReminderSentAt",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "ScheduleEndTime",
                table: "ScheduleProperties");

            migrationBuilder.DropColumn(
                name: "VirtualMeetingLink",
                table: "ScheduleProperties");
        }
    }
}

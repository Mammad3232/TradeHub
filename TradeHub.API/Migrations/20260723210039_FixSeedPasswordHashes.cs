using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TradeHub.API.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedPasswordHashes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 11,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 15,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 16,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 17,
                column: "PasswordHash",
                value: "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 11,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 15,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 16,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 17,
                column: "PasswordHash",
                value: "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO");
        }
    }
}

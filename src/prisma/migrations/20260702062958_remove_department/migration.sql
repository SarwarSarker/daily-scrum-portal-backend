-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_department_id_fkey";

-- DropIndex
DROP INDEX "teams_department_id_name_key";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "department_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "department_id";

-- DropTable
DROP TABLE "departments";


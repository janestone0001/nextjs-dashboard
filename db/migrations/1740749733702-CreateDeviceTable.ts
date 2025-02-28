import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeviceTable1740749733702 implements MigrationInterface {
    name = 'CreateDeviceTable1740749733702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`devices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`device\` varchar(255) NOT NULL, \`note\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_afe1c4505ce2127feebf7b6ff1\` (\`device\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_afe1c4505ce2127feebf7b6ff1\` ON \`devices\``);
        await queryRunner.query(`DROP TABLE \`devices\``);
    }

}

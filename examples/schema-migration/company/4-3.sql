/*** Remove company table and disconnect user table ***/

ALTER TABLE "user" DROP CONSTRAINT fk_user;

ALTER TABLE "user" DROP COLUMN company_id;

DROP TABLE "company";

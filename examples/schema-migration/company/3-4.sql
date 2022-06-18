/*** Add company table, insert some data and connect with user table ***/

CREATE TABLE "company"
(
   id serial, 
   company_name character(20) NOT NULL,
   CONSTRAINT pk_company PRIMARY KEY (id), 
   CONSTRAINT uk_company UNIQUE (company_name)
) 
WITH (
  OIDS = FALSE
);

INSERT INTO "company"(company_name)
    VALUES ('Company 1');

ALTER TABLE "user"
  ADD COLUMN company_id integer;

UPDATE "user" SET company_id = 1;

ALTER TABLE "user"
   ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE "user"
  ADD CONSTRAINT fk_user FOREIGN KEY (company_id) REFERENCES company (id) ON UPDATE NO ACTION ON DELETE NO ACTION;


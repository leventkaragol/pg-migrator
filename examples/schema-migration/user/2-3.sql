/*** Add is_admin column to user table ***/

ALTER TABLE "user"
  ADD COLUMN is_admin bit;

UPDATE "user" SET is_admin = '0';

ALTER TABLE "user"
   ALTER COLUMN is_admin SET NOT NULL;

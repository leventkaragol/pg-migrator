/*** Create indexes for user and company tables ***/

CREATE INDEX ix_user
   ON "user" (username ASC NULLS LAST);

CREATE INDEX ix_company
   ON "company" (company_name ASC NULLS LAST);

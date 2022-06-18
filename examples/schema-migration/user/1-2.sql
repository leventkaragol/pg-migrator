/*** Add user and user_login_history tables and insert some data ***/

CREATE TABLE "user"
(
   id serial, 
   username character(20)  NOT NULL, 
   name_surname character(50) NOT NULL, 
   CONSTRAINT pk_user PRIMARY KEY (id), 
   CONSTRAINT uk_user UNIQUE (username)
) 
WITH (
  OIDS = FALSE
);

CREATE TABLE "user_login_history"
(
   id serial, 
   user_id integer NOT NULL, 
   login_date date NOT NULL, 
   CONSTRAINT pk_user_login_history PRIMARY KEY (id), 
   CONSTRAINT fk_user_login_history FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
) 
WITH (
  OIDS = FALSE
);

INSERT INTO "user"(username, name_surname)
    VALUES ('user1', 'User 1');

INSERT INTO "user"(username, name_surname)
    VALUES ('user2', 'User 2');

INSERT INTO user_login_history(user_id, login_date)
    VALUES (1, '2014-01-01');

INSERT INTO user_login_history(user_id, login_date)
    VALUES (1, '2014-01-02');

INSERT INTO user_login_history(user_id, login_date)
    VALUES (2, '2014-02-01');

INSERT INTO user_login_history(user_id, login_date)
    VALUES (2, '2014-02-02');

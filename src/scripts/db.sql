create table user(
id int primary key auto_increment,
username varchar(25) not null unique,
password varchar(500) not null,
role varchar(50),
createdAt timestamp default current_timestamp,
updatedAt timestamp default current_timestamp
)
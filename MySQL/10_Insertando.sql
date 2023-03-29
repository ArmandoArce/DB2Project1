/* Users */
INSERT INTO users (id_users, name_, last_name, password_, userType, birthday)  VALUES 
        (615464189, 'Juan', 'Pérez', DBMS_CRYPTO.HASH(rawtohex('e^UjU97p#B#m') ,2), 'admin', '1990-01-01'),
        (234567890, 'Pedro', 'González', DBMS_CRYPTO.HASH(rawtohex('BmB@78oem4&g') ,2), 'user', '1995-02-15'),
        (345678901, 'María', 'Sánchez', DBMS_CRYPTO.HASH(rawtohex('3CaD74%v3*1@') ,2), 'admin', '1985-06-30'),
        (456789012, 'Ana', 'López', DBMS_CRYPTO.HASH(rawtohex('5Vy8%R!8SNAq') ,2), 'user', '1992-11-20'),
        (567890123, 'Jorge', 'Martínez', DBMS_CRYPTO.HASH(rawtohex('&69Sk!3A4teC') ,2), 'user', '1998-04-10'),
        (678901234, 'Marta', 'Hernández', DBMS_CRYPTO.HASH(rawtohex('kF^18*3B3z3n') ,2), 'admin', '1987-12-25'),
        (789012345, 'Pablo', 'Ramírez', DBMS_CRYPTO.HASH(rawtohex('66!PG!7&Q2cn') ,2), 'user', '1994-08-05'),
        (890123456, 'Sofía', 'García', DBMS_CRYPTO.HASH(rawtohex('1Dp6zYH57@dB') ,2), 'admin', '1983-03-15'),
        (901234567, 'Carlos', 'Fernández', DBMS_CRYPTO.HASH(rawtohex('fb6@4pOPFR6t') ,2), 'user', '1996-07-20'),
        (123450987, 'Luisa', 'Gómez', DBMS_CRYPTO.HASH(rawtohex('v0!60w$nP5po') ,2), 'admin', '1988-05-12');
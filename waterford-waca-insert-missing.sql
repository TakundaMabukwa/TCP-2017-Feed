BEGIN;

WITH wanted(reg) AS (
  VALUES
    ('FV09YCGP'),
    ('FT93RWGP'),
    ('FV09YJGP'),
    ('DW21XCGP'),
    ('DX77VFGP'),
    ('DX77TYGP'),
    ('JB59KZGP'),
    ('JB63LBGP'),
    ('DZ50BSGP'),
    ('DZ50CGGP'),
    ('LC88CNGP'),
    ('LC88CHGP'),
    ('LF40VTGP'),
    ('LF40VXGP'),
    ('FW83SJGP'),
    ('DL89RPGP'),
    ('FW31BTGP'),
    ('FW31BPGP'),
    ('JL64PXGP'),
    ('JN87NPGP'),
    ('JR85LYGP'),
    ('JS99KBGP'),
    ('KF26RFGP'),
    ('KN72LNGP'),
    ('KS19FJGP'),
    ('KS19GNGP'),
    ('HL86MCGP'),
    ('LB11SHGP'),
    ('LB11STGP'),
    ('LB60CYGP'),
    ('LB20MCGP'),
    ('LF91HBGP'),
    ('LR98FNGP'),
    ('LV19NFGP'),
    ('LV49PTGP'),
    ('MF86TZGP'),
    ('MG60LCGP')
),
missing AS (
  SELECT wanted.reg
  FROM wanted
  LEFT JOIN vehicles v
    ON regexp_replace(UPPER(COALESCE(v.reg, '')), '\s+', '', 'g') = wanted.reg
    OR regexp_replace(UPPER(COALESCE(v.plate, '')), '\s+', '', 'g') = wanted.reg
  WHERE v.id IS NULL
)
INSERT INTO vehicles (plate, reg, account_number, created_at)
SELECT reg, reg, 'WACA-0001', NOW()
FROM missing;

SELECT id, plate, reg, account_number
FROM vehicles
WHERE account_number = 'WACA-0001'
ORDER BY reg;

COMMIT;

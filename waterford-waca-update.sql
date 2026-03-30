BEGIN;

-- Preview which vehicles currently have WACA-0001 but are not in the new truck list.
SELECT id, plate, reg, account_number
FROM vehicles
WHERE account_number = 'WACA-0001'
  AND regexp_replace(COALESCE(reg, ''), '\s+', '', 'g') NOT IN (
    'FV09YCGP',
    'FT93RWGP',
    'FV09YJGP',
    'DW21XCGP',
    'DX77VFGP',
    'DX77TYGP',
    'JB59KZGP',
    'JB63LBGP',
    'DZ50BSGP',
    'DZ50CGGP',
    'LC88CNGP',
    'LC88CHGP',
    'LF40VTGP',
    'LF40VXGP',
    'FW83SJGP',
    'DL89RPGP',
    'FW31BTGP',
    'FW31BPGP',
    'JL64PXGP',
    'JN87NPGP',
    'JR85LYGP',
    'JS99KBGP',
    'KF26RFGP',
    'KN72LNGP',
    'KS19FJGP',
    'KS19GNGP',
    'HL86MCGP',
    'LB11SHGP',
    'LB11STGP',
    'LB60CYGP',
    'LB20MCGP',
    'LF91HBGP',
    'LR98FNGP',
    'LV19NFGP',
    'LV49PTGP',
    'MF86TZGP',
    'MG60LCGP'
  )
ORDER BY reg;

-- Remove WACA-0001 from vehicles that should no longer belong to Waterford.
UPDATE vehicles
SET account_number = NULL
WHERE account_number = 'WACA-0001'
  AND regexp_replace(COALESCE(reg, ''), '\s+', '', 'g') NOT IN (
    'FV09YCGP',
    'FT93RWGP',
    'FV09YJGP',
    'DW21XCGP',
    'DX77VFGP',
    'DX77TYGP',
    'JB59KZGP',
    'JB63LBGP',
    'DZ50BSGP',
    'DZ50CGGP',
    'LC88CNGP',
    'LC88CHGP',
    'LF40VTGP',
    'LF40VXGP',
    'FW83SJGP',
    'DL89RPGP',
    'FW31BTGP',
    'FW31BPGP',
    'JL64PXGP',
    'JN87NPGP',
    'JR85LYGP',
    'JS99KBGP',
    'KF26RFGP',
    'KN72LNGP',
    'KS19FJGP',
    'KS19GNGP',
    'HL86MCGP',
    'LB11SHGP',
    'LB11STGP',
    'LB60CYGP',
    'LB20MCGP',
    'LF91HBGP',
    'LR98FNGP',
    'LV19NFGP',
    'LV49PTGP',
    'MF86TZGP',
    'MG60LCGP'
  );

-- Assign WACA-0001 to the first registration in each "&" pair from the workbook.
UPDATE vehicles
SET account_number = 'WACA-0001'
WHERE regexp_replace(COALESCE(reg, ''), '\s+', '', 'g') IN (
  'FV09YCGP',
  'FT93RWGP',
  'FV09YJGP',
  'DW21XCGP',
  'DX77VFGP',
  'DX77TYGP',
  'JB59KZGP',
  'JB63LBGP',
  'DZ50BSGP',
  'DZ50CGGP',
  'LC88CNGP',
  'LC88CHGP',
  'LF40VTGP',
  'LF40VXGP',
  'FW83SJGP',
  'DL89RPGP',
  'FW31BTGP',
  'FW31BPGP',
  'JL64PXGP',
  'JN87NPGP',
  'JR85LYGP',
  'JS99KBGP',
  'KF26RFGP',
  'KN72LNGP',
  'KS19FJGP',
  'KS19GNGP',
  'HL86MCGP',
  'LB11SHGP',
  'LB11STGP',
  'LB60CYGP',
  'LB20MCGP',
  'LF91HBGP',
  'LR98FNGP',
  'LV19NFGP',
  'LV49PTGP',
  'MF86TZGP',
  'MG60LCGP'
);

-- Review the final Waterford set before committing.
SELECT id, plate, reg, account_number
FROM vehicles
WHERE account_number = 'WACA-0001'
ORDER BY reg;

COMMIT;

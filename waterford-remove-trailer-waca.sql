BEGIN;

-- Trailer regs from the Waterford workbook.
-- For paired trailer rows, only the first reg is used.
-- Keep these three under Waterford even though Excel marks them as trailers:
-- LF60WPGP, MK84KSGP, KC93JKGP

SELECT id, plate, reg, account_number
FROM vehicles
WHERE account_number = 'WACA-0001'
  AND regexp_replace(UPPER(COALESCE(reg, '')), '\s+', '', 'g') IN (
    'BN60PLGP',
    'CH69VGGP',
    'RXS985GP',
    'RXS983GP',
    'HJ57WKGP',
    'DS05HRGP',
    'FJ92JJGP',
    'FJ92JCGP',
    'FT53GPGP',
    'DG24ZBGP',
    'CL39JVGP',
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
    'MG60LCGP',
    'HM51RZGP'
  )
ORDER BY reg;

UPDATE vehicles
SET account_number = NULL
WHERE account_number = 'WACA-0001'
  AND regexp_replace(UPPER(COALESCE(reg, '')), '\s+', '', 'g') IN (
    'BN60PLGP',
    'CH69VGGP',
    'RXS985GP',
    'RXS983GP',
    'HJ57WKGP',
    'DS05HRGP',
    'FJ92JJGP',
    'FJ92JCGP',
    'FT53GPGP',
    'DG24ZBGP',
    'CL39JVGP',
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
    'MG60LCGP',
    'HM51RZGP'
  );

SELECT id, plate, reg, account_number
FROM vehicles
WHERE account_number = 'WACA-0001'
ORDER BY reg;

COMMIT;

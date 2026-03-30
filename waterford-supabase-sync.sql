BEGIN;

WITH wanted(plate) AS (
  VALUES
    ('LS38WYGP'),
    ('FM23CWGP'),
    ('FV70YVGP'),
    ('BN60PLGP'),
    ('CH69VGGP'),
    ('RXS985GP'),
    ('RXS983GP'),
    ('HJ57WKGP'),
    ('DS05HRGP'),
    ('FJ92JJGP'),
    ('FJ92JCGP'),
    ('FT53GPGP'),
    ('DG24ZBGP'),
    ('CL39JVGP'),
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
    ('MG60LCGP'),
    ('KC93JKGP'),
    ('LF60WPGP'),
    ('MK84KSGP'),
    ('HM51RZGP'),
    ('YWX933GP'),
    ('FW28SMGP'),
    ('HW65MMGP'),
    ('JM39BBGP'),
    ('JP29YVGP'),
    ('JP29YTGP'),
    ('JP88KFGP'),
    ('JW59VYGP'),
    ('JW59WDGP'),
    ('JW59WJGP'),
    ('KC31RGGP'),
    ('KD57TSGP'),
    ('KL33HWGP'),
    ('FV26GTGP'),
    ('KN41XSGP'),
    ('KP48MNGP'),
    ('KP48MWGP'),
    ('KP48NCGP'),
    ('KP48NFGP'),
    ('KZ89MRGP'),
    ('LF60RGGP'),
    ('LC62WSGP'),
    ('LD08SLGP'),
    ('LD08STGP'),
    ('LD08SSGP'),
    ('LD08SWGP'),
    ('LS34PRGP'),
    ('LS34PMGP'),
    ('LS34PGGP'),
    ('LR78XJGP'),
    ('LR78YGGP'),
    ('LR78ZBGP'),
    ('LR81ZZGP'),
    ('LV75FKGP'),
    ('LV75GCGP'),
    ('MD69KJGP'),
    ('MD69KRGP'),
    ('MF56SKGP'),
    ('MG45YNGP'),
    ('CP09PGGP'),
    ('LD13PHGP')
)

-- Remove WATE-0001 lookup rows that are no longer in the Waterford list.
DELETE FROM public.energyrite_vehicle_lookup evl
WHERE evl.cost_code = 'WATE-0001'
  AND UPPER(COALESCE(evl.plate, '')) NOT IN (
    SELECT plate FROM wanted
  );

-- Add missing Waterford rows.
INSERT INTO public.energyrite_vehicle_lookup (plate, cost_code, created_at)
SELECT wanted.plate, 'WATE-0001', NOW()
FROM wanted
WHERE NOT EXISTS (
  SELECT 1
  FROM public.energyrite_vehicle_lookup evl
  WHERE UPPER(COALESCE(evl.plate, '')) = wanted.plate
);

-- Ensure any existing desired rows carry the right cost code.
UPDATE public.energyrite_vehicle_lookup evl
SET cost_code = 'WATE-0001'
FROM wanted
WHERE UPPER(COALESCE(evl.plate, '')) = wanted.plate;

SELECT id, plate, cost_code, created_at
FROM public.energyrite_vehicle_lookup
WHERE cost_code = 'WATE-0001'
ORDER BY plate;

COMMIT;
